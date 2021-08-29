import { Request, Response } from "express";
import { body, param, query } from "express-validator";
import BaseValidator from "../BaseValidator";

class Validator extends BaseValidator {
    public static async getSchedules(req: Request, res: Response, next) {
        const validationChain = [
            param("admin_id").isMongoId().escape().blacklist("\\[\\]\"'"),
        ];

        return await super.validate(validationChain, req, res, next);
    }

    public static async addSchedule(req: Request, res: Response, next) {
        const validationChain = [
            body("admin").exists().withMessage("select admin first"),
            body("admin").isMongoId().withMessage("select admin first"),

            body("startDate").exists().withMessage("startDate can't be empty"),
            body("startDate").notEmpty().withMessage("startDate can't be empty"),

            body("endDate").exists().withMessage("endDate can't be empty"),
            body("endDate").notEmpty().withMessage("endDate can't be empty"),
        ];

        return await super.validate(validationChain, req, res, next);
    }

    public static async deleteSchedule(req: Request, res: Response, next) {
        const validationChain = [
            param("id").isMongoId().escape().blacklist("\\[\\]\"'"),
        ];

        return await super.validate(validationChain, req, res, next);
    }
}

export default Validator;
