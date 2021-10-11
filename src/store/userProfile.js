import axios from "axios";

const state = {
    loginDialogState: false,
    isUserLoggedIn: false,
    userInfo: {
        id: "",
        avatar: "http://localhost:3000/img/avatars/user.svg",
        name: "",
        family: "",
        email: "",
    },

    userNewMessageCount: 0,
    userNewNotifCount: 0,
};

const getters = {
    loginDialogState: (state) => state.loginDialogState,
    isUserLoggedIn: (state) => state.isUserLoggedIn,
    userInfo: (state) => state.userInfo,
    userNewMessageCount: (state) => state.userNewMessageCount,
    userNewNotifCount: (state) => state.userNewNotifCount,
};

const actions = {
    async getUserInfo({ commit }, Options) {
        await axios
            .get(`${Options.BaseUrl}/api/v1/web/info`, {
                headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
            })
            .then((response) => {
                axios.post(`${Options.BaseUrl}/api/v1/web/auth/refresh`).then(() => commit("setIsUserLoggedIn", true));
                let interval = setInterval(() => {
                    axios
                        .post(`${Options.BaseUrl}/api/v1/web/auth/refresh`)
                        .then(() => commit("setIsUserLoggedIn", true))
                        .catch((error) => {
                            clearInterval(interval);
                            commit("setIsUserLoggedIn", false);
                        });
                }, 840000);

                response.data.userInfo.image = response.data.userInfo.image ? response.data.userInfo.image : state.userInfo.avatar;
                commit("setUserInfo", response.data);
                if (response.data.userInfo.image) commit("setUserAvatar", response.data.userInfo.image);
            })
            .catch((error) => {
                // console.log(error);
                throw error.response;
            });
    },
    async updateUserInfo({ commit }, Options) {
        await axios
            .put(`${Options.BaseUrl}/api/v1/web/info`, Options.data)
            .then((response) => {
                commit("setUserInfo", response.data);
            })
            .catch((error) => {
                throw error;
            });
    },

    async updateUserAvatar({ commit }, Options) {
        await axios
            .post(`${Options.BaseUrl}/api/v1/web/update_avatar`, Options.data)
            .then((response) => {
                commit("setUserAvatar", response.data.avatar);
            })
            .catch((error) => {
                throw error;
            });
    },
    async deleteUserAvatar({ commit }, Options) {
        await axios
            .delete(`${Options.BaseUrl}/api/v1/web/profile_avatar`)
            .then((response) => {
                commit("setUserAvatar", response.data.avatar);
            })
            .catch((error) => {
                throw error;
            });
    },

    async changeLoginDialogState({ commit }, state) {
        commit("setLoginDialogState", state);
    },

    async updateUserNotifCounter({ commit }, Options) {
        await axios
            .get(`${Options.BaseUrl}/api/v1/web/notif_count`)
            .then((response) => {
                commit("setUserNewMessageCount", response.data.newMessageCount);
                commit("setUserNewNotifCount", response.data.newNotifCount);
            })
            .catch((error) => {
                throw error;
            });
    },
};

const mutations = {
    setLoginDialogState: (state, value) => (state.loginDialogState = !!value),
    setIsUserLoggedIn: (state, value) => (state.isUserLoggedIn = !!value),
    setUserInfo: (state, data) => (state.userInfo = data.userInfo),
    setUserAvatar: (state, avatar) => (state.userInfo.avatar = avatar),
    setUserNewMessageCount: (state, count) => (state.userNewMessageCount = count),
    setUserNewNotifCount: (state, count) => (state.userNewNotifCount = count),
};

export default {
    state,
    getters,
    actions,
    mutations,
};
