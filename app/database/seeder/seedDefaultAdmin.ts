import AdminRole from "../../models/AdminRole";
import Admin from "../../models/Admin";

export default async () => {
    await Admin.model.collection.drop().catch((e) => {});

    return new Promise(async (resolve, reject) => {
        const role = await AdminRole.model
            .findOne({
                name: "SuperAdmin"
            })
            .exec();

        await Admin.model
            .create({
                image: "",
                name: "Kasra",
                family: "Keshvardoost",
                email: "kasrakeshvardoost@gmail.com",
                password: await Admin.hash('12345678'),
                role: role.id,
                createdAt: new Date(Date.now()),
            })
            .then((doc) => {
                console.log("Admin Seed Successfully");
                resolve(true);
            })
            .catch((e) => {
                console.error(e);
                reject(e);
            });
    });
};
