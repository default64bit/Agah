import mongoose from "mongoose";
import Email from "./channels/Email";
import Sms from "./channels/Sms";
import System from "./channels/System";
import User from "../models/User";
import Admin from "../models/Admin";

export interface NotifDataObject {
    icon: string;
    title: string;
    message: string;
    link?: string;
}

export default (
    ModelIDs: Array<mongoose.Types.ObjectId>,
    ModelType: string,
    Channels: Array<string> = ["system"],
    Template: string,
    data?: NotifDataObject,
    EmailHtml?: string
) => {
    Channels.forEach(async (channel) => {
        switch (channel) {
            case "email":
                let peoples = [];
                let receivers_list = [];
                switch (ModelType) {
                    case "users":
                        peoples = await User.model.find({ _id: { $in: ModelIDs }, status: "active" }).exec();
                        break;
                    case "admins":
                        peoples = await Admin.model.find({ _id: { $in: ModelIDs }, status: "active" }).exec();
                        break;
                }
                for (let i = 0; i < peoples.length; i++) receivers_list.push(peoples[i].email);
                if (!!EmailHtml) Email(data.title, receivers_list.join(","), EmailHtml);
                break;
            case "sms":
                Sms();
                break;
            case "system":
                System(Template, ModelType, ModelIDs, data);
                break;
        }
    });
};
