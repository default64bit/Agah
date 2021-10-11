<template>
    <div class="flex flex-col items-center md:items-start gap-2 w-full">
        <span class="heading mb-4 w-max">
            <h4 class="f-nazanin font-bold text-3xl">پیام های مشاوره</h4>
            <small class="f-copgoth text-xs">Consultation Messages</small>
        </span>

        <small class="" v-if="!connectionReady"><i class="fal fa-spinner fa-spin text-xs text-primary-500"></i> درحال اتصال...</small>

        <div class="profile_messages flex p-2 rounded-sm base_shadow w-full z-10">
            <div
                class="pl-2 border-l-2 border-solid border-gray-300 border-opacity-30 flex-shrink-0 lg:w-max"
                :class="!showMessages ? 'w-full' : 'hidden lg:block'"
            >
                <span class="flex flex-col gap-2 mt-2" v-if="chats.length == 0 && !loadingChat">
                    <p>برای دریافت مشاوره آنلاین باید ابتدا وقت مشاوره رزرو کنید</p>
                    <router-link class="btn py-2 text-sm" to="/consultation-time-booking">رزرو وقت مشاوره</router-link>
                </span>
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
            <div class="flex flex-col gap-2 min-h-full flex-grow pr-2 lg:w-full" :class="showMessages ? 'w-full' : 'hidden lg:flex'">
                <div class="flex flex-wrap items-center gap-2 w-full" v-show="!!selectedMessageBoard.chatId">
                    <button class="btn p-1 w-max text-rose-500 lg:hidden" @click="showMessages = false"><i class="far fa-times"></i></button>
                    <call-controller v-show="!!selectedMessageBoard.canSendMessage">
                        <template v-slot:callBtn="{ call }">
                            <button
                                class="btn p-1 w-max bg-emerald-400 hover:bg-emerald-500 text-white"
                                @click="call(selectedMessageBoard.receiverId, selectedChat.fullName, selectedChat.image)"
                                title="تماس"
                            >
                                <i class="fas fa-phone"></i>
                            </button>
                        </template>
                    </call-controller>
                    <span class="far fa-horizontal-rule fa-rotate-90 text-gray-400 opacity-25" v-if="!!selectedMessageBoard.canSendMessage"></span>
                    <strong v-if="!!selectedMessageBoard.timeRemained">
                        <i class="fad fa-hourglass-half fa-spin font-normal" style="padding-top:2px;"></i>
                        {{ new Date(selectedMessageBoard.timeRemained * 1000).toISOString().substr(11, 8) }}
                    </strong>
                    <span class="far fa-horizontal-rule fa-rotate-90 text-gray-400 opacity-25" v-if="!!selectedMessageBoard.canSendMessage"></span>
                    <div class="flex items-center gap-1">
                        <span class="far fa-file-alt"></span>
                        <strong dir="ltr">
                            {{ `${selectedMessageBoard.bookedSchedule.uploadedFileCount || 0} / ${selectedMessageBoard.maxUploadCount}` }}
                        </strong>
                    </div>
                </div>
                <ul class="pl-2 pt-2 border-t-2 border-solid border-gray-300 border-opacity-20" ref="message_ul" name="message_ul">
                    <div class="flex items-center justify-center" v-if="selectedMessageBoard.loading">
                        <i class="fad fa-spinner fa-pulse pt-1 my-4 text-primary-500 text-2xl"></i>
                    </div>
                    <li v-for="(message, i) in selectedMessageBoard.messages" :key="i">
                        <transition :name="message.sender == userInfo._id ? 'slideleft' : 'slideright'" appear>
                            <div class="message_bubble" :class="message.sender == userInfo._id ? 'sent' : 'received'">
                                <a
                                    class="flex items-center flex-wrap gap-1 mb-2 bg-gray-50 p-1 rounded-sm w-max text-gray-700"
                                    v-for="(file, f) in message.files"
                                    :key="f"
                                    :href="`/file/${file._id}`"
                                    :download="file.name"
                                >
                                    <i class="fad fa-file text-xl"></i>
                                    <span class="text-sm">{{ file.name }}</span>
                                </a>
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
                <hr class="w-full border-b-2 border-solid border-gray-300 border-opacity-30" />
                <div class="flex flex-col w-full gap-2" v-show="!!selectedMessageBoard.chatId">
                    <ul class="flex items-center flex-wrap gap-2" :class="{ 'opacity-50 cursor-wait': uploadingFiles }" v-show="!!files.length">
                        <li class="flex items-start flex-wrap gap-2 p-2 bg-gray-400 bg-opacity-25 rounded-sm" v-for="(file, i) in files" :key="i">
                            <div class="flex flex-col">
                                <span class="max-w-screen-2xs overflow-hidden overflow-ellipsis">{{ file.name }}</span>
                                <small class="opacity-75" dir="ltr">{{ parseFloat(file.size / 1048576).toFixed(2) }} MB</small>
                            </div>
                            <button class="btn p-1" @click="removeFile(i)"><i class="far fa-trash-alt text-red-300 opacity-75"></i></button>
                        </li>
                    </ul>
                    <div class="flex items-center flex-wrap gap-2" v-show="uploadingFiles">
                        <small class="opacity-75">درحال آپلود فایل</small>
                        <div class="t_progress_bar bg-gray-600 w-40 h-2 rounded-full shadow">
                            <div class="h-2 bg-secondary-400 rounded-full" :style="`width:${uploadingFilesPercentage}%`"></div>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 p-2 rounded-sm bg-gray-300 bg-opacity-20" v-if="!!selectedMessageBoard.canSendMessage">
                        <input class="opacity-0 hidden" ref="file_input" type="file" multiple @change="selectFiles()" />
                        <button class="far fa-paperclip p-2 text-lg" @click="openFileSelector()" v-if="!uploadingFiles"></button>
                        <span class="far fa-spinner fa-spin p-2 text-lg" v-else></span>
                        <input
                            class="flex-grow w-full h-full bg-transparent"
                            type="text"
                            placeholder="متن پیام..."
                            v-model="selectedMessageBoard.draftText"
                            @keyup="messageInputKeyup"
                        />
                        <button class="btn w-8 h-8 px-2 fad fa-paper-plane" @click="sendMessage()"></button>
                    </div>
                    <div
                        class="flex flex-col gap-2 bg-gray-300 bg-opacity-25 p-2"
                        v-if="!selectedMessageBoard.canSendMessage && !!selectedMessageBoard.bookedSchedule.date"
                    >
                        <span class="flex items-center flex-wrap gap-2">
                            <p>زمان رزرو شده برای مشاوره آنلاین شما تاریخ</p>
                            <span class="bg-gray-700 text-primary-100 px-2 py-1 rounded-sm">
                                {{ new Date(selectedMessageBoard.bookedSchedule.date).toLocaleDateString("fa", { weekday: "long" }) }}
                                {{ new Date(selectedMessageBoard.bookedSchedule.date).toLocaleDateString("fa", { day: "2-digit" }) }}
                                {{ new Date(selectedMessageBoard.bookedSchedule.date).toLocaleDateString("fa", { month: "long" }) }}
                                {{ new Date(selectedMessageBoard.bookedSchedule.date).toLocaleDateString("fa", { year: "numeric" }) }}
                            </span>
                            <p>ساعت</p>
                            <span class="bg-gray-700 text-primary-100 px-2 py-1 rounded-sm">{{ selectedMessageBoard.bookedSchedule.time }}</span>
                            <p>می باشد</p>
                        </span>
                        <p class="text-sm">شما فقط در تاریخ و زمان رزرو شده امکان ارسال پیام یا تماس با مشاور را دارید.</p>
                    </div>
                    <div
                        class="flex items-center gap-1 bg-gray-300 bg-opacity-25 p-2"
                        v-if="!selectedMessageBoard.canSendMessage && !selectedMessageBoard.bookedSchedule.date"
                    >
                        <i class="far fa-info-circle"></i>
                        <p class="text-sm">زمان مشاوره شما به پایان رسیده! برای ادامه مشاوره لطفا یک زمان رزرو کنید.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import axios from "axios";

