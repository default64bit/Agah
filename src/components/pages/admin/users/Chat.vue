<template>
    <div class="profile_messages bg-transparent flex flex-col w-full h-full">
        <ul class="flex-grow h-full p-2" ref="message_ul" name="message_ul">
            <div class="flex items-center justify-center" v-if="selectedMessageBoard.loading">
                <i class="fad fa-spinner fa-pulse pt-1 my-4 text-primary-500 text-2xl"></i>
            </div>
            <li v-for="(message, i) in selectedMessageBoard.messages" :key="i">
                <transition :name="message.sender == adminInfo._id ? 'slideleft' : 'slideright'" appear>
                    <div class="message_bubble" :class="message.sender == adminInfo._id ? 'sent' : 'received'">
                        <p class="text-sm">{{ message.message }}</p>
                        <div class="flex items-center mt-2 gap-2">
                            <span class="text-xs opacity-60">{{ new Date(message.createdAt).toLocaleString("fa") }}</span>
                            <i class="text-xs opacity-80 far" :class="message.readAt ? 'fa-check-double' : 'fa-check'"></i>
                        </div>
                    </div>
                </transition>
            </li>
            <transition name="slideleft" appear>
                <li v-if="selectedMessageBoard.typing">
                    <div class="message_bubble received typing bg-gray-500 text-primary-500 text-xs"><b class="far fa-ellipsis-h text-xl"></b></div>
                </li>
            </transition>
        </ul>
        <hr class="w-full border-b-2 border-solid border-gray-300 border-opacity-30 my-2" />
        <!-- TODO : upload attachment -->
        <div class="flex items-center gap-2 p-2 rounded-sm bg-gray-300 bg-opacity-20">
            <button class="far fa-paperclip p-2 text-lg"></button>
            <input
                class="flex-grow w-full h-full bg-transparent"
                type="text"
                placeholder="متن پیام..."
                v-model="selectedMessageBoard.draftText"
                @keyup="messageInputKeyup"
            />
            <button class="t_button fad fa-paper-plane" @click="sendMessage()"></button>
        </div>
    </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import axios from "axios";

