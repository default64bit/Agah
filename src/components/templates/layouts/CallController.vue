<template>
    <div>
        <slot name="callBtn" :call="call"></slot>

        <audio ref="callingSound" v-show="false" preload="auto">
            <source src="../../../assets/audio/calling.mp3" />
        </audio>
        <audio ref="audio" autoplay v-show="false"></audio>

        <teleport to="body">
            <transition name="fade" appear>
                <Draggable>
                    <div
                        class="call_controls flex flex-col md:flex-row flex-wrap items-center gap-4 p-2 bg-warmgray-100 text-gray-800"
                        v-show="callState != 'hidden'"
                    >
                        <div class="flex flex-wrap items-center gap-2">
                            <img class="w-8 h-8 rounded-full object-cover" :src="userImage" alt="" />
                            <span>{{userFullName}}</span>
                        </div>
                        <div class="hidden md:inline-block">
                            <span class="far fa-horizontal-rule fa-rotate-90 text-gray-500 text-lg ml-1"></span>
                        </div>
                        <transition name="fade" appear>
                            <span v-if="callState == 'onCall'">{{ new Date(timer * 1000).toISOString().substr(11, 8) }}</span>
                            <small v-else-if="callState == 'callingSomeone'">درحال برقراری تماس</small>
                            <small v-else-if="callState == 'someoneCallingYou'">تماس ورودی</small>
                        </transition>
                        <div class="flex items-center gap-2" v-if="callState == 'onCall'">
                            <button class="t_button rounded-full bg-white hover:bg-gray-50" @click="toggleMute()">
                                <i class="far fa-microphone-alt" :class="mute ? 'fa-microphone-alt-slash' : 'fa-microphone-alt'"></i>
                            </button>
                            <button class="end_call t_button rounded-full bg-red-400 hover:bg-red-500 text-white" @click="hungup()">
                                <i class="fas fa-phone"></i>
                            </button>
                        </div>
                        <div class="flex items-center gap-2" v-if="callState == 'callingSomeone'">
                            <button class="end_call t_button rounded-full bg-red-400 hover:bg-red-500 text-white" @click="hungup()">
                                <i class="fas fa-phone"></i>
                            </button>
                        </div>
                        <div class="flex items-center gap-2" v-if="callState == 'someoneCallingYou'">
                            <button class="t_button jiggle rounded-full bg-emerald-400 hover:bg-emerald-500 text-white" @click="answer()">
                                <i class="fas fa-phone"></i>
                            </button>
                            <button class="end_call t_button rounded-full bg-red-400 hover:bg-red-500 text-white" @click="hungup()">
                                <i class="fas fa-phone"></i>
                            </button>
                        </div>
                    </div>
                </Draggable>
            </transition>
        </teleport>
    </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
    name: "CallController",
    data() {
        return {
            connection: null,
            connectCount: 0,
            connectionReady: false,
            resetSocketInterval: null,

            callState: "hidden", // onCall, callingSomeone, someoneCallingYou, hidden
            mute: false,
            timer: 0,
            timerInterval: null,
            userFullName: "",
            userImage: "",

            myUniqueId: "",
            callId: "",
            userToCall: "",
            callerId: "",
            offer: null,
            streaming: false,

            PC: null,
            localStream: null,
            remoteStream: null,
        };
    },
    mounted() {
        this.openSocket();
        this.connectPeer();
    },
    unmounted() {
        try {
            this.connection.close();
        } catch (e) {}
    },
    methods: {
        ...mapActions(["makeToast"]),

        async call(userToCallId, userToCallFullName, userToCallImage) {
            if (!userToCallId) return;
            if (this.connection.readyState != 1) return;

            this.userToCall = userToCallId;
            this.userFullName = userToCallFullName;
            this.userImage = userToCallImage || "../../../assets/images/user.svg";

            if (this.callState != "hidden") return;
            this.callState = "callingSomeone";
            this.$refs.callingSound.play();

            await this.startRecord();
            this.remoteStream = new MediaStream();
            this.PC.ontrack = (event) => {
                event.streams[0].getTracks().forEach((track) => {
                    this.remoteStream.addTrack(track);
                });
            };
            this.$refs.audio.srcObject = this.remoteStream;

            this.PC.onicecandidate = async (event) => {
                if (event.candidate && this.callId) {
                    // update call record and save offer candidates to DB
                    this.connection.send(
                        JSON.stringify({
                            event: "updateCallOfferCandidates",
                            data: { callId: this.callId, userToCall: this.userToCall, offerCandidates: event.candidate.toJSON() },
                        })
                    );
                }
            };

            // make call record and save offer
            let offerDesc = await this.PC.createOffer();
            await this.PC.setLocalDescription(offerDesc);
            const offer = { sdp: offerDesc.sdp, type: offerDesc.type };
            this.connection.send(JSON.stringify({ event: "makeCall", data: { userToCall: this.userToCall, offer: offer } }));
        },
        async answer() {
            if (this.callState != "someoneCallingYou") return;
            this.callState = "onCall";
            this.startTimer();
            this.$refs.callingSound.pause();

            await this.startRecord();
            this.remoteStream = new MediaStream();
            this.PC.ontrack = (event) => {
                event.streams[0].getTracks().forEach((track) => {
                    this.remoteStream.addTrack(track);
                });
            };
            this.$refs.audio.srcObject = this.remoteStream;

            this.PC.onicecandidate = async (event) => {
                if (event.candidate && this.callId) {
                    // update answerCandidate field in DB for this call
                    this.connection.send(
                        JSON.stringify({
                            event: "updateCallAnswerCandidates",
                            data: { callId: this.callId, callerId: this.callerId, answerCandidates: event.candidate.toJSON() },
                        })
                    );
                }
            };

            // get offer of this call from db
            if (!!this.offer) {
                await this.PC.setRemoteDescription(new RTCSessionDescription(this.offer));
                const answerDesc = await this.PC.createAnswer();
                await this.PC.setLocalDescription(answerDesc);
                const answer = { type: answerDesc.type, sdp: answerDesc.sdp };
                this.connection.send(JSON.stringify({ event: "answerCall", data: { callId: this.callId, callerId: this.callerId, answer: answer } }));
            }
        },
        async hungup() {
            if (this.callState == "hidden") return;

            // if in the call then act like hungup button
            if (this.callState == "onCall") this.sendHungupCallMsg(this.callId);
            // if in outgoingCall apge then act like cancel call button
            if (this.callState == "callingSomeone") this.sendHungupCallMsg(this.callId);
            // if in incomingCall page then act like reject button
            if (this.callState == "someoneCallingYou") this.sendRejectCallMsg(this.callerId);

            this.PC.close();
            this.stopRecord();
            this.connectPeer();
            this.callId = this.callerId = this.offer = null;
            this.callState = "hidden";
        },
        toggleMute() {
            // TODO
            this.mute = !this.mute;
        },
        startTimer() {
            this.timerInterval = setInterval(() => (this.timer += 1), 1000);
        },

        async startRecord() {
            if (this.streaming) await this.stopRecord();
            await navigator.mediaDevices
                .getUserMedia({ audio: true })
                .then((stream) => {
                    // save the stream
                    this.localStream = stream;
                    // send stream to PC peer
                    this.localStream.getTracks().forEach((track) => {
                        this.PC.addTrack(track, this.localStream);
                    });
                    this.streaming = true;
                })
                .catch((e) => console.log(e));
        },
        async stopRecord() {
            if (!this.streaming) return;
            // stop tracking from user input stream
            this.localStream.getTracks().forEach((track) => {
                track.stop();
            });
            // clear up the steam data
            this.$refs.audio.srcObject = this.localStream = null;
            this.streaming = false;
        },

        // Peer Setup ===============================================================
        connectPeer() {
            this.PC = new RTCPeerConnection({
                iceServers: [{ urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"] }],
                iceCandidatePoolSize: 10,
            });
            this.PC.oniceconnectionstatechange = (event) => {
                if (this.PC.iceConnectionState == "disconnected") {
                    if (this.callId) {
                        this.sendHungupCallMsg(this.callId);
                    } else {
                        this.resetPeer();
                    }
                }
            };
        },
        resetPeer() {
            this.PC.close();
            this.stopRecord();
            this.connectPeer();
            this.callState = "hidden";
            this.timer = 0;
            clearInterval(this.timerInterval);
            this.timerInterval = null;
            this.$refs.callingSound.pause();
        },
        // Peer Setup ===============================================================

        // Sockets ===============================================================
        openSocket() {
            if (this.connection && this.connection.readyState != 3) return;
            if (this.connectCount > 5) return;

            let url = this.getBaseUrl().replace("http", "ws");
            try {
                this.connection = new WebSocket(`${url}/sock/v2/ISC`);
                this.connection.onopen = this.socketOnOpen;
                this.connection.onclose = this.socketOnClose;
                this.connection.onmessage = this.socketOnMessage;
                // this.connection.onerror = () => this.connectCount++;
                this.connection.onerror = (e) => console.log(e);
            } catch (e) {}
        },
        socketOnOpen(event) {
            clearInterval(this.resetSocketInterval);
            this.resetSocketInterval = null;
            this.connectionReady = true;
            this.connectCount = 0;
        },
        socketOnClose(event) {
            // inform the user to refresh the page
            if (this.connectCount > 5) {
                this.makeToast({ message: "Please Refresh The Page", type: "warning" });
            }
            this.connectionReady = false;
        },
        async socketOnMessage(event) {
            const data = JSON.parse(event.data);
            switch (data.event) {
                case "uniqueId":
                    this.myUniqueId = data.id;
                    break;
                case "updateCallId":
                    this.callId = data.callId;
                    break;

                case "callerAnswerUpdate":
                    if (!this.PC.currentRemoteDescription) {
                        this.callId = data.callId;
                        this.PC.setRemoteDescription(new RTCSessionDescription(data.answer));
                        this.$refs.callingSound.pause();
                        this.callState = "onCall";
                        this.startTimer();
                    }
                    break;
                case "callerAnswerCandidateUpdate":
                    this.callId = data.callId;
                    this.PC.addIceCandidate(new RTCIceCandidate(data.answerCandidates));
                    break;

                case "calleeOfferUpdate":
                    if (this.callState == "hidden") {
                        this.callState = "someoneCallingYou";
                        this.userFullName = `${data.caller.name} ${data.caller.family}`;
                        this.userImage = data.caller.image || "../../../assets/images/user.svg";
                        this.callId = data.callId;
                        this.callerId = data.callerId;
                        this.offer = data.offer;
                    } else {
                        this.sendBusyMsg(data.callerId);
                    }
                    break;
                case "calleeOfferCandidateUpdate":
                    this.callId = data.callId;
                    this.callerId = data.callerId;
                    if (data.offerCandidates) this.PC.addIceCandidate(new RTCIceCandidate(data.offerCandidates));
                    break;

                case "userNotOnline":
                    this.resetPeer();
                    this.makeToast({ message: "مخاطب آنلاین نیست، لطفا بعدا تماس بگیرید", type: "danger" });
                    break;
                case "callRejected":
                    this.resetPeer();
                    this.makeToast({ message: "مخاطب پاسخگو نیست، لطفا چند لحظه بعد دوباره تماس بگیرید", type: "danger" });
                    break;
                case "calleeIsBusy":
                    this.resetPeer();
                    this.makeToast({ message: "مخاطب در حال صحبت با شخص دیگر است، لطفا چند لحظه بعد دوباره تماس بگیرید", type: "danger" });
                    break;
                case "hungupCall":
                    this.resetPeer();
                    break;
            }
        },
        // Sockets ===============================================================

        // Socket Messages ===============================================================
        sendBusyMsg(callerId) {
            // send a msg to server to let the caller know the user is in a call right now
            if (this.connection.readyState != 1) return;
            this.connection.send(JSON.stringify({ event: "calleeIsBusy", data: { callerId } }));
        },
        sendRejectCallMsg(callerId) {
            // send a msg to server to let the caller know that call was rejected
            if (this.connection.readyState != 1) return;
            this.connection.send(JSON.stringify({ event: "callRejected", data: { callerId } }));
        },
        sendHungupCallMsg(callId) {
            if (this.connection.readyState != 1) return;
            this.connection.send(JSON.stringify({ event: "hungupCall", data: { callId } }));
        },
        // Socket Messages ===============================================================
    },
};
</script>

<style></style>
