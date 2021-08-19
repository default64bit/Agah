import { Request, Response } from "express";
import { body, param, query } from "express-validator";
import BaseValidator from "../BaseValidator";

class Validator extends BaseValidator {
    public static async getMembers(req: Request, res: Response, next) {
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

    public static async getMember(req: Request, res: Response, next) {
        const validationChain = [
            param("id").isMongoId().escape().blacklist("\\[\\]\"'"),
        ];

        return await super.validate(validationChain, req, res, next);
    }

    public static async addMember(req: Request, res: Response, next) {
        const validationChain = [
            body("role").isMongoId().withMessage("Select a role for users"),
            body("role").notEmpty().withMessage("Select a role for users"),
            
            body("members").isArray().withMessage("Members must be in form of array"),
        ];

        return await super.validate(validationChain, req, res, next);
    }

    public static async editMember(req: Request, res: Response, next) {
        const validationChain = [
            body("id").isMongoId().withMessage("ID is not valid"),

            body("newRole").isMongoId().withMessage("Select a role for users"),
            body("newRole").notEmpty().withMessage("Select a role for users"),
        ];

        return await super.validate(validationChain, req, res, next);
    }

    public static async deleteMember(req: Request, res: Response, next) {
        const validationChain = [
            param("id").isMongoId().escape().blacklist("\\[\\]\"'"),
        ];

        return await super.validate(validationChain, req, res, next);
    }
}

export default Validator;
