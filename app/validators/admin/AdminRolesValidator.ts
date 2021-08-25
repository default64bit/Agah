import { Request, Response } from "express";
import { body, param, query } from "express-validator";
import BaseValidator from "../BaseValidator";

class Validator extends BaseValidator {
    public static async getRoles(req: Request, res: Response, next) {
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

    public static async getRole(req: Request, res: Response, next) {
        const validationChain = [
            param("id").isMongoId().escape().blacklist("\\[\\]\"'"),
        ];

        return await super.validate(validationChain, req, res, next);
    }

    public static async addRole(req: Request, res: Response, next) {
        const validationChain = [
            body("roleName").isString().withMessage("Role name must be a string"),
            body("roleName").notEmpty().withMessage("Role name must not be empty"),
            body("roleName").isLength({ max: 255, min: 0 }).withMessage("Role name must be max 255 characters"),

            body("selectedPermissions").isArray().withMessage("Selected permissions must be in form of array"),
        ];

        return await super.validate(validationChain, req, res, next);
    }

    public static async editRole(req: Request, res: Response, next) {
        const validationChain = [
            body("id").isMongoId().withMessage("ID is not valid"),

            body("roleName").isString().withMessage("Role name must be a string"),
            body("roleName").notEmpty().withMessage("Role name must not be empty"),
            body("roleName").isLength({ max: 255, min: 0 }).withMessage("Role name must be max 255 characters"),

            body("selectedPermissions").isArray().withMessage("Selected permissions must be in form of array"),
        ];

        return await super.validate(validationChain, req, res, next);
    }

    public static async deleteRole(req: Request, res: Response, next) {
        const validationChain = [
            param("id").isMongoId().escape().blacklist("\\[\\]\"'"),
        ];

        return await super.validate(validationChain, req, res, next);
    }
}

export default Validator;
