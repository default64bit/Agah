<template>
    <div class="dashboard_body" :class="{ call_flash: incomingCall }">
        <div>
            <span>Your User Unique ID :</span> <b class="text-violet-200">{{ myUniqueId }}</b>
        </div>

        <hr class="my-4 " />

        <t-input class="max-w-screen-xs" type="text" label="User ID" placeholer="user-unique-ID" v-model:value="userToCall" />

        <audio ref="callingSound" v-show="false" preload="auto">
            <source src="../../../assets/audio/calling.mp3" />
        </audio>
        <audio ref="audio" autoplay v-show="false"></audio>

        <div class="flex gap-2 mt-4">
            <button class="t_button px-3 bg-emerald-500 hover:bg-emerald-600 w-max rounded-full" @click="answer()" v-if="incomingCall">
                <i class="fad fa-phone-alt jiggle"></i>
            </button>
            <button
                class="t_button px-3 bg-emerald-500 hover:bg-emerald-600 w-max rounded-full"
                @click="call()"
                v-if="!incomingCall && !outgoingCall && !inCall"
            >
                <i class="fad fa-phone-alt"></i>
            </button>
            <button class="t_button px-3 bg-rose-500 hover:bg-rose-600 w-max rounded-full" @click="hungup()" v-if="incomingCall || outgoingCall || inCall">
                <i class="fad fa-phone-alt fa-rotate-90"></i>
            </button>
        </div>
    </div>
</template>

<script>
import axios from "axios";
import { mapGetters, mapActions } from "vuex";

import Input from "../../templates/layouts/Input";

export default {
    name: "Room",
    components: {
        "t-input": Input,
    },
    data() {
        return {
            connection: null,
            connectCount: 0,
            connectionReady: false,
            resetSocketInterval: null,

            myUniqueId: "",
            callId: "",
            userToCall: "",
            callerId: "",
            offer: null,

            streaming: false,
            incomingCall: false,
            outgoingCall: false,
            inCall: false,

            PC: null,
            localStream: null,
            remoteStream: null,
        };
    },
    created() {},
    async mounted() {
        this.openSocket();
        this.connectPeer();
    },
    computed: {
        ...mapGetters(["userInfo"]),
    },
    methods: {
        ...mapActions(["makeToast"]),

        async call() {
            if (!this.userToCall) return;
            if (this.connection.readyState != 1) return;

            if (this.inCall || this.outgoingCall || this.incomingCall) return;
            this.incomingCall = this.inCall = false;
            this.outgoingCall = true;
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
            if (this.inCall || this.outgoingCall) return;
            this.incomingCall = this.outgoingCall = false;
            this.inCall = true;
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
            if (!this.inCall && !this.outgoingCall && !this.incomingCall) return;

            // if in the call then act like hungup button
            if (this.inCall == true) this.sendHungupCallMsg(this.callId);
            // if in outgoingCall apge then act like cancel call button
            if (this.outgoingCall == true) this.sendHungupCallMsg(this.callId);
            // if in incomingCall page then act like reject button
            if (this.incomingCall == true) this.sendRejectCallMsg(this.callerId);

            this.PC.close();
            this.stopRecord();
            this.connectPeer();
            this.callId = this.callerId = this.offer = null;
            this.incomingCall = this.outgoingCall = this.inCall = false;
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
            this.inCall = this.incomingCall = this.outgoingCall = false;
            this.$refs.callingSound.pause();
        },
        // Peer Setup ===============================================================

        // Sockets ===============================================================
        openSocket() {
            if (this.connection && this.connection.readyState != 3) return;
            if (this.connectCount > 5) return;

            let url = this.getBaseUrl().replace("http", "ws");
            try {
                this.connection = new WebSocket(`${url}/sock/v2/ISM`);
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
            this.makeToast({ message: "Please Refresh The Page", type: "warning" });
            this.connectionReady = false;
        },
        async socketOnMessage(event) {
            const data = JSON.parse(event.data);
            switch (data.event) {
                case "userUniqueId":
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
                    }
                    break;
                case "callerAnswerCandidateUpdate":
                    this.callId = data.callId;
                    this.PC.addIceCandidate(new RTCIceCandidate(data.answerCandidates));
                    break;

                case "calleeOfferUpdate":
                    if (!this.inCall && !this.incomingCall && !this.outgoingCall) {
                        this.incomingCall = true;
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
                    this.makeToast({ message: "User Is Not Online, Please Call Later", type: "danger" });
                    break;
                case "callRejected":
                    this.resetPeer();
                    this.makeToast({ message: "User Is Not Answering, Please Call Later", type: "danger" });
                    break;
                case "calleeIsBusy":
                    this.resetPeer();
                    this.makeToast({ message: "User Is Bussy Currently, Please Call Later", type: "danger" });
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
