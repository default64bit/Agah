<template>
    <teleport to="body">
        <div class="message_board" :class="{ open: isOpen }" ref="message_board">
            <small class="text-violet-300 mb-2" v-if="!connectionReady">Connecting...</small>
            <div class="flex flex-wrap items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                    <button class="t_button p-1 text-violet-400 hover:bg-gray-600" @click="back()" v-if="page != 'chats'">
                        <i class="far fa-arrow-left"></i>
                    </button>
                    <h2 class="text-3xl" v-if="page == 'chats'">Messages</h2>
                    <div class="flex items-center gap-2" v-if="page == 'messages'">
                        <div class="chat_avatar border-violet-400">
                            <img :src="selectedChat.avatar" alt="" />
                        </div>
                        <b class="text-xl flex-grow overflow-hidden overflow-ellipsis">{{ selectedChat.fullName }}</b>
                    </div>
                </div>
                <button class="t_button p-1 text-violet-400 hover:bg-gray-600" @click="close()"><i class="far fa-times"></i></button>
            </div>
            <hr class="my-4 border-gray-600 border-solid" />

            <div class="message_board_page" name="chats" v-show="page == 'chats'">
                <ul ref="chat_ul" name="chat_ul">
                    <transition-group name="slideright" appear>
                        <li v-for="(chat, i) in chats" :key="i" @click="goToMessages(chat)">
                            <div class="chat_avatar" :class="{ 'border-violet-400': chat.hasNew }">
                                <img :src="chat.avatar" alt="" />
                            </div>
                            <div class="chat_info flex flex-col">
                                <div class="flex items-center justify-between gap-4">
                                    <b class="flex-grow overflow-hidden">{{ chat.fullName }}</b>
                                    <div class="text-xs text-gray-400" v-if="chat.lastMsg">
                                        {{ new Date(chat.lastMsg.createdAt).toLocaleDateString("en") }}
                                    </div>
                                </div>
                                <div class="flex items-center justify-between gap-4">
                                    <p class="text-sm text-gray-300" v-if="chat.lastMsg">{{ chat.lastMsg.message }}</p>
                                    <i class="fad fa-circle text-violet-500" v-if="chat.hasNew"></i>
                                </div>
                            </div>
                        </li>
                    </transition-group>
                    <div class="flex items-center justify-center" v-if="loadingChat">
                        <i class="fad fa-spinner fa-spin my-4 text-violet-400 text-2xl"></i>
                    </div>
                </ul>
                <transition name="slideup" mode="out-in" appear="">
                    <button class="new_chat t_button bg-violet-500 hover:bg-violet-600" v-if="!newChatBtnHide" @click="goToPeople()">
                        <i class="fas fa-plus"></i>
                    </button>
                </transition>
            </div>

            <div class="message_board_page" name="messages" v-show="page == 'messages'">
                <ul class="mb-4" ref="message_ul" name="message_ul">
                    <div class="flex items-center justify-center" v-if="selectedMessageBoard.loading">
                        <i class="fad fa-spinner fa-spin my-4 text-violet-400 text-2xl"></i>
                    </div>
                    <li v-for="(message, i) in selectedMessageBoard.messages" :key="i">
                        <transition :name="message.sender.email == adminInfo.email ? 'slideleft' : 'slideright'" appear>
                            <div class="message_bubble" :class="message.sender.email == adminInfo.email ? 'sent' : 'received'">
                                <p>{{ message.message }}</p>
                                <div class="flex items-center mt-2 gap-2">
                                    <span class="text-xs opacity-60">{{ new Date(message.createdAt).toLocaleString("en") }}</span>
                                    <i class="text-xs opacity-80 far" :class="message.readAt ? 'fa-check-double' : 'fa-check'"></i>
                                </div>
                            </div>
                        </transition>
                    </li>
                    <transition name="slideleft" appear>
                        <li v-if="selectedMessageBoard.typing">
                            <div class="message_bubble received bg-gray-500 text-violet-400 text-xs"><b>Typing...</b></div>
                        </li>
                    </transition>
                </ul>
                <div class="flex items-center mt-auto p-2 bg-gray-700 rounded">
                    <input
                        class="flex-grow px-2 bg-gray-700"
                        v-model="selectedMessageBoard.draftText"
                        placeholder="Type Your Message..."
                        dir="auto"
                        @keyup="messageInputKeyup"
                    />
                    <span class="far fa-horizontal-rule fa-rotate-90 text-gray-500"></span>
                    <button class="t_button shadow-none p-1 text-xl text-violet-500" @click="sendMessage()">
                        <i class="fad fa-paper-plane"></i>
                    </button>
                </div>
            </div>

            <div class="message_board_page" name="peoples" v-show="page == 'peoples'">
                <ul ref="people_ul" name="people_ul">
                    <transition-group name="slideright" appear>
                        <li v-for="(people, i) in peoples" :key="i" @click="goToMessages(people)">
                            <div class="chat_avatar">
                                <img :src="people.avatar" alt="" />
                            </div>
                            <div class="chat_info flex flex-col">
                                <b class="flex-grow text-xl overflow-hidden">{{ people.fullName }}</b>
                                <i class="text-xs text-gray-400">{{ people.email }}</i>
                            </div>
                        </li>
                    </transition-group>
                    <div class="flex items-center justify-center" v-if="loadingPeople">
                        <i class="fad fa-spinner fa-spin my-4 text-violet-400 text-2xl"></i>
                    </div>
                </ul>
            </div>
        </div>
    </teleport>
