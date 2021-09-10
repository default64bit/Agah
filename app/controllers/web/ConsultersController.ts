import { Request, Response } from "express";
import { nl2br } from "../../helpers/stringHelpers";
import Admin from "../../models/Admin";
import AdminRole from "../../models/AdminRole";

class NotificationController {
    public async getConsulters(req: Request, res: Response) {
        const role = await AdminRole.model.findOne({ name: "Consulter" }).exec();
        const consulters = await Admin.model
            .find({ role: role._id })
            .select("-consultPricePerHour -password -status -googleID -role -createdAt")
            .exec();

        // consulters.map((item) => {
        //     item.desc = nl2br(item.desc);
        //     return item;
        // });

        res.json(consulters);
    }
}

export default NotificationController;
