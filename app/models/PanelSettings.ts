import mongoose from "mongoose";

const _schema: mongoose.Schema = new mongoose.Schema({
    companyName: {
        type: String,
        required: true,
    },
    theme: {
        type: String,
        required: true,
    },
    locale: {
        type: String,
        required: true,
    },
});

export interface IPanelSettings {
    _id: mongoose.Types.ObjectId;
    companyName: string;
    theme: string;
    locale: string;
}

class PanelSettings {
    public static model = mongoose.model<IPanelSettings>("panel_settings", _schema);
}

export default PanelSettings;
