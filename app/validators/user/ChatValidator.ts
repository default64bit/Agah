import { Request, Response } from "express";
import { body, param, query } from "express-validator";
import BaseValidator from "../BaseValidator";

class Validator extends BaseValidator {
    public static async uploadAttachment(req: Request, res: Response, next) {
        const validationChain = [
            param("id").exists().withMessage("برای آپلود باید یک گروه پیام انتخاب کرده باشید"),
            param("id").notEmpty().withMessage("برای آپلود باید یک گروه پیام انتخاب کرده باشید"),
            param("id").isMongoId().withMessage("برای آپلود باید یک گروه پیام انتخاب کرده باشید"),

            body("bookedScheduleId").exists().withMessage("مشاوره ای پیدا نشد"),
            body("bookedScheduleId").notEmpty().withMessage("مشاوره ای پیدا نشد"),
            body("bookedScheduleId").isMongoId().withMessage("مشاوره ای پیدا نشد"),
        ];

        return await super.validate(validationChain, req, res, next);
    }
}

export default Validator;
