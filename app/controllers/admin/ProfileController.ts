import fs from "fs/promises";
import { Request, Response } from "express";
import randStr from "../../helpers/randStr";
import Admin from "../../models/Admin";
import AuthenticatedRequest from "../../interfaces/AuthenticatedRequest";

class ProfileController {
    public async getInfo(req: AuthenticatedRequest, res: Response) {
        const admin = await Admin.model
            .findById(req.admin._id)
            .select(["image", "name", "family", "email", "status"])
            .populate({
                path: "role",
                select: ["name","permissions"],
                // populate: {
                //     path: "permissions",
                //     select: ["name"],
                // },
            })
            .exec();

        return res.json({
            adminInfo: admin,
        });
    }

    public async updateInfo(req: AuthenticatedRequest, res: Response) {
        let error = false;

        await Admin.model.updateOne({ _id: req.admin._id }, { name: req.body.firstName, family: req.body.lastName }).catch((e) => (error = true));
        if (error) return res.status(500).json({ error: "Updating info failed, try again later" });

        const admin = await Admin.model.findById(req.admin._id);
        res.json({
            adminInfo: {
                avatar: admin.image,
                name: admin.name,
                family: admin.family,
                email: admin.email,
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
        const admin = await Admin.model.findById(req.admin._id);
        let oldImage = admin.image;

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
        await Admin.model.updateOne({ _id: admin.id }, { image: newImageLink }).catch((e) => (error = true));
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
        const admin = await Admin.model.findById(req.admin._id);
        let oldImage = admin.image;

        let error = false;

        // update db with new image link
        const newImageLink = `${req.headers.origin}/img/avatars/admin.png`;
        await Admin.model.updateOne({ _id: admin.id }, { image: newImageLink }).catch((e) => (error = true));
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

    public async changePassword(req: AuthenticatedRequest, res: Response) {
        let error = false;

        const admin = await Admin.model.findById(req.admin._id);
        const isOldPasswordValid = await Admin.checkPass(admin.password, req.body.oldPassword);
        if (!isOldPasswordValid) {
            return res.status(422).json({ error: "The old password is not correct", field: "oldPassword" });
        }

        await Admin.model.updateOne({ _id: req.admin._id }, { password: await Admin.hash(req.body.newPassword) }).catch((e) => (error = true));
        if (error) return res.status(500).end();

        res.end();
    }
}

export default ProfileController;
