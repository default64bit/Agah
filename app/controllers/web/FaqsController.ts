import { Request, Response } from "express";
import Faq from "../../models/Faq";

class NotificationController {
    public async getRandomFaqs(req: Request, res: Response) {
        const faqCounts = await Faq.model.countDocuments().exec();

        const randomFaqs = [];
        for (let i = 0; i < 5; i++) {
            let random = Math.floor(Math.random() * faqCounts);
            const faq = await Faq.model
                .findOne({ status: "published" })
                .skip(random)
                .select("-author -status -createdAt")
                .exec();
            randomFaqs.push(faq);
        }

        res.json(randomFaqs);
    }
}

export default NotificationController;