import CallController from "../../../templates/layouts/CallController";

export default {
    name: "UserChats",
    components: {
        "call-controller": CallController,
    },
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

            files: [],
            uploadingFiles: false,
            uploadingFilesPercentage: 0,
        };
    },
    created() {
        this.selectedMessageBoard = this.defaultSelectedMessageBoard();
    },
    async mounted() {
        await this.loadChatList();

        this.openSocket();

        setInterval(() => {
            if (this.selectedMessageBoard.timeRemained) this.selectedMessageBoard.timeRemained = Math.max(0, this.selectedMessageBoard.timeRemained - 1);
        }, 1000);

        this.$refs.chat_ul.addEventListener("scroll", this.onChatScroll);
        this.$refs.message_ul.addEventListener("scroll", this.onMessagesScroll);
    },
    beforeUnmount() {
        this.$refs.chat_ul.removeEventListener("scroll", this.onChatScroll);
        this.$refs.message_ul.removeEventListener("scroll", this.onMessagesScroll);
    },
    computed: {
        ...mapGetters(["userInfo"]),
    },
    methods: {
        ...mapActions(["makeToast"]),

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
                maxUploadCount: 0,
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
            this.showMessages = true;
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
                    switch (response.data.bookings.status) {
                        case 1:
                            this.selectedMessageBoard.canSendMessage = true;
                            this.selectedMessageBoard.bookedSchedule = response.data.bookings.bookedSchedule;
                            this.selectedMessageBoard.timeRemained = response.data.bookings.timeRemained;
                            break;
                        case 0:
                            this.selectedMessageBoard.canSendMessage = false;
                            this.selectedMessageBoard.bookedSchedule = response.data.bookings.bookedSchedule;
                            break;
                        case -1:
                            this.selectedMessageBoard.canSendMessage = false;
                            this.selectedMessageBoard.bookedSchedule = {};
                            break;
                    }

                    if (response.data.messages.length == 0) {
                        this.selectedMessageBoard.messagesEnded = true;
                        return;
                    }

                    let newMessages = response.data.messages;
                    newMessages = newMessages.concat(this.selectedMessageBoard.messages);
                    this.selectedMessageBoard.messages = newMessages;

                    this.selectedMessageBoard.maxUploadCount = parseInt(response.data.maxUploadCount);

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
        async sendMessage() {
            if (this.connection.readyState != 1) return;

            let uploadedFiles = await this.uploadFiles();

            // message eather should contain some text or some file
            if (!this.selectedMessageBoard.draftText && !uploadedFiles.length) return;

            this.connection.send(
                JSON.stringify({
                    event: "message",
                    data: {
                        files: JSON.stringify(uploadedFiles),
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

        // file upload section ===========================================
        openFileSelector() {
            if (this.uploadingFiles) return;
            this.$refs.file_input.click();
        },
        selectFiles() {
            if (this.uploadingFiles) return;

            const avaliableUploads = this.selectedMessageBoard.maxUploadCount - (this.selectedMessageBoard.bookedSchedule.uploadedFileCount || 0);
            if (this.$refs.file_input.files.length > avaliableUploads) {
                this.makeToast({ message: "تعداد فایل انتخابی بیشتر از حد مجاز است", type: "warning" });
                return;
            }

            for (let i = 0; i < this.$refs.file_input.files.length; i++) {
                if (this.$refs.file_input.files[i].size > 1048576) {
                    this.makeToast({ message: "حداکثر حجم فایل برای آپلود 1MB", type: "warning" });
                    continue;
                }
                // TODO
                // check the file format
                this.files.push(this.$refs.file_input.files[i]);
            }
        },
        removeFile(index) {
            this.files.splice(index, 1);
        },
        async uploadFiles() {
            let uploadedFiles = [];
            if (this.uploadingFiles) return uploadedFiles;

            if (!!this.files.length) {
                this.uploadingFiles = true;

                const formData = new FormData();
                for (let i = 0; i < this.files.length; i++) formData.append("files", this.files[i]);
                formData.append("bookedScheduleId", this.selectedMessageBoard.bookedSchedule._id);

                await axios
                    .post(`/api/v1/web/chat/${this.selectedMessageBoard.chatId}/upload`, formData, {
                        onUploadProgress: (e) => (this.uploadingFilesPercentage = parseInt(Math.round((e.loaded / e.total) * 100))),
                    })
                    .then((response) => {
                        uploadedFiles = response.data.fileObjects;
                        this.files = [];
                        try {
                            // update the uploaded_file_count in selectedMessageBoard.bookedSchedule
                            this.selectedMessageBoard.bookedSchedule.uploadedFileCount = response.data.newUploadedFileCount;
                        } catch (e) {}
                    })
                    .catch((error) => {
                        if (error.response.data) {
                            this.makeToast({ message: error.response.data.error, type: "danger" });
                        }
                    })
                    .finally(() => {
                        this.uploadingFiles = false;
                    });
            }

            return uploadedFiles;
        },
        // file upload section ===========================================

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
                case "stopCB":
                    isMessagesOpen = data.chatId == this.selectedMessageBoard.email;
                    if (isMessagesOpen) {
                        this.selectedMessageBoard.canSendMessage = false;
                        this.selectedMessageBoard.bookedSchedule = {};
                        this.selectedMessageBoard.timeRemained = 0;
                    } else {
                        if (this.messageBoard[data.chatId]) {
                            this.messageBoard[data.chatId].canSendMessage = false;
                            this.messageBoard[data.chatId].bookedSchedule = {};
                            this.messageBoard[data.chatId].timeRemained = 0;
                        }
                    }
                    break;
            }
        },
        // socket managment section ===========================================
    },
};
</script>

<style></style>
