import fs from "fs/promises";
import { Request, Response } from "express";
import mongoose from "mongoose";
import moment from "moment";
import { randStr } from "../../helpers/stringHelpers";
import AuthenticatedRequest from "../../interfaces/AuthenticatedRequest";
import adminPermissionCheck from "../../helpers/adminPermissionCheck";
import User from "../../models/User";
import UserChat from "../../models/UserChat";
import UserChatMessages from "../../models/UserChatMessages";
import BookedSchedule from "../../models/BookedSchedule";

class CallsController {
    public async getUsers(req: AuthenticatedRequest, res: Response) {
        if (!adminPermissionCheck(req, req.admin)) return res.status(403).end();

        const page = req.query.page ? parseInt(req.query.page.toString()) : 1;
        const pp = req.query.pp ? parseInt(req.query.pp.toString()) : 25;
        const search = req.query.search.toString();

        // the base query object including search params
        let query = {};

        // making the model with query
        let data = User.model
            .aggregate()
            .match(query)
            .lookup({
                from: "user_chats",
                let: { user_id: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [{ $eq: ["$_id", "$$user_id"] }, { $eq: ["$admin", req.admin._id] }],
                            },
                        },
                    },
                ],
                as: "user_chat",
            })
            .match({
                $or: [
                    { name: { $regex: new RegExp(`.*${search}.*`, "i") } },
                    { family: { $regex: new RegExp(`.*${search}.*`, "i") } },
                    { email: { $regex: new RegExp(`.*${search}.*`, "i") } },
                    { mobile: { $regex: new RegExp(`.*${search}.*`, "i") } },
                ],
            });
        data = data.project("image name family email mobile status createdAt");

        // sorting
        data = data.sort({
            "user_chat.lastMessageDate": "desc",
            createdAt: "desc",
        });

        // paginating
        data = data.facet({
            data: [{ $skip: (page - 1) * pp }, { $limit: pp }],
            total: [{ $group: { _id: null, count: { $sum: 1 } } }],
        });

        // executing query and getting the results
        const dataResults = await data.exec().catch((e) => {
            throw e;
        });

        const total = dataResults[0].total[0] ? dataResults[0].total[0].count : 0;

        return res.json({
            records: dataResults[0].data,
            page: page,
            total: total,
            pageTotal: Math.ceil(total / pp),
        });
    }

    public async getUserInfo(req: AuthenticatedRequest, res: Response) {
        if (!adminPermissionCheck(req, req.admin)) return res.status(403).end();

        const id = req.params.id ? req.params.id : 0;

        // finding the model
        const user = await User.model
            .findById(id)
            .select(["-googleID", "-password"])
            .exec();
        if (!user) return res.status(404).end();

        return res.json(user);
    }

    public async getChat(req: AuthenticatedRequest, res: Response) {
        if (!adminPermissionCheck(req, req.admin)) return res.status(403).end();

        const id = req.params.id ? req.params.id : 0;
        const user = await User.model.findById(id).exec();
        if (!user) return res.status(404).end();

        const chat = await UserChat.model.findOne({ user: user._id, consulter: req.admin._id }).exec();
        if (!chat) return res.status(404).json({ error: "پیامی وجود ندارد" });

        const hasNew = await UserChatMessages.model.exists({
            readAt: { $exists: false },
            sender: user._id,
            receiver: req.admin._id,
        });

        return res.json({
            id: chat._id,
            receiver: user._id,
            image: user.image,
            fullName: `${user.name} ${user.family}`,
            lastMsg: chat.lastMessage,
            hasNew: hasNew,
        });
    }

    public async getUserMessages(req: AuthenticatedRequest, res: Response) {
        if (!adminPermissionCheck(req, req.admin)) return res.status(403).end();

        const id = req.params.id ? req.params.id : 0;
        const user = await User.model.findById(id).exec();
        if (!user) return res.status(404).end();

        const page = req.query.page ? parseInt(req.query.page.toString()) : 1;
        const pp = 50;

        const chat = await UserChat.model.findOne({ user: user._id, consulter: req.admin._id }).exec();
        if (!chat) return res.status(404).json({ error: "پیامی وجود ندارد" });

        const messages = await UserChatMessages.model
            .find({
                $or: [
                    { sender: chat.user, receiver: chat.consulter },
                    { sender: chat.consulter, receiver: chat.user },
                ],
            })
            .select("sender receiver message files readAt createdAt")
            .sort({ createdAt: "desc" })
            .limit(pp)
            .skip((page - 1) * pp)
            .exec();
        messages.reverse();

        return res.json({ messages, maxUploadCount: process.env.CHAT_MAX_UPLOAD_COUNT });
    }

    public async uploadAttachment(req: AuthenticatedRequest, res: Response) {
        const chatId = req.params.chatId;
        const files = req.files["files"];
        const validMimeTypes = process.env.CHAT_FILE_UPLOAD_FORMATS.split(",");

        if (!files) return res.status(422).json({ error: "فایل ای انتخاب نشده" });

        // get the chatId : get the current user and consulter
        const chat = await UserChat.model.findOne({ _id: chatId }).exec();
        if (!chat) {
            for (let i = 0; i < files.length; i++) await fs.unlink(files[i].path);
            return res.status(404).json({ error: "پیامی وجود ندارد" });
        }

        const fileObjects = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const ogName = file.originalname;
            const extension = ogName.slice(((ogName.lastIndexOf(".") - 1) >>> 0) + 2);

            // each uploaded file must be under the max file size limit in .env
            if (file.size > process.env.CHAT_MAX_UPLOAD_SIZE) {
                await fs.unlink(file.path);
                continue;
            }

            if (!validMimeTypes.includes(extension)) {
                await fs.unlink(file.path);
                continue;
            }

            // upload the files
            const fileName = randStr(30);
            const address = `public/user_files/${fileName}.${extension}`;
            await fs.copyFile(file.path, address).then(async () => {
                fileObjects.push({
                    name: ogName,
                    extension: extension,
                    link: address,
                });
            });
            await fs.unlink(file.path);
        }

        // the returned array should follow te structure of the files array in db
        return res.json({ fileObjects });
    }

    public async editUser(req: AuthenticatedRequest, res: Response) {
        if (!adminPermissionCheck(req, req.admin)) return res.status(403).end();

        const id = req.body.id;
        const user = await User.model.findById(req.body.id);
        if (!user) {
            if (req.file) fs.unlink(req.file.path);
            return res.status(404).json({
                error: "user does not exists",
            });
        }

        let imageLink = "";
        let oldImage = "";
        // check if avatar image is set or not
        if (req.file) {
            // get extension
            const ogName = req.file.originalname;
            const extension = ogName.slice(((ogName.lastIndexOf(".") - 1) >>> 0) + 2);

            if (req.file.size > 2097152) {
                fs.unlink(req.file.path);
                return res.status(422).json({ error: "Image file must be under 2MB" });
            }

            let isMimeOk = extension == "png" || extension == "gif" || extension == "jpeg" || extension == "jpg";
            if (!isMimeOk) {
                fs.unlink(req.file.path);
                return res.status(422).json({ error: "Image file must .jpg, .png or .gif" });
            }

            // make random name
            const name = randStr(30);

            // transfer uploaded image to /public/avatars
            const fileCopied = await fs
                .copyFile(req.file.path, `public/avatars/${name}.${extension}`)
                .then(() => true)
                .catch((e) => false);
            if (!fileCopied) {
                fs.unlink(req.file.path);
                return res.status(500).end();
            }

            imageLink = `${req.headers.origin}/img/avatars/${name}.${extension}`;
            fs.unlink(req.file.path);

            oldImage = user.image;
        } else {
            const avatarFile = req.body.avatarFile.toString();
            if (avatarFile.includes("admin.png")) {
                // delete the user old image
                oldImage = user.image;
            }
        }

        const email = req.body.email.toString();
        const mobile = req.body.mobile.toString();

        // check the uniqness of email address
        const isEmailExists = await User.model.findOne({ email: email }).exec();
        if (isEmailExists) {
            if (isEmailExists.id != id) {
                return res.status(422).json({ error: "email must be unique", field: "email" });
            }
        }
        // check the uniqness of mobile
        const isMobileExists = await User.model.findOne({ mobile: mobile }).exec();
        if (isMobileExists) {
            if (isMobileExists.id != id) {
                return res.status(422).json({ error: "mobile must be unique", field: "mobile" });
            }
        }

        // update the user info
        let updateQuery = {
            name: req.body.name.toString(),
            family: req.body.family.toString(),
            email: req.body.email.toString(),
            mobile: req.body.mobile.toString(),
            status: req.body.status.toString(),
        };
        if (imageLink != "") updateQuery["image"] = imageLink;
        if (req.body.password) updateQuery["password"] = await User.hash(req.body.password.toString());

        const userUpdated = await User.model
            .updateOne({ _id: id }, updateQuery)
            .exec()
            .then(() => true)
            .catch((e) => false);
        if (!userUpdated) return res.status(500).end();

        // delete the old image from /public/avatars if link base name is from same origin
        if (oldImage != "" && oldImage.includes(req.headers.origin)) {
            try {
                fs.unlink(oldImage.replace(req.headers.origin, "").replace("/img", "public"));
            } catch (e) {}
        }

        return res.end();
    }

    public async deleteUser(req: AuthenticatedRequest, res: Response) {}
}

export default CallsController;