</template>

<script>
import { mapGetters } from "vuex";
import axios from "axios";

export default {
    name: "MessageBoard",
    props: ["isOpen", "isThereNew"],
    components: {},
    data() {
        return {
            connection: null,
            connectCount: 0,
            connectionReady: false,
            resetSocketInterval: null,

            page: "chats",
            typingTimeout: null,

            chats: [],
            selectedChat: {},
            chatPageNumber: 1,
            chatListEnded: false,
            loadingChat: false,
            newChatBtnHide: false,

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
        this.$refs.people_ul.addEventListener("scroll", this.onPeopleScroll);
    },
    beforeUnmount() {
        this.$refs.chat_ul.removeEventListener("scroll", this.onChatScroll);
        this.$refs.message_ul.removeEventListener("scroll", this.onMessagesScroll);
        this.$refs.people_ul.removeEventListener("scroll", this.onPeopleScroll);
    },
    computed: {
        ...mapGetters(["makeToast","adminInfo"]),
    },
    methods: {
        defaultSelectedMessageBoard() {
            return {
                userId: "",
                email: "",
                messages: [],
                messagesEnded: false,
                page: 1,
                draftText: "",
                loading: false,
                typing: false,
            };
        },
        close() {
            this.$emit("update:isOpen", false);
            this.back();
        },
        back() {
            this.page = "chats";

            if (this.messageBoard[this.selectedMessageBoard.email]) {
                this.messageBoard[this.selectedMessageBoard.email] = this.selectedMessageBoard;
                this.selectedMessageBoard = this.defaultSelectedMessageBoard;
            }
        },

        // chat section ===========================================
        async loadChatList() {
            if (this.loadingChat || this.chatListEnded) return;
            this.loadingChat = true;

            await axios
                .get(`${this.getBaseUrl()}/api/v1/admin/message_board/chats?page=${this.chatPageNumber}`)
                .then((response) => {
                    if (response.data.length == 0) {
                        this.chatListEnded = true;
                        return;
                    }
                    this.chats = this.chats.concat(response.data);
                    this.chatPageNumber++;

                    for (const chat of response.data) {
                        if (chat.hasNew) {
                            this.$emit("update:isThereNew", true);
                            break;
                        }
                    }
                })
                .catch((error) => {
                    if (error.response.data && error.response.data.error) {
                        this.makeToast({
                            message: error.response.data.error,
                            type: "danger",
                        });
                    }
                })
                .finally(() => {
                    this.loadingChat = false;
                });
        },
        onChatScroll(e) {
            if (e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight - 10) {
                this.loadChatList();
            }

            if (e.target.scrollHeight - e.target.scrollTop > e.target.clientHeight - 100) this.newChatBtnHide = true;
            else this.newChatBtnHide = false;
        },
        // chat section ===========================================

        // messages section ===========================================
        async goToMessages(chat) {
            this.page = "messages";
            this.selectedChat = chat;

            if (typeof this.messageBoard[chat.email] === "undefined") {
                this.messageBoard[chat.email] = this.defaultSelectedMessageBoard();
                this.messageBoard[chat.email]["userId"] = chat.id;
                this.messageBoard[chat.email]["email"] = chat.email;
            }
            this.selectedMessageBoard = this.messageBoard[chat.email];

            if (this.selectedMessageBoard.messages.length == 0 && !this.selectedMessageBoard.messagesEnded) {
                await this.loadMessages();
            }

            setTimeout(() => {
                this.$refs.message_ul.scrollTop = this.$refs.message_ul.scrollHeight;
            }, 100);

            // send request to clear out the unread messages
            this.seenMessages();
        },
        async loadMessages() {
            if (this.selectedMessageBoard.loading || this.selectedMessageBoard.messagesEnded) return;
            this.selectedMessageBoard.loading = true;

            await axios
                .get(
                    `${this.getBaseUrl()}/api/v1/admin/message_board/messages?page=${this.selectedMessageBoard.page}&userId=${this.selectedMessageBoard.userId}`
                )
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
                        this.makeToast({
                            message: error.response.data.error,
                            type: "danger",
                        });
                    }
                })
                .finally(() => {
                    this.selectedMessageBoard.loading = false;
                    this.messageBoard[this.selectedMessageBoard.email] = this.selectedMessageBoard;
                });
        },
        onMessagesScroll(e) {
            if (e.target.scrollTop <= 15) {
                this.loadMessages();
            }
        },
        sendMessage() {
            if (this.connection.readyState != 1) return;

            this.connection.send(
                JSON.stringify({
                    event: "message",
                    data: { message: this.selectedMessageBoard.draftText, userId: this.selectedMessageBoard.userId, email: this.selectedMessageBoard.email },
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
                        data: {
                            userId: this.selectedMessageBoard.userId,
                            email: this.selectedMessageBoard.email,
                        },
                    })
                );
            }
        },
        startTyping() {
            if (this.connection.readyState != 1) return;
            this.connection.send(
                JSON.stringify({
                    event: "startTyping",
                    data: { userId: this.selectedMessageBoard.userId, email: this.selectedMessageBoard.email },
                })
            );
        },
        stopTyping() {
            if (this.connection.readyState != 1) return;
            this.connection.send(
                JSON.stringify({
                    event: "stopTyping",
                    data: { userId: this.selectedMessageBoard.userId, email: this.selectedMessageBoard.email },
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
                let test = (this.connection = new WebSocket(`${url}/sock/v1/ISM`));
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
                    isMessagesOpen = msg.receiver.email == this.selectedMessageBoard.email || msg.sender.email == this.selectedMessageBoard.email;
                    let isSender = msg.sender.email == this.adminInfo.email;

                    if (isMessagesOpen) {
                        // if user is in the messages: fill only the selectedMessageBoard (and send a readAt request if the message is from other person)
                        this.selectedMessageBoard.messages = this.selectedMessageBoard.messages.concat(msg);
                        if (!isSender) {
                            // send readAt(seen) request
                            this.seenMessages();
                            setTimeout(() => {
                                this.$refs.message_ul.scrollTop = this.$refs.message_ul.scrollHeight;
                            }, 100);
                        }
                    } else {
                        // if user is not in the messages: fill only the messageBoard messages
                        if (this.messageBoard[msg.sender.email]) {
                            this.messageBoard[msg.sender.email].messages = this.messageBoard[msg.sender.email].messages.concat(msg);
                        }
                    }

                    // update the last message in chats
                    for (let i = 0; i < this.chats.length; i++) {
                        if (this.chats[i].email == msg.sender.email || this.chats[i].email == msg.receiver.email) {
                            this.chats[i].lastMsg.message = msg.message;
                            this.chats[i].lastMsg.createdAt = msg.createdAt;
                            if (!isMessagesOpen && !isSender) this.chats[i].hasNew = true;

                            // also bring that chat to the top of the chatList
                            let chat = this.chats[i];
                            this.chats.splice(i, 1);
                            this.chats.unshift(chat);
                        } else {
                            this.chats = [];
                            this.chatPageNumber = 1;
                            this.chatListEnded = false;
                            this.loadChatList();
                        }
                    }
                    if (this.chats.length == 0) {
                        this.chats = [];
                        this.chatPageNumber = 1;
                        this.chatListEnded = false;
                        this.loadChatList();
                    }

                    break;
                case "seenCB":
                    isMessagesOpen = data.userEmail == this.selectedMessageBoard.email;

                    if (data.callerEmail == this.adminInfo.email) {
                        // set readAt of all recievd messages that have no readAt to data.time in selectedMessageBoard
                        this.selectedMessageBoard.messages.forEach((message) => {
                            if (message.sender.email == data.userEmail && !message.readAt) {
                                message.readAt = data.time;
                            }
                        });

                        // also set readAt for chat lastMsg if the lastMsg is a recieved message
                        for (let i = 0; i < this.chats.length; i++) {
                            if (this.chats[i].email == data.userEmail && this.chats[i].lastMsg.sender == data.userId) {
                                this.chats[i].lastMsg.readAt = data.time;
                                this.chats[i].hasNew = false;
                            }
                        }
                    } else {
                        if (isMessagesOpen) {
                            // set readAt of all sent messages that have no readAt to data.time in selectedMessageBoard
                            this.selectedMessageBoard.messages.forEach((message) => {
                                if (message.receiver.email == data.userEmail && !message.readAt) {
                                    message.readAt = data.time;
                                }
                            });
                        } else {
                            // set readAt of all sent messages that have no readAt to data.time in messageBoard
                            if (this.messageBoard[data.userEmail]) {
                                this.messageBoard[data.userEmail].messages.forEach((message) => {
                                    if (message.receiver.email == data.userEmail && !message.readAt) {
                                        message.readAt = data.time;
                                    }
                                });
                            }
                        }

                        // also set readAt for chat lastMsg if the lastMsg is a sent message
                        for (let i = 0; i < this.chats.length; i++) {
                            if (this.chats[i].email == data.userEmail && this.chats[i].lastMsg.receiver == data.userId) {
                                this.chats[i].lastMsg.readAt = data.time;
                                this.chats[i].hasNew = false;
                            }
                        }
                    }

                    // TODO
                    // make function to check and update "isThereNew" prop
                    break;
                case "startTypingCB":
                    isMessagesOpen = data.userEmail == this.selectedMessageBoard.email;

                    if (isMessagesOpen) {
                        let scrollDown = false;
                        if (this.$refs.message_ul.scrollHeight - this.$refs.message_ul.scrollTop <= 100) scrollDown = true;
                        console.log(scrollDown);

                        // if user is in the messages update "typing" of selectedMessageBoard
                        this.selectedMessageBoard.typing = true;

                        // and if scrollTop is at the bottom make sure to set it equal to scrollHeight
                        // if (scrollDown) this.$refs.message_ul.scrollTop = this.$refs.message_ul.scrollHeight;
                        this.$refs.message_ul.scrollTop = this.$refs.message_ul.scrollHeight;
                    } else {
                        // if user is not in the messages update "typing" of messageBoard
                        if (this.messageBoard[data.userEmail]) {
                            this.messageBoard[data.userEmail].typing = true;
                        }
                    }
                    break;
                case "stopTypingCB":
                    isMessagesOpen = data.userEmail == this.selectedMessageBoard.email;

                    if (isMessagesOpen) {
                        // if user is in the messages update "typing" of selectedMessageBoard
                        this.selectedMessageBoard.typing = false;
                    } else {
                        // if user is not in the messages update "typing" of messageBoard
                        if (this.messageBoard[data.userEmail]) {
                            this.messageBoard[data.userEmail].typing = false;
                        }
                    }
                    break;
            }
        },
        // socket managment section ===========================================

        // new chat sections ================================
        goToPeople() {
            this.page = "peoples";
            if (this.peoplePageNumber == 1) {
                this.loadPeople();
            }
        },
        async loadPeople() {
            if (this.loadingPeople || this.peoplesEnded) return;
            this.loadingPeople = true;

            await axios
                .get(`${this.getBaseUrl()}/api/v1/admin/message_board/peoples?page=${this.peoplePageNumber}`)
                .then((response) => {
                    if (response.data.length == 0) {
                        this.peoplesEnded = true;
                        return;
                    }

                    this.peoples = this.peoples.concat(response.data);

                    this.peoplePageNumber++;
                })
                .catch((error) => {
                    if (error.response.data && error.response.data.error) {
                        this.makeToast({
                            message: error.response.data.error,
                            type: "danger",
                        });
                    }
                })
                .finally(() => {
                    this.loadingPeople = false;
                });
        },
        onPeopleScroll(e) {
            if (e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight - 10) {
                this.loadPeople();
            }
        },
        // new chat sections ================================
    },
};
</script>

<style></style>
