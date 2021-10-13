import { CronJob } from "cron";
import fs from "fs/promises";
import moment from "moment";

export const UploadCleaner = new CronJob("0 */5 * * * *", async () => {
    try {
        const uploads = await fs.readdir(`uploads`);
        for (let i = 0; i < uploads.length; i++) {
            const info = await fs.stat(`uploads/${uploads[i]}`);
            let timeDiff = moment.duration(moment(Date.now()).diff(info.birthtime));

            if (info.isFile()) {
                // check creation date of files, if larger than 5 minutes then delete
                if (5 * 60 < timeDiff.asSeconds()) {
                    await fs.rm(`uploads/${uploads[i]}`);
                }
            } else if (info.isDirectory()) {
                // check creation date of folder, if larger than 5 hours then delete
                if (5 * 60 < timeDiff.asMinutes()) {
                    await fs.rm(`uploads/${uploads[i]}`, { maxRetries: 1, recursive: true });
                }
            }
        }
    } catch (error) {
        // log the error
    }
});
