import { Request, Response } from "express";
import { body, param, query } from "express-validator";
import BaseValidator from "../BaseValidator";

class Validator extends BaseValidator {
    public static async getBookedSchedules(req: Request, res: Response, next) {
        const validationChain = [
            query("page").escape(),
            query("pp").escape(),
            query("sort").escape(),
            query("sort_type").escape(),
            query("search").escape().blacklist("\\[\\]\"'"),
        ];

        if (req.query.from_register_date && req.query.to_register_date) {
            validationChain.push(
                query("from_register_date").isDate({ format: "yyyy/mm/dd" }).withMessage("from date format is invalid")
            );
            validationChain.push(
                query("to_register_date").isDate({ format: "yyyy/mm/dd" }).withMessage("to date format is invalid")
            );
        }

        if (req.query.user_id) {
            validationChain.push(
                query("user_id").isMongoId().escape().blacklist("\\[\\]\"'").withMessage("user id is not valid")
            );
        }

        return await super.validate(validationChain, req, res, next);
    }

    public static async getBookedSchedule(req: Request, res: Response, next) {
        const validationChain = [
            param("id").isMongoId().escape().blacklist("\\[\\]\"'"),
        ];

        return await super.validate(validationChain, req, res, next);
    }

    public static async editBookedSchedule(req: Request, res: Response, next) {
        const validationChain = [
            body("id").isMongoId().withMessage("ID is not valid"),

            body("dateRaw").isString().withMessage("dateRaw must be a string"),
            body("dateRaw").notEmpty().withMessage("dateRaw must not be empty"),

            body("time").isString().withMessage("time must be a string"),
            body("time").notEmpty().withMessage("time must not be empty"),

            body("duration").isNumeric().withMessage("duration must be a number"),
            body("duration").notEmpty().withMessage("duration must not be empty"),

            body("type").exists().withMessage("type can't be empty"),
            body("type").notEmpty().withMessage("type can't be empty"),
            body("type").isIn(["online", "in-person"]).withMessage("type value not correct"),

            body("status").exists().withMessage("status can't be empty"),
            body("status").notEmpty().withMessage("status can't be empty"),
            body("status").isIn(["waiting-for-payment", "payed", "finished", "canceled"]).withMessage("status value not correct"),
        ];

        return await super.validate(validationChain, req, res, next);
    }

    public static async deleteBookedSchedule(req: Request, res: Response, next) {
        const validationChain = [
            param("id").isMongoId().escape().blacklist("\\[\\]\"'"),
        ];

        return await super.validate(validationChain, req, res, next);
    }
}

export default Validator;
