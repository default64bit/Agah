import mongoose from "mongoose";
import Notification from "../../models/Notification";

export default async (template: string, modelType: string, models: Array<mongoose.Types.ObjectId>, data: object = {}) => {
    try {
        let notifs = [];
        for (let i = 0; i < models.length; i++) {
            notifs.push({
                template: template,
                modelType: modelType,
                model: models[i],
                data: data,
                createdAt: new Date(Date.now()),
            });
        }
        await Notification.model.insertMany(notifs);
    } catch (e) {
        // log the error
    }
};
