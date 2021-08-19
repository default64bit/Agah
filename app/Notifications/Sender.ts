import Email from "./channels/Email";
import Sms from "./channels/Sms";
import System from "./channels/System";

export default (ModelID, ModelType: string, Channels: Array<string> = ["system"], Template: string, data?: object) => {
    Channels.forEach((channel) => {
        switch (channel) {
            case "email":
                Email();
                break;
            case "sms":
                Sms();
                break;
            case "system":
                System(Template, ModelType, ModelID, data);
                break;
        }
    });
};
