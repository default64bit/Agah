import fs from "fs/promises";
import randStr from "../helpers/randStr";
import Organization from "../models/Organization";
import Licence from "../models/Licence";
import DocumentFile from "../models/DocumentFile";

const validMimeTypes = ["doc", "docx", "zip", "rar", "pdf", "png", "jpeg", "jpg", "xls", "xlsx"];

export async function getFolderSize(folderPath = ""): Promise<number> {
    let size = 0;
    let files = await fs.readdir(folderPath);

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const stat = await fs.stat(`${folderPath}/${file}`);
        if (stat.isDirectory()) {
            size += await getFolderSize(`${folderPath}/${file}`);
        } else {
            size += parseFloat((stat.size / 1048576).toFixed(2));
        }
    }
    return new Promise((resolve, reject) => {
        resolve(size);
    });
}

export async function validateFiles(files = [], orgId): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
        const organization = await Organization.model.findOne({ _id: orgId }).exec();
        if (!organization) reject();

        const licence = await Licence.model.findOne({ key: organization.licenceKey, organization: organization.id }).exec();
        if (!licence) reject();

        const totalUseableSize = licence.storageLimit;
        const totalUsedSize = await getFolderSize(`storage/organizations/${organization._id}/private`);
        let uploadedSize = 0;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const size = parseFloat((file.size / 1048576).toFixed(2));
            uploadedSize += size;
        }
        if (uploadedSize + totalUsedSize > totalUseableSize) {
            for (let i = 0; i < files.length; i++) await fs.unlink(files[i].path);
            reject("Storage limit reached");
        }

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const ogName = file.originalname;
            const extension = ogName.slice(((ogName.lastIndexOf(".") - 1) >>> 0) + 2);

            if (!validMimeTypes.includes(extension)) await fs.unlink(file.path);
        }

        resolve(true);
    });
}

export async function storeFiles(files = [], orgId, modelID, model) {
    for (let i = 0; i < files.length; i++) {
        const file = files[i];

        const fileExists = await fs
            .access(file.path)
            .then(() => true)
            .catch(() => false);
        if (!fileExists) continue;

        const ogName = file.originalname;
        const extension = ogName.slice(((ogName.lastIndexOf(".") - 1) >>> 0) + 2);

        const fileName = randStr(30);
        await fs.copyFile(file.path, `storage/organizations/${orgId}/private/${fileName}.${extension}`);
        const fileShortLink = `private/${fileName}.${extension}`;
        await fs.unlink(file.path);
        
        await DocumentFile.model.create({
            organization: orgId,
            name: ogName,
            model: model,
            modelId: modelID,
            file: fileShortLink,
        });
    }
}

export async function checkAndServeFile(filePath) {}
