import { Request, Response } from "express";
import mongoose from "mongoose";
import adminPermissionCheck from "../../helpers/adminPermissionCheck";
import AuthenticatedRequest from "../../interfaces/AuthenticatedRequest";
import Schedule from "../../models/Schedule";

class AdminsController {
    public async getSchedules(req: AuthenticatedRequest, res: Response) {
        if (!adminPermissionCheck(req, req.admin)) return res.status(403).end();

        let admin_id = mongoose.Types.ObjectId(req.params.admin_id);

        // making the model with query
        let schedules = await Schedule.model
            .aggregate()
            .match({ admin: admin_id })
            .sort({ startTime: "asc" })
            .exec();

        let results = { sat: [], sun: [], mon: [], tue: [], wed: [], thu: [], fri: [] };
        schedules.forEach((schedule) => results[schedule.dayName].push(schedule));

        return res.json(results);
    }

    public async addSchedule(req: AuthenticatedRequest, res: Response) {
        if (!adminPermissionCheck(req, req.admin)) return res.status(403).end();

        const admin = req.body.admin.toString();
        const startTime = req.body.startTime.toString();
        const endTime = req.body.endTime.toString();
        const typeOnline = req.body.typeOnline === "true" ? true : false;
        const typeInPerson = req.body.typeInPerson === "true" ? true : false;
        const day = req.body.day.toString();

        let inserts = [];
        if (typeOnline) inserts.push({ admin: admin, dayName: day, startTime: startTime, endTime: endTime, type: "online" });
        if (typeInPerson) inserts.push({ admin: admin, dayName: day, startTime: startTime, endTime: endTime, type: "in-person" });

        const schedules = await Schedule.model.insertMany(inserts).then((docs) => docs);

        return res.json(schedules);
    }

    public async deleteSchedule(req: AuthenticatedRequest, res: Response) {
        if (!adminPermissionCheck(req, req.admin)) return res.status(403).end();

        let id = mongoose.Types.ObjectId(req.params.id);

        const schedule = await Schedule.model.findById(id);
        if (!schedule) return res.status(404).end();

        // finding the model
        await Schedule.model.findByIdAndDelete(id).exec();

        return res.json(schedule);
    }
}

export default AdminsController;
