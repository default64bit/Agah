import fs from "fs/promises";
import { Request, Response } from "express";
import mongodb from "mongodb";
import { getPayload } from "../helpers/authHelper";
import AuthenticatedRequest from "../interfaces/AuthenticatedRequest";
import UserChatMessages from "../models/UserChatMessages";
import User from "../models/User";
import Admin from "../models/Admin";

interface Person {
    _id: mongodb.ObjectId;
    image: string;
    name: string;
    family: string;
    email: string;
}

export default async (req: AuthenticatedRequest, res: Response) => {
    const fileId = req.params.fileId;

    const userChatMessage = await UserChatMessages.model.findOne({ "files._id": fileId }).exec();
    if (!userChatMessage) return res.status(404).end();

    let person: Person;
    let personType = "";

    let userID = getPayload(req, "UserAuthToken", process.env.JWT_SECRET);
    let adminID = getPayload(req, "AdminAuthToken", process.env.JWT_SECRET);
    // check if req.user or req.admin exists
    if (!!adminID) {
        person = await Admin.model.findById(adminID);
        personType = "admins";
    } else if (!!userID) {
        person = await User.model.findById(userID);
        personType = "users";
    } else return res.status(404).end();

    let canAccess = false;
    if (personType == "users") {
        if (userChatMessage.sender.equals(person._id) || userChatMessage.receiver.equals(person._id)) canAccess = true;
    }
    if (personType == "admins") canAccess = true;
    if (!canAccess) return res.status(404).end();

    let file = null;
    for (let i = 0; i < userChatMessage.files.length; i++) {
        if (userChatMessage.files[i]._id.equals(fileId)) file = userChatMessage.files[i];
    }
    if (!file) return res.status(404).end();

    const isFileExists = await fs
        .access(file.link)
        .then(() => true)
        .catch(() => false);
    if (!isFileExists) return res.status(404).end();

    return res.sendFile(`${process.cwd()}/${file.link}`);
};
