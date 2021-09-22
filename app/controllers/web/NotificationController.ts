import { Request, Response } from "express";
import AuthenticatedRequest from "../../interfaces/AuthenticatedRequest";
import Notification from "../../models/Notification";

class Controller {
    public async getNotifs(req: AuthenticatedRequest, res: Response) {
        const page = req.query.page ? parseInt(req.query.page.toString()) : 1;
        const pp = 25;

        const notifications = await Notification.model
            .find({
                modelType: "users",
                model: req.user._id,
            })
            .sort({
                createdAt: "desc",
            })
            .limit(pp)
            .skip((page - 1) * pp)
            .exec();

        res.json(notifications);
    }

    public async readNotifs(req: AuthenticatedRequest, res: Response) {
        const now = new Date(Date.now());

        let query = {
            modelType: "users",
            model: req.user._id,
        };

        await Notification.model
            .updateMany(query, {
                readAt: now,
            })
            .exec();

        return res.end();
    }

    public async clearNotifs(req: AuthenticatedRequest, res: Response) {
        const id = req.query.id ? req.query.id : null;

        let query = {
            modelType: "users",
            model: req.user._id,
        };
        if (id != null) query["_id"] = id;

        await Notification.model.deleteMany(query).exec();

        return res.end();
    }
}

export default Controller;
