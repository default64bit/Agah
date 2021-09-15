import { Request, Response } from "express";
import { body, param, query } from "express-validator";
import BaseValidator from "../BaseValidator";

class Validator extends BaseValidator {
    public static async getFaqs(req: Request, res: Response, next) {
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

        return await super.validate(validationChain, req, res, next);
    }

    public static async getFaq(req: Request, res: Response, next) {
        const validationChain = [
            param("id").isMongoId().escape().blacklist("\\[\\]\"'"),
        ];

        return await super.validate(validationChain, req, res, next);
    }

    public static async addFaq(req: Request, res: Response, next) {
        const validationChain = [
            body("question").isString().withMessage("question must be a string"),
            body("question").notEmpty().withMessage("question must not be empty"),
            body("question").isLength({ max: 250 }).withMessage("question must be max 250 characters"),

            body("answer").isString().withMessage("answer must be a string"),
            body("answer").notEmpty().withMessage("answer must not be empty"),

            body("status").exists().withMessage("status can't be empty"),
            body("status").notEmpty().withMessage("status can't be empty"),
            body("status").isIn(['published','pending']).withMessage("status must be either published or pending"),
        ];

        return await super.validate(validationChain, req, res, next);
    }

    public static async editFaq(req: Request, res: Response, next) {
        const validationChain = [
            body("id").isMongoId().withMessage("ID is not valid"),

            body("question").isString().withMessage("question must be a string"),
            body("question").notEmpty().withMessage("question must not be empty"),
            body("question").isLength({ max: 250 }).withMessage("question must be max 250 characters"),

            body("answer").isString().withMessage("answer must be a string"),
            body("answer").notEmpty().withMessage("answer must not be empty"),

            body("status").exists().withMessage("status can't be empty"),
            body("status").notEmpty().withMessage("status can't be empty"),
            body("status").isIn(['published','pending']).withMessage("status must be either published or pending"),
        ];

        return await super.validate(validationChain, req, res, next);
    }

    public static async deleteFaq(req: Request, res: Response, next) {
        const validationChain = [
            param("id").isMongoId().escape().blacklist("\\[\\]\"'"),
        ];

        return await super.validate(validationChain, req, res, next);
    }
}

export default Validator;
