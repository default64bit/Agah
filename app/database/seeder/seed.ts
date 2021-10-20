import { Request, Response } from "express";
import { getPayload } from "../../helpers/authHelper";
import Admin from "../../models/Admin";

import seedDefaultAdmin from "./seedDefaultAdmin";
import seedPermissions from "./seedPermissions";
import seedRoles from "./seedRoles";

export default async (req: Request, res: Response) => {
    let adminID = getPayload(req, "AdminAuthToken", process.env.JWT_SECRET);
    if (!adminID) return res.status(401).end();

    const admin = await Admin.model.findById(adminID);
    if (!admin) return res.status(401).end();

    await seedPermissions();
    await seedRoles();
    await seedDefaultAdmin();
    return 0;
};
