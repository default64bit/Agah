import axios from "axios";

const state = {
    isAdminLoggedIn: false,
    adminInfo: {
        avatar: "http://localhost:3000/img/avatars/admin.png",
        name: "",
        family: "",
        email: "",
        role: {},
        permissions: [],
    },
    refreshOnLoad: false,
};

const getters = {
    adminInfo: (state) => state.adminInfo,
    isAdminLoggedIn: (state) => state.isAdminLoggedIn,
};

const actions = {
    async getAdminInfo({ commit }, Options) {
        let AdminAuthToken = Options.AdminAuthToken ? Options.AdminAuthToken : "";
        await axios
            .get(`${Options.BaseUrl}/api/v1/admin/info`, {
                headers: {
                    AdminAuthToken: AdminAuthToken,
                    "csrf-token": Options.csrfToken,
                    "Cache-Control": "no-cache",
                    Pragma: "no-cache",
                },
            })
            .then((response) => {
                if (!state.refreshOnLoad) {
                    axios
                        .post(`${Options.BaseUrl}/api/v1/admin/auth/refresh`)
                        .then(() => commit("setIsAdminLoggedIn", true))
                        .catch((e) => {});
                    state.refreshOnLoad = true;
                }
                let interval = setInterval(() => {
                    axios
                        .post(`${Options.BaseUrl}/api/v1/admin/auth/refresh`)
                        .then(() => commit("setIsAdminLoggedIn", true))
                        .catch((error) => {
                            clearInterval(interval);
                            commit("setIsAdminLoggedIn", false);
                        });
                }, 840000);

                commit("setAdminInfo", response.data);
                commit("setAdminAvatar", response.data.adminInfo.image);

                let permissions = [];
                for (let i = 0; i < response.data.adminInfo.role.permissions.length; i++) {
                    permissions.push(response.data.adminInfo.role.permissions[i]);
                }
                commit("setAdminPermissions", permissions);
            })
            .catch((error) => {
                // console.log(error);
                throw error.response;
            });
    },
    async updateAdminInfo({ commit }, Options) {
        await axios
            .put(`${Options.BaseUrl}/api/v1/admin/info`, Options.data, {
                headers: {
                    "csrf-token": Options.csrfToken,
                    "content-type": "application/json",
                },
            })
            .then((response) => {
                commit("setAdminInfo", response.data);
            })
            .catch((error) => {
                throw error;
            });
    },

    async updateAdminAvatar({ commit }, Options) {
        await axios
            .post(`${Options.BaseUrl}/api/v1/admin/update_avatar`, Options.data, {
                headers: {
                    "csrf-token": Options.csrfToken,
                    "content-type": "application/json",
                },
            })
            .then((response) => {
                commit("setAdminAvatar", response.data.avatar);
            })
            .catch((error) => {
                throw error;
            });
    },
    async deleteAdminAvatar({ commit }, Options) {
        await axios
            .delete(`${Options.BaseUrl}/api/v1/admin/profile_avatar`, {
                headers: {
                    "csrf-token": Options.csrfToken,
                    "content-type": "application/json",
                },
            })
            .then((response) => {
                commit("setAdminAvatar", response.data.avatar);
            })
            .catch((error) => {
                throw error;
            });
    },
};

const mutations = {
    setIsAdminLoggedIn: (state, value) => (state.isAdminLoggedIn = !!value),
    setAdminInfo: (state, data) => (state.adminInfo = data.adminInfo),
    setAdminAvatar: (state, avatar) => (state.adminInfo.avatar = avatar),
    setAdminPermissions: (state, list) => (state.adminInfo.permissions = list),
};

export default {
    state,
    getters,
    actions,
    mutations,
};
