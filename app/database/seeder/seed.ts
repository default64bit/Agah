import seedDefaultAdmin from "./seedDefaultAdmin";
import seedPermissions from "./seedPermissions";
import seedRoles from "./seedRoles";

export default async () => {
    await seedPermissions();
    await seedRoles();
    await seedDefaultAdmin();
    return 0;
};
