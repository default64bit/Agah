import { Request, Response } from "express";
import AuthenticatedRequest from "../../interfaces/AuthenticatedRequest";
import User from "../../models/User";
import BookedSchedule from "../../models/BookedSchedule";

class Controller {
    public async getBookedSchedules(req: AuthenticatedRequest, res: Response) {
        const user = await User.model.findById(req.user._id).exec();

        const page = req.query.page ? parseInt(req.query.page.toString()) : 1;
        const pp = 25;

        let query = {
            user: user._id,
        };

        let data = BookedSchedule.model
            .aggregate()
            .match(query)
            .lookup({
                from: "admins",
                localField: "consulter",
                foreignField: "_id",
                as: "consulter",
            })
            .sort({
                createdAt: "desc",
            });
        data = data.project("consulter.name consulter.family consulter.image _id date time duration type transaction status createdAt");

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
}

export default Controller;