export default {
    name: "Chat",
    components: {},
    data() {
        return {
            connection: null,
            connectCount: 0,
            connectionReady: false,
            resetSocketInterval: null,

            selectedChat: {},
            typingTimeout: null,
            messageBoard: {},
            selectedMessageBoard: {},
        };
    },
    created() {
        this.selectedMessageBoard = this.defaultSelectedMessageBoard();
    },
    async mounted() {
        this.openSocket();
        
        await this.selectChat();

        this.$refs.message_ul.addEventListener("scroll", this.onMessagesScroll);
    },
    beforeUnmount() {
        this.$refs.message_ul.removeEventListener("scroll", this.onMessagesScroll);
    },
    async beforeRouteUpdate(to, from, next) {
        this.$route.params.id = to.params.id;
        await this.selectChat();
        next();
    },
    computed: {
        ...mapGetters(["adminInfo"]),
    },
    methods: {
        ...mapActions(['makeToast']),

        defaultSelectedMessageBoard() {
            return {
                chatId: "",
                receiverId: "",
                messages: [],
                messagesEnded: false,
                page: 1,
                draftText: "",
                loading: false,
                typing: false,
                canSendMessage: false,
                bookedSchedule: {},
                timeRemained: 0,
            };
        },

        // chat section ===========================================
        async selectChat() {
            await axios
                .get(`${this.getBaseUrl()}/api/v1/admin/user/${this.$route.params.id}/chat`)
                .then((response) => {
                    this.selectedChat = response.data;
                })
                .catch((error) => {
                    if (error.response.data && error.response.data.error) this.makeToast({ message: error.response.data.error, type: "danger" });
                });

            if (typeof this.messageBoard[this.selectedChat.id] === "undefined") {
                this.messageBoard[this.selectedChat.id] = this.defaultSelectedMessageBoard();
                this.messageBoard[this.selectedChat.id]["chatId"] = this.selectedChat.id;
                this.messageBoard[this.selectedChat.id]["receiverId"] = this.selectedChat.receiver;
            }
            this.selectedMessageBoard = this.messageBoard[this.selectedChat.id];

            if (this.selectedMessageBoard.messages.length == 0 && !this.selectedMessageBoard.messagesEnded) {
                await this.loadMessages().then(() => {
                    this.$refs.message_ul.scrollTop = this.$refs.message_ul.scrollHeight;
                });
            }

            // send request to clear out the unread messages
            this.seenMessages();
        },
        // chat section ===========================================

        // messages section ===========================================
        async loadMessages() {
            if (this.selectedMessageBoard.loading || this.selectedMessageBoard.messagesEnded) return;
            this.selectedMessageBoard.loading = true;

            await axios
                .get(`${this.getBaseUrl()}/api/v1/admin/user/${this.$route.params.id}/messages?page=${this.selectedMessageBoard.page}`)
                .then((response) => {
                    if (response.data.messages.length == 0) {
                        this.selectedMessageBoard.messagesEnded = true;
                        return;
                    }

                    let newMessages = response.data.messages;
                    newMessages = newMessages.concat(this.selectedMessageBoard.messages);
                    this.selectedMessageBoard.messages = newMessages;

                    this.selectedMessageBoard.page++;
                })
                .catch((error) => {
                    if (error.response.data && error.response.data.error) {
                        this.makeToast({ message: error.response.data.error, type: "danger" });
                    }
                })
                .finally(() => {
                    this.selectedMessageBoard.loading = false;
                    this.messageBoard[this.selectedMessageBoard.chatId] = this.selectedMessageBoard;
                });
        },
        onMessagesScroll(e) {
            if (e.target.scrollTop <= 15) this.loadMessages();
        },
        sendMessage() {
            if (this.connection.readyState != 1) return;

            this.connection.send(
                JSON.stringify({
                    event: "message",
                    data: {
                        message: this.selectedMessageBoard.draftText,
                        chatId: this.selectedMessageBoard.chatId,
                        receiverId: this.selectedMessageBoard.receiverId,
                    },
                })
            );
            this.selectedMessageBoard.draftText = "";

            setTimeout(() => {
                this.$refs.message_ul.scrollTop = this.$refs.message_ul.scrollHeight;
                this.stopTyping();
            }, 100);
        },
        seenMessages() {
            if (this.connection.readyState == 1) {
                this.connection.send(
                    JSON.stringify({
                        event: "seen",
                        data: { chatId: this.selectedMessageBoard.chatId, receiverId: this.selectedMessageBoard.receiverId },
                    })
                );
            }
        },
        startTyping() {
            if (this.connection.readyState != 1) return;
            this.connection.send(
                JSON.stringify({
                    event: "startTyping",
                    data: { chatId: this.selectedMessageBoard.chatId, receiverId: this.selectedMessageBoard.receiverId },
                })
            );
        },
        stopTyping() {
            if (this.connection.readyState != 1) return;
            this.connection.send(
                JSON.stringify({
                    event: "stopTyping",
                    data: { chatId: this.selectedMessageBoard.chatId, receiverId: this.selectedMessageBoard.receiverId },
                })
            );
        },
        messageInputKeyup(e) {
            if (e.keyCode == 13) this.sendMessage();

            this.startTyping();
            clearTimeout(this.typingTimeout);
            this.typingTimeout = setTimeout(() => {
                this.stopTyping();
            }, 2000);
        },
        // messages section ===========================================

        // socket managment section ===========================================
        openSocket() {
            if (this.connection && this.connection.readyState != 3) return;
            if (this.connectCount > 5) return;

            let url = this.getBaseUrl().replace("http", "ws");
            try {
                this.connection = new WebSocket(`${url}/sock/v2/ISM`);
                this.connection.onopen = this.socketOnOpen;
                this.connection.onclose = this.socketOnClose;
                this.connection.onmessage = this.socketOnMessage;
                this.connection.onerror = () => this.connectCount++;
            } catch (e) {}
        },
        socketOnOpen(event) {
            clearInterval(this.resetSocketInterval);
            this.resetSocketInterval = null;
            this.connectionReady = true;
            this.connectCount = 0;
        },
        socketOnClose(event) {
            if (this.resetSocketInterval != null) return;

            this.resetSocketInterval = setInterval(() => {
                this.openSocket();
            }, 3000);
            this.connectionReady = false;
        },
        socketOnMessage(event) {
            const data = JSON.parse(event.data);
            let isMessagesOpen = false;
            switch (data.event) {
                case "messageCB":
                    const msg = data.message;
                    isMessagesOpen = data.chatId == this.selectedMessageBoard.chatId;
                    let isSender = msg.sender._id == this.adminInfo._id;

                    if (isMessagesOpen) {
                        // if user is in the messages: fill only the selectedMessageBoard (and send a readAt request if the message is from other person)
                        this.selectedMessageBoard.messages = this.selectedMessageBoard.messages.concat(msg);
                        if (!isSender) {
                            // send readAt(seen) request
                            this.seenMessages();
                            setTimeout(() => (this.$refs.message_ul.scrollTop = this.$refs.message_ul.scrollHeight), 100);
                        }
                    } else {
                        // if user is not in the messages: fill only the messageBoard messages
                        if (this.messageBoard[data.chatId]) this.messageBoard[data.chatId].messages = this.messageBoard[data.chatId].messages.concat(msg);
                    }

                    // update the last message in chats
                    if (this.chats.length == 0) {
                        this.chats = [];
                        this.chatPageNumber = 1;
                        this.chatListEnded = false;
                        this.loadChatList();
                    }

                    break;
                case "seenCB":
                    isMessagesOpen = data.chatId == this.selectedMessageBoard.chatId;

                    if (data.senderId == this.adminInfo._id) {
                        // set readAt of all recievd messages that have no readAt to data.time in selectedMessageBoard
                        this.selectedMessageBoard.messages.forEach((message) => {
                            if (message.sender == data.otherUserId && !message.readAt) message.readAt = data.time;
                        });
                    } else {
                        if (isMessagesOpen) {
                            // set readAt of all sent messages that have no readAt to data.time in selectedMessageBoard
                            this.selectedMessageBoard.messages.forEach((message) => {
                                if (message.receiver == data.otherUserId && !message.readAt) message.readAt = data.time;
                            });
                        } else {
                            // set readAt of all sent messages that have no readAt to data.time in messageBoard
                            if (this.messageBoard[data.chatId]) {
                                this.messageBoard[data.chatId].messages.forEach((message) => {
                                    if (message.receiver == data.otherUserId && !message.readAt) message.readAt = data.time;
                                });
                            }
                        }
                    }
                    break;
                case "startTypingCB":
                    isMessagesOpen = data.chatId == this.selectedMessageBoard.chatId;
                    if (isMessagesOpen) {
                        // if user is in the messages update "typing" of selectedMessageBoard
                        this.selectedMessageBoard.typing = true;

                        // and if scrollTop is at the bottom make sure to set it equal to scrollHeight
                        // let scrollDown = false;
                        // if (this.$refs.message_ul.scrollHeight - this.$refs.message_ul.scrollTop <= 100) scrollDown = true;
                        // if (scrollDown) this.$refs.message_ul.scrollTop = this.$refs.message_ul.scrollHeight;
                        this.$refs.message_ul.scrollTop = this.$refs.message_ul.scrollHeight;
                    } else {
                        // if user is not in the messages update "typing" of messageBoard
                        if (this.messageBoard[data.chatId]) this.messageBoard[data.chatId].typing = true;
                    }
                    break;
                case "stopTypingCB":
                    isMessagesOpen = data.chatId == this.selectedMessageBoard.email;
                    if (isMessagesOpen) {
                        // if user is in the messages update "typing" of selectedMessageBoard
                        this.selectedMessageBoard.typing = false;
                    } else {
                        // if user is not in the messages update "typing" of messageBoard
                        if (this.messageBoard[data.chatId]) this.messageBoard[data.chatId].typing = false;
                    }
                    break;
            }
        },
        // socket managment section ===========================================
    },
};
</script>

<style></style>
