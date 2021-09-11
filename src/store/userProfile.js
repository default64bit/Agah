import axios from "axios";

const state = {
    isUserLoggedIn: false,
    userInfo: {
        id: "",
        avatar: "http://localhost:3000/img/avatars/user.svg",
        name: "",
        family: "",
        email: "",
    },
};

const getters = {
    isUserLoggedIn: (state) => state.isUserLoggedIn,
    userInfo: (state) => state.userInfo,
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
                commit("setUserAvatar", response.data.userInfo.image);
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
};

const mutations = {
    setIsUserLoggedIn: (state, value) => (state.isUserLoggedIn = !!value),
    setUserInfo: (state, data) => (state.userInfo = data.userInfo),
    setUserAvatar: (state, avatar) => (state.userInfo.avatar = avatar),
};

export default {
    state,
    getters,
    actions,
    mutations,
};
