const state = {
    toastOptions: {
        delay: 5000,
        icon: "fad fa-home",
        title: "Test Title",
        message: "lorem ipsum martadom il per tama re sola rima ri sodso",
        type: "default",
        dismissible: false,
    },
};

const getters = {
    toastOptions: (state) => state.toastOptions,
};

const actions = {
    async makeToast({ commit }, options) {
        const toastOptions = {
            delay: options.delay ? options.delay : 5000,
            icon: options.icon ? options.icon : "",
            title: options.title ? options.title : "",
            message: options.message ? options.message : "",
            type: options.type ? options.type : "default",
            dismissible: options.dismissible ? options.dismissible : false,
        };
        commit("setToastOptions", toastOptions);
    },
};

const mutations = {
    setToastOptions: (state, options) => (state.toastOptions = options),
};

export default {
    state,
    getters,
    actions,
    mutations,
};
