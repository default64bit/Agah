import { Request, Response } from "express";
import mongoose from "mongoose";
import adminPermissionCheck from "../../helpers/adminPermissionCheck";
import AuthenticatedRequest from "../../interfaces/AuthenticatedRequest";
import TimeOffSchedule from "../../models/TimeOffSchedule";

class AdminsController {
    public async getSchedules(req: AuthenticatedRequest, res: Response) {
        if (!adminPermissionCheck(req, req.admin)) return res.status(403).end();

        let admin_id = mongoose.Types.ObjectId(req.params.admin_id);

        let schedules = await TimeOffSchedule.model
            .aggregate()
            .match({ admin: admin_id })
            .sort({ startDate: "asc" })
            .exec();

        return res.json(schedules);
    }

    public async addSchedule(req: AuthenticatedRequest, res: Response) {
        if (!adminPermissionCheck(req, req.admin)) return res.status(403).end();

        const admin = req.body.admin.toString();
        const startDate = req.body.startDate.toString();
        const endDate = req.body.endDate.toString();

        const schedules = await TimeOffSchedule.model.create({ admin: admin, startDate: startDate, endDate: endDate }).then((docs) => docs);

        return res.json(schedules);
    }

    public async deleteSchedule(req: AuthenticatedRequest, res: Response) {
        if (!adminPermissionCheck(req, req.admin)) return res.status(403).end();

        let id = mongoose.Types.ObjectId(req.params.id);

        const schedule = await TimeOffSchedule.model.findById(id);
        if (!schedule) return res.status(404).end();

        // finding the model
        await TimeOffSchedule.model.findByIdAndDelete(id).exec();

        return res.json(schedule);
    }
}

export default AdminsController;
