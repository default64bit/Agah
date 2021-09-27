<template>
    <div class="flex flex-col items-center md:items-start gap-2 w-full">
        <span class="heading mb-4 w-max">
            <h4 class="f-nazanin font-bold text-3xl">پیام های مشاوره</h4>
            <small class="f-copgoth text-xs">Consultation Messages</small>
        </span>

        <small class="" v-if="!connectionReady"><i class="fal fa-spinner fa-spin text-xs text-primary-500"></i> درحال اتصال...</small>

        <div class="profile_messages flex p-2 w-full rounded-sm base_shadow relative">
            <div class="pl-2 border-l-2 border-solid border-gray-300 border-opacity-30 flex-shrink-0">
                <ul class="flex flex-col gap-2" ref="chat_ul">
                    <li
                        class="flex items-center gap-2 p-2 cursor-pointer rounded-sm"
                        :class="{ 'bg-gray-300 bg-opacity-20': chat.id == selectedChat.id }"
                        v-for="(chat, i) in chats"
                        :key="i"
                        @click="selectChat(chat)"
                    >
                        <img class="w-8 h-8 object-cover rounded-full" :src="chat.image" alt="" />
                        <strong>{{ chat.fullName }}</strong>
                        <span class="w-2 h-2 rounded-full bg-primary-500 mt-1" v-if="chat.hasNew"></span>
                    </li>
                </ul>
                <div class="flex items-center justify-center" v-if="loadingChat">
                    <i class="fal fa-spinner fa-pulse pt-1 text-primary-500 text-3xl"></i>
                </div>
            </div>
            <div class="lg:flex flex-col gap-2 min-h-full flex-grow absolute lg:relative pr-2" :class="{ hidden: !showMessages }">
                <button class="btn p-1 w-max text-rose-500 lg:hidden" @click="showMessages = false"><i class="far fa-times"></i></button>
                <div></div>
                <ul class="pl-2" ref="message_ul" name="message_ul">
                    <div class="flex items-center justify-center" v-if="selectedMessageBoard.loading">
                        <i class="fad fa-spinner fa-pulse pt-1 my-4 text-primary-500 text-2xl"></i>
                    </div>
                    <li v-for="(message, i) in selectedMessageBoard.messages" :key="i">
                        <transition :name="message.sender == userInfo._id ? 'slideleft' : 'slideright'" appear>
                            <div class="message_bubble" :class="message.sender == userInfo._id ? 'sent' : 'received'">
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
                            <div class="message_bubble received bg-gray-500 text-primary-500 text-xs"><b>Typing...</b></div>
                        </li>
                    </transition>
                </ul>
                <hr class="w-full border-b-2 border-solid border-gray-300 border-opacity-30" />
                <!-- TODO : upload attachment -->
                <div class="flex items-center gap-2 p-2 rounded-sm bg-gray-300 bg-opacity-20" v-show="!!selectedMessageBoard.chatId">
                    <button class="far fa-paperclip p-2 text-lg"></button>
                    <input
                        class="flex-grow w-full h-full bg-transparent"
                        type="text"
                        placeholder="متن پیام..."
                        v-model="selectedMessageBoard.draftText"
                        @keyup="messageInputKeyup"
                    />
                    <button class="btn w-8 h-8 px-2 fad fa-paper-plane" @click="sendMessage()"></button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapGetters } from "vuex";
import axios from "axios";

export default {
    name: "UserChats",
    data() {
        return {
            connection: null,
            connectCount: 0,
            connectionReady: false,
            resetSocketInterval: null,

            typingTimeout: null,

            chats: [],
            selectedChat: {},
            chatPageNumber: 1,
            chatListEnded: false,
            loadingChat: false,

            showMessages: false,
            messageBoard: {},
            selectedMessageBoard: {},

            peoples: [],
            peoplesEnded: false,
            loadingPeople: false,
            peoplePageNumber: 1,
        };
    },
    created() {
        this.selectedMessageBoard = this.defaultSelectedMessageBoard();
    },
    async mounted() {
        await this.loadChatList();

        this.openSocket();

        this.$refs.chat_ul.addEventListener("scroll", this.onChatScroll);
        this.$refs.message_ul.addEventListener("scroll", this.onMessagesScroll);
    },
    beforeUnmount() {
        this.$refs.chat_ul.removeEventListener("scroll", this.onChatScroll);
        this.$refs.message_ul.removeEventListener("scroll", this.onMessagesScroll);
    },
    computed: {
        ...mapGetters(["makeToast", "userInfo"]),
    },
    methods: {
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
            };
        },

        // chat section ===========================================
        async loadChatList() {
            if (this.loadingChat || this.chatListEnded) return;
            this.loadingChat = true;

            await axios
                .get(`${this.getBaseUrl()}/api/v1/web/chats?page=${this.chatPageNumber}`)
                .then((response) => {
                    if (response.data.length == 0) {
                        this.chatListEnded = true;
                        return;
                    }
                    this.chats = this.chats.concat(response.data);
                    this.chatPageNumber++;
                })
                .catch((error) => {
                    if (error.response.data && error.response.data.error) {
                        this.makeToast({ message: error.response.data.error, type: "danger" });
                    }
                })
                .finally(() => {
                    this.loadingChat = false;
                });
        },
        onChatScroll(e) {
            if (e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight - 10) this.loadChatList();
        },
        async selectChat(chat) {
            if (chat.id != this.selectedChat.id) {
                this.selectedChat = chat;

                if (typeof this.messageBoard[chat.id] === "undefined") {
                    this.messageBoard[chat.id] = this.defaultSelectedMessageBoard();
                    this.messageBoard[chat.id]["chatId"] = chat.id;
                    this.messageBoard[chat.id]["receiverId"] = chat.receiver;
                }
                this.selectedMessageBoard = this.messageBoard[chat.id];

                if (this.selectedMessageBoard.messages.length == 0 && !this.selectedMessageBoard.messagesEnded) {
                    await this.loadMessages().then(() => {
                        this.$refs.message_ul.scrollTop = this.$refs.message_ul.scrollHeight;
                    });
                }

                // send request to clear out the unread messages
                this.seenMessages();
            }
        },
        // chat section ===========================================

        // messages section ===========================================
        async loadMessages() {
            if (this.selectedMessageBoard.loading || this.selectedMessageBoard.messagesEnded) return;
            this.selectedMessageBoard.loading = true;

            await axios
                .get(`${this.getBaseUrl()}/api/v1/web/chat/${this.selectedMessageBoard.chatId}/messages?page=${this.selectedMessageBoard.page}`)
                .then((response) => {
                    if (response.data.length == 0) {
                        this.selectedMessageBoard.messagesEnded = true;
                        return;
                    }

                    let newMessages = response.data;
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
                    let isSender = msg.sender._id == this.userInfo._id;

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

                    if (data.senderId == this.userInfo._id) {
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
