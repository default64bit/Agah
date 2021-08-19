import { Request, Response } from "express";
import Permission from "../../models/Permission";

class PermissionController {
    public async getPermissions(req: Request, res: Response) {
        // the base query object including search params
        let query = {};

        // type filter
        if (req.query.type) {
            let type = req.query.type.toString();
            query["type"] = {
                $in: type.split(','),
            };
        }

        // making the model with query
        let permissions = Permission.model.find(query);

        // executing query and getting the results
        const permissionResults = await permissions.exec().catch((e) => {
            throw e;
        });

        return res.json({
            records: permissionResults,
        });
    }
}

export default PermissionController;
