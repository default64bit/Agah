import mongoose from "mongoose";
import Notification from "../../models/Notification";

export default async (template: string, modelType: string, model: mongoose.Types.ObjectId, data: object = {}) => {
    try {
        await Notification.model.create({
            template: template,
            modelType: modelType,
            model: model,
            data: data,
        });
    } catch (e) {
        // log the error
    }
};
