import { createStore } from "vuex";
import adminProfile from "./store/adminProfile";
import userProfile from "./store/userProfile";
import toast from "./store/toast";

export default () => {
    return createStore({
        modules: {
            adminProfile,
            userProfile,
            toast,
        },
    });
};
