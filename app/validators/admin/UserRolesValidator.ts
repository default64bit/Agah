import { Request, Response } from "express";
import { body, param, query } from "express-validator";
import BaseValidator from "../BaseValidator";

class RolesValidator extends BaseValidator {
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
        if (req.query.availableForId) {
            validationChain.push(
                query("availableForId").isMongoId().withMessage("Invalid Id for user role"),
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

            body("laborCost").notEmpty().withMessage("Labor cost must not be empty"),
            body("laborCost").isNumeric().withMessage("Labor cost must be a number"),
            
            body("organization").isMongoId().withMessage("Selected organization not found"),
            
            body("selectedPermissions").isArray().withMessage("Selected permissions must be in form of array"),
        ];
        if(req.body.parentRole){
            validationChain.concat([
                body("parentRole").isMongoId().withMessage("Selected parent role is not valid"),
            ]);
        }

        return await super.validate(validationChain, req, res, next);
    }

    public static async editRole(req: Request, res: Response, next) {
        const validationChain = [
            body("id").isMongoId().withMessage("ID is not valid"),

            body("roleName").isString().withMessage("Role name must be a string"),
            body("roleName").notEmpty().withMessage("Role name must not be empty"),
            body("roleName").isLength({ max: 255, min: 0 }).withMessage("Role name must be max 255 characters"),

            body("organization").isMongoId().withMessage("Selected organization not found"),

            body("selectedPermissions").isArray().withMessage("Selected permissions must be in form of array"),
        ];
        if(req.body.parentRole){
            validationChain.concat([
                body("parentRole").isMongoId().withMessage("Selected parent role is not valid"),
            ]);
        }

        return await super.validate(validationChain, req, res, next);
    }

    public static async deleteRole(req: Request, res: Response, next) {
        const validationChain = [
            param("id").isMongoId().escape().blacklist("\\[\\]\"'"),
        ];

        return await super.validate(validationChain, req, res, next);
    }
}

export default RolesValidator;
