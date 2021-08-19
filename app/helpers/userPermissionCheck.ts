import mongoose from "mongoose";
import User from "../models/User";
import Organization from "../models/Organization";
import UserOrganization from "../models/UserOrganization";

export default async (user_id, organization_id: mongoose.Types.ObjectId, permission = "") => {
    const organization = await Organization.model
        .findById(organization_id)
        .select(["name", "owner"])
        .exec();
    if (!organization) return false;

    // if user is the owner
    if (user_id.equals(organization.owner)) return true;

    // check if this user is member with correct permission
    const user_organization = await UserOrganization.model
        .findOne({
            user: user_id,
            organization: organization_id,
        })
        .populate({
            path: "role",
            select: ["name", "permissions"],
            match: { permissions: { $in: [permission] } },
        })
        .exec();
    if (!user_organization) return false;

    // if permission is empty
    if (permission === "") return true;

    // check if allow the permission
    if (user_organization.role !== null) return true;

    return false;
};
