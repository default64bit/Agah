<template>
    <div>
        <slot name="callBtn" :call="call"></slot>

        <teleport to="body">
            <transition name="fade" appear>
                <Draggable>
                    <div
                        class="call_controls flex flex-col md:flex-row flex-wrap items-center gap-4 p-2 bg-warmgray-100 text-gray-800"
                        v-show="callState != 'hidden'"
                    >
                        <div class="flex flex-wrap items-center gap-2">
                            <img class="w-8 h-8 rounded-full object-cover" src="../../../assets/images/user.svg" alt="" />
                            <span>ساناز کشوردوست</span>
                        </div>
                        <div class="hidden md:inline-block">
                            <span class="far fa-horizontal-rule fa-rotate-90 text-gray-500 text-lg ml-1"></span>
                        </div>
                        <transition name="fade" appear>
                            <span v-if="callState == 'onCall'">00:34:18</span>
                            <small v-else-if="callState == 'callingSomeone'">درحال برقراری تماس</small>
                            <small v-else-if="callState == 'someoneCallingYou'">تماس ورودی</small>
                        </transition>
                        <div class="flex items-center gap-2" v-if="callState == 'onCall'">
                            <button class="t_button rounded-full bg-white hover:bg-gray-50" @click="toggleMute()">
                                <i class="far fa-microphone-alt" :class="mute ? 'fa-microphone-alt-slash' : 'fa-microphone-alt'"></i>
                            </button>
                            <button class="end_call t_button rounded-full bg-red-400 hover:bg-red-500 text-white" @click="hangup()">
                                <i class="fas fa-phone"></i>
                            </button>
                        </div>
                        <div class="flex items-center gap-2" v-if="callState == 'callingSomeone'">
                            <button class="end_call t_button rounded-full bg-red-400 hover:bg-red-500 text-white" @click="hangup()">
                                <i class="fas fa-phone"></i>
                            </button>
                        </div>
                        <div class="flex items-center gap-2" v-if="callState == 'someoneCallingYou'">
                            <button class="t_button jiggle rounded-full bg-emerald-400 hover:bg-emerald-500 text-white" @click="hangup()">
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
export default {
    data() {
        return {
            callState: "someoneCallingYou", // onCall, callingSomeone, someoneCallingYou, hidden
            mute: true,
        };
    },
    mounted() {},
    methods: {
        toggleMute() {
            this.mute = !this.mute;
        },
        call() {
            this.onCall = !this.onCall;
        },
        hangup() {},
    },
};
</script>

<style></style>
