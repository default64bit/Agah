const state = {
    sideMenuOpen: false,
};

const getters = {
    sideMenuOpen: (state) => state.sideMenuOpen,
};

const actions = {
    async changeSideMenuOpen({ commit }, value) {
        commit("setSideMenuOpen", !!value);
    },
};

const mutations = {
    setSideMenuOpen: (state, value) => (state.sideMenuOpen = value),
};

export default {
    state,
    getters,
    actions,
    mutations,
};
