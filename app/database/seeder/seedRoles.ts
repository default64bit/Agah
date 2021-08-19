import AdminRole from "../../models/AdminRole";
import Permission from "../../models/Permission";

export default async () => {
    await AdminRole.model.collection.drop().catch((e) => {});

    return new Promise(async (resolve, reject) => {
        const permissions = await Permission.model
            .find()
            .select(["_id"])
            .exec();

        await AdminRole.model
            .create({
                name: "SuperAdmin",
                permissions: permissions,
            })
            .then((doc) => {
                console.log("Role Seed Successfully");
                resolve(true);
            })
            .catch((e) => {
                console.error(e);
                reject(e);
            });
    });
};
