import { Request, Response } from "express";
import Jmoment from "jalali-moment";
import AuthenticatedRequest from "../../interfaces/AuthenticatedRequest";
import Notification from "../../models/Notification";

class Controller {
    public async getNotifs(req: AuthenticatedRequest, res: Response) {
        const page = req.query.page ? parseInt(req.query.page.toString()) : 1;
        const pp = 25;

        let data = Notification.model
            .aggregate()
            .match({ modelType: "users", model: req.user._id })
            .project("_id template modelType model data readAt createdAt")
            .sort({ createdAt: "desc" });

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

        // transform data
        dataResults[0].data.map((row) => {
            row.createdAt = Jmoment(row.createdAt)
                .locale("fa")
                .fromNow();
            return row;
        });

        return res.json({
            records: dataResults[0].data,
            page: page,
            total: total,
            pageTotal: Math.ceil(total / pp),
        });
    }

    public async readNotifs(req: AuthenticatedRequest, res: Response) {
        const now = new Date(Date.now());

        // fill up the records that doesnt have readAt field
        await Notification.model.updateMany({ modelType: "users", model: req.user._id, readAt: { $exists: false } }, { readAt: now }).exec();

        return res.end();
    }

    public async clearNotifs(req: AuthenticatedRequest, res: Response) {
        const id = req.params.id ? req.params.id : null;

        try {
            await Notification.model.deleteOne({ _id: id, modelType: "users", model: req.user._id }).exec();
        } catch {
            return res.status(500).end();
        }

        return res.end();
    }

    public async getNotifCounts(req: AuthenticatedRequest, res: Response) {
        // TODO
        // get unread Message count
        // get unread Notif count
        return res.json({
            newMessageCount: 0,
            newNotifCount: 0,
        });
    }
}

export default Controller;
