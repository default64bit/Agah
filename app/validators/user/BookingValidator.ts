import { Request, Response } from "express";
import { body, query } from "express-validator";
import BaseValidator from "../BaseValidator";

class Validator extends BaseValidator {
    public static async book(req: Request, res: Response, next) {
        const validationChain = [
            body("consulter").exists().withMessage("مشاور انتخاب نشده"),
            body("consulter").notEmpty().withMessage("مشاور انتخاب نشده"),
            body("consulter").isMongoId().withMessage("مشاور انتخاب نشده"),

            body("date").exists().withMessage("تاریخ برای مشاوره تعیین نشده"),
            body("date").notEmpty().withMessage("تاریخ برای مشاوره تعیین نشده"),

            body("time").exists().withMessage("زمان برای مشاوره تعیین نشده"),
            body("time").notEmpty().withMessage("زمان برای مشاوره تعیین نشده"),

            body("type").exists().withMessage("نوع مشاوره انتخاب نشده"),
            body("type").notEmpty().withMessage("نوع مشاوره انتخاب نشده"),
            body("type").isIn(['online','in-person']).withMessage("نوع مشاوره نامعتبر"),
        ];

        return await super.validate(validationChain, req, res, next);
    }
}

export default Validator;
