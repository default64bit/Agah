import axios from "axios";

const state = {
    isLoggedIn: false,
    userInfo: {
        id: "",
        avatar: "http://localhost:3000/img/avatars/admin.png",
        name: "",
        family: "",
        email: "",
    },
    refreshOnLoad: false,

    selectedOrganization: {
        id: "",
        name: "",
        costUnit: "",
    },
    userRole: "",
    userPermissions: [],
};

const getters = {
    isLoggedIn: (state) => state.isLoggedIn,
    userInfo: (state) => state.userInfo,
    selectedOrganization: (state) => state.selectedOrganization,
    userRole: (state) => state.userRole,
    userPermissions: (state) => state.userPermissions,
};

const actions = {
    async getUserInfo({ commit }, Options) {
        let UserAuthToken = Options.UserAuthToken ? Options.UserAuthToken : "";
        await axios
            .get(`${Options.BaseUrl}/api/v1/user/info`, {
                headers: {
                    UserAuthToken: UserAuthToken,
                    "csrf-token": Options.csrfToken,
                },
            })
            .then((response) => {
                if (!state.refreshOnLoad) {
                    axios
                        .post(`${Options.BaseUrl}/api/v1/user/auth/refresh`)
                        .then(() => commit("setIsLoggedIn", true))
                        .catch((e) => {});
                    state.refreshOnLoad = true;
                }
                let interval = setInterval(() => {
                    axios
                        .post(`${Options.BaseUrl}/api/v1/user/auth/refresh`)
                        .then(() => commit("setIsLoggedIn", true))
                        .catch((error) => {
                            clearInterval(interval);
                            commit("setIsLoggedIn", false);
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

    async updateUserAvatar({ commit }, Options) {
        await axios
            .post(`${Options.BaseUrl}/api/v1/user/update_avatar`, Options.data, {
                headers: {
                    "csrf-token": Options.csrfToken,
                    "content-type": "application/json",
                },
            })
            .then((response) => {
                commit("setUserAvatar", response.data.avatar);
            })
            .catch((error) => {
                throw error;
            });
    },
    async deleteUserAvatar({ commit }, Options) {
        await axios
            .delete(`${Options.BaseUrl}/api/v1/user/profile_avatar`, {
                headers: {
                    "csrf-token": Options.csrfToken,
                    "content-type": "application/json",
                },
            })
            .then((response) => {
                commit("setUserAvatar", response.data.avatar);
            })
            .catch((error) => {
                throw error;
            });
    },

    async updateUserInfo({ commit }, Options) {
        await axios
            .put(`${Options.BaseUrl}/api/v1/user/info`, Options.data, {
                headers: {
                    "csrf-token": Options.csrfToken,
                    "content-type": "application/json",
                },
            })
            .then((response) => {
                commit("setUserInfo", response.data);
            })
            .catch((error) => {
                throw error;
            });
    },

    async selectOrganization({ commit }, Options) {
        commit("setSelectedOrganization", Options.Org);

        // update role & permissions
        await axios
            .get(`${Options.BaseUrl}/api/v1/user/permissions?id=${Options.Org.id}`)
            .then((response) => {
                commit("setUserRole", response.data.role);
                commit("setUserPermissions", response.data.permissions);
            })
            .catch((error) => {
                throw error;
            });
    },
};

const mutations = {
    setIsLoggedIn: (state, value) => (state.isLoggedIn = !!value),
    setUserInfo: (state, data) => (state.userInfo = data.userInfo),
    setUserAvatar: (state, avatar) => (state.userInfo.avatar = avatar),

    setSelectedOrganization: (state, org) => (state.selectedOrganization = org),
    setUserRole: (state, role) => (state.userRole = role),
    setUserPermissions: (state, permissions) => (state.userPermissions = permissions),
};

export default {
    state,
    getters,
    actions,
    mutations,
};
