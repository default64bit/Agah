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

            body("startTime").exists().withMessage("startTime can't be empty"),
            body("startTime").notEmpty().withMessage("startTime can't be empty"),

            body("endTime").exists().withMessage("endTime can't be empty"),
            body("endTime").notEmpty().withMessage("endTime can't be empty"),

            body("typeOnline").exists().withMessage("typeOnline can't be empty"),
            body("typeOnline").notEmpty().withMessage("typeOnline can't be empty"),
            body("typeOnline").isIn(['true','false']).withMessage("typeOnline must be either true or false"),

            body("typeInPerson").exists().withMessage("typeInPerson can't be empty"),
            body("typeInPerson").notEmpty().withMessage("typeInPerson can't be empty"),
            body("typeInPerson").isIn(['true','false']).withMessage("typeInPerson must be either true or false"),

            body("day").exists().withMessage("day can't be empty"),
            body("day").notEmpty().withMessage("day can't be empty"),
            body("day").isIn(['sat','sun','mon','tue','wed','thu','fri']).withMessage("day value not supported"),
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
