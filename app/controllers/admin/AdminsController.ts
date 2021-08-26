import fs from "fs/promises";
import { Request, Response } from "express";
import mongoose from "mongoose";
import randStr from "../../helpers/randStr";
import adminPermissionCheck from "../../helpers/adminPermissionCheck";
import AuthenticatedRequest from "../../interfaces/AuthenticatedRequest";
import Admin from "../../models/Admin";

class AdminsController {
    public async getAdmins(req: AuthenticatedRequest, res: Response) {
        if (!adminPermissionCheck(req, req.admin)) return res.status(403).end();

        const page = req.query.page ? parseInt(req.query.page.toString()) : 1;
        const pp = req.query.pp ? parseInt(req.query.pp.toString()) : 25;
        let sort = "";
        switch (req.query.sort) {
            case "Name":
                sort = "name";
                break;
            case "Email":
                sort = "email";
                break;
            case "Status":
                sort = "status";
                break;
            case "Register Date":
                sort = "createdAt";
                break;
        }
        const sortType = req.query.sort_type ? req.query.sort_type : "asc";
        const search = req.query.search.toString();

        // the base query object including search params
        let query = {
            $or: [
                { name: { $regex: new RegExp(`.*${search}.*`, "i") } },
                { family: { $regex: new RegExp(`.*${search}.*`, "i") } },
                { email: { $regex: new RegExp(`.*${search}.*`, "i") } },
                { status: { $regex: new RegExp(`.*${search}.*`, "i") } },
            ],
        };

        // date range filter query
        if (req.query.from_register_date && req.query.to_register_date) {
            query["createdAt"] = {
                $gte: new Date(req.query.from_register_date.toString()),
                $lte: new Date(req.query.to_register_date.toString()),
            };
        }
        // status filter query
        if (req.query.status) {
            query["status"] = {
                $in: req.query.status.toString().split(","),
            };
        }

        // making the model with query
        let admins = Admin.model.find(query).select(["image", "name", "family", "email", "status", "createdAt"]);
        if (sort) {
            admins = admins.sort({
                [sort]: sortType,
            });
        }

        // executing query and getting the results
        const adminResults = await admins
            .limit(pp)
            .skip((page - 1) * pp)
            .populate("role", ["name"])
            .exec()
            .catch((e) => {
                throw e;
            });

        const total = await Admin.model.find(query).countDocuments();

        return res.json({
            records: adminResults,
            page: page,
            total: total,
            pageTotal: Math.ceil(total / pp),
        });
    }

    public async getAdmin(req: AuthenticatedRequest, res: Response) {
        if (!adminPermissionCheck(req, req.admin)) return res.status(403).end();

        const id = req.params.id ? req.params.id : 0;

        // finding the model
        const admin = await Admin.model
            .findById(id)
            .select(["-googleID"])
            .populate("role", ["name"])
            .exec();
        if (!admin) return res.status(404).end();

        return res.json(admin);
    }

    public async addAdmin(req: AuthenticatedRequest, res: Response) {
        if (!adminPermissionCheck(req, req.admin)) return res.status(403).end();

        // upload the file and get the url string
        let imageLink = "";
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

            let error = false;
            // transfer uploaded image to /public/avatars
            await fs.copyFile(req.file.path, `public/avatars/${name}.${extension}`).catch((e) => (error = true));
            if (error) {
                fs.unlink(req.file.path);
                return res.status(500).end();
            }

            imageLink = `${req.headers.origin}/img/avatars/${name}.${extension}`;
            fs.unlink(req.file.path);
        }

        const email = req.body.email.toString();
        const roleId = req.body.role;

        // check the uniqness of email address
        const isEmailExists = await Admin.model.exists({ email: email });
        if (isEmailExists) {
            return res.status(422).json({
                error: "email must be unique",
                field: "email",
            });
        }

        const admin = await Admin.model
            .create({
                image: imageLink,
                name: req.body.name.toString(),
                family: req.body.family.toString(),
                email: req.body.email.toString(),
                password: await Admin.hash(req.body.password.toString()),
                status: req.body.status.toString(),
                role: roleId,
            })
            .then((doc) => doc)
            .catch((e) => false);
        if (!admin) return res.status(500).end();

        return res.json(admin);
    }

    public async editAdmin(req: AuthenticatedRequest, res: Response) {
        if (!adminPermissionCheck(req, req.admin)) return res.status(403).end();

        let error = false;
        const id = req.body.id;
        const admin = await Admin.model.findById(req.body.id);
        if (!admin) {
            if (req.file) fs.unlink(req.file.path);
            return res.status(404).json({
                error: "admin does not exists",
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
            await fs.copyFile(req.file.path, `public/avatars/${name}.${extension}`).catch((e) => (error = true));
            if (error) {
                fs.unlink(req.file.path);
                return res.status(500).end();
            }

            imageLink = `${req.headers.origin}/img/avatars/${name}.${extension}`;
            fs.unlink(req.file.path);

            oldImage = admin.image;
        } else {
            const avatarFile = req.body.avatarFile.toString();
            if (avatarFile.includes("admin.png")) {
                // delete the admin old image
                oldImage = admin.image;
            }
        }

        const email = req.body.email.toString();
        const roleId = req.body.role;

        // check the uniqness of email address
        const isEmailExists = await Admin.model.findOne({ email: email }).exec();
        if (isEmailExists) {
            if (isEmailExists.id != id) {
                return res.status(422).json({
                    error: "email must be unique",
                    field: "email",
                });
            }
        }

        // update the admin info
        let updateQuery = {
            name: req.body.name.toString(),
            family: req.body.family.toString(),
            email: req.body.email.toString(),
            status: req.body.status.toString(),
            role: roleId,
        };
        if (imageLink != "") updateQuery["image"] = imageLink;
        if (req.body.password) updateQuery["password"] = await Admin.hash(req.body.password.toString());

        if (req.body.socialMedias) {
            updateQuery["socialMedias"] = [];
            const socialMedias = JSON.parse(req.body.socialMedias);
            socialMedias.forEach((socialMedia) => {
                if(socialMedia.name && socialMedia.value){
                    updateQuery["socialMedias"].push({
                        name: socialMedia.name.value,
                        link: socialMedia.value,
                    });
                }
            });
        }

        await Admin.model.updateOne({ _id: id }, updateQuery).catch((e) => {
            error = true;
            console.log(e);
        });
        if (error) return res.status(500).end();

        // delete the old image from /public/avatars if link base name is from same origin
        if (oldImage != "" && oldImage.includes(req.headers.origin)) {
            try {
                fs.unlink(oldImage.replace(req.headers.origin, "").replace("/img", "public"));
            } catch (e) {}
        }

        return res.end();
    }

    public async deleteAdmin(req: AuthenticatedRequest, res: Response) {
        if (!adminPermissionCheck(req, req.admin)) return res.status(403).end();

        let id = mongoose.Types.ObjectId(req.params.id);

        // check if deleting admin is not the logged in admin
        if (req.admin._id == id) {
            return res.status(422).json({
                error: "You can't delete yourself as admin",
            });
        }

        const admin = await Admin.model.findById(id);
        if (!admin) return res.status(404).end();

        // delete admin's avatar image
        let oldImage = admin.image;
        // delete the old image from /public/avatars if link base name is from same origin
        if (oldImage.includes(req.headers.origin) && !oldImage.includes("admin.png")) {
            try {
                fs.unlink(oldImage.replace(req.headers.origin, "").replace("/img", "public"));
            } catch (e) {}
        }

        // finding the model
        await Admin.model.findByIdAndDelete(id).exec();

        return res.json(admin);
    }
}

export default AdminsController;
