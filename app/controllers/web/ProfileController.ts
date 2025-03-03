import fs from "fs/promises";
import { Request, Response } from "express";
import { randStr } from "../../helpers/stringHelpers";
import AuthenticatedRequest from "../../interfaces/AuthenticatedRequest";
import User from "../../models/User";

class ProfileController {
    public async getInfo(req: AuthenticatedRequest, res: Response) {
        const user = await User.model
            .findById(req.user._id)
            .select(["image", "name", "family", "email", "emailVerifiedAt", "status"])
            .exec();

        return res.json({
            userInfo: user,
        });
    }

    public async updateInfo(req: AuthenticatedRequest, res: Response) {
        let error = false;

        await User.model.updateOne({ _id: req.user._id }, { name: req.body.firstName, family: req.body.lastName }).catch((e) => (error = true));
        if (error) return res.status(500).json({ error: "Updating info failed, try again later" });

        const user = await User.model.findById(req.user._id);
        res.json({
            userInfo: {
                avatar: user.image,
                name: user.name,
                family: user.family,
                email: user.email,
            },
        });
    }

    public async updateAvatar(req: AuthenticatedRequest, res: Response) {
        if (!req.file) return res.status(422).json({ error: "No file selected" });

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

        // get the old image from db
        const user = await User.model.findById(req.user._id);
        let oldImage = user.image;

        // make random name
        const name = randStr(30);

        let error = false;

        // transfer uploaded image to /public/avatars
        await fs.copyFile(req.file.path, `public/avatars/${name}.${extension}`).catch((e) => (error = true));
        if (error) {
            fs.unlink(req.file.path);
            return res.status(500).end();
        }

        // update db with new image link
        const newImageLink = `${req.headers.origin}/img/avatars/${name}.${extension}`;
        await User.model.updateOne({ _id: user.id }, { image: newImageLink }).catch((e) => (error = true));
        if (error) {
            fs.unlink(req.file.path);
            return res.status(500).end();
        }

        // delete the old image from /public/avatars if link base name is from same origin
        if (oldImage.includes(req.headers.origin)) {
            try {
                fs.unlink(oldImage.replace(req.headers.origin, "").replace("/img", "public"));
            } catch (e) {}
        }

        // delete the temp file
        fs.unlink(req.file.path);

        res.json({
            avatar: newImageLink,
        });
    }

    public async deleteAvatar(req: AuthenticatedRequest, res: Response) {
        // get the old image from db
        const user = await User.model.findById(req.user._id);
        let oldImage = user.image;

        let error = false;

        // update db with new image link
        const newImageLink = `${req.headers.origin}/img/avatars/admin.png`;
        await User.model.updateOne({ _id: user.id }, { image: newImageLink }).catch((e) => (error = true));
        if (error) return res.status(500).end();

        // delete the old image from /public/avatars if link base name is from same origin
        if (oldImage.includes(req.headers.origin) && !oldImage.includes("admin.png")) {
            try {
                fs.unlink(oldImage.replace(req.headers.origin, "").replace("/img", "public"));
            } catch (e) {}
        }

        res.json({
            avatar: newImageLink,
        });
    }
}

export default ProfileController;
