import { Request, Response } from "express";
import { body, param, query } from "express-validator";
import BaseValidator from "../BaseValidator";

class RolesValidator extends BaseValidator {
    public static async getKeys(req: Request, res: Response, next) {
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

    public static async getKey(req: Request, res: Response, next) {
        const validationChain = [
            param("id").isMongoId().escape().blacklist("\\[\\]\"'"),
        ];

        return await super.validate(validationChain, req, res, next);
    }

    public static async addKey(req: Request, res: Response, next) {
        const validationChain = [
            body("licenceKey").isString().withMessage("Key name must be a string"),
            body("licenceKey").notEmpty().withMessage("Key name must not be empty"),
            body("licenceKey").isLength({ max: 255, min: 25 }).withMessage("Key name must be 25 characters"),

            body("status").exists().withMessage("status can't be empty"),
            body("status").notEmpty().withMessage("status can't be empty"),
            body("status").isIn(['active','deactive','expired']).withMessage("status must be either active or deactive or expired"),

            body("userLimit").exists().withMessage("User Limit can't be empty"),
            body("userLimit").notEmpty().withMessage("User Limit can't be empty"),
            body("userLimit").isNumeric().withMessage("User Limit must be a number"),

            body("assetLimit").exists().withMessage("Asset Limit can't be empty"),
            body("assetLimit").notEmpty().withMessage("Asset Limit can't be empty"),
            body("assetLimit").isNumeric().withMessage("Asset Limit must be a number"),

            body("storageLimit").exists().withMessage("Storage Limit can't be empty"),
            body("storageLimit").notEmpty().withMessage("Storage Limit can't be empty"),
            body("storageLimit").isNumeric().withMessage("Storage Limit must be a number"),

            body("modules").isString().withMessage("modules must be a string"),
        ];

        return await super.validate(validationChain, req, res, next);
    }

    public static async editKey(req: Request, res: Response, next) {
        const validationChain = [
            body("id").isMongoId().withMessage("ID is not valid"),

            body("licenceKey").isString().withMessage("Key name must be a string"),
            body("licenceKey").notEmpty().withMessage("Key name must not be empty"),
            body("licenceKey").isLength({ max: 255, min: 25 }).withMessage("Key name must be 25 characters"),

            body("status").exists().withMessage("status can't be empty"),
            body("status").notEmpty().withMessage("status can't be empty"),
            body("status").isIn(['active','deactive','expired']).withMessage("status must be either active or deactive or expired"),

            body("userLimit").exists().withMessage("User Limit can't be empty"),
            body("userLimit").notEmpty().withMessage("User Limit can't be empty"),
            body("userLimit").isNumeric().withMessage("User Limit must be a number"),

            body("assetLimit").exists().withMessage("Asset Limit can't be empty"),
            body("assetLimit").notEmpty().withMessage("Asset Limit can't be empty"),
            body("assetLimit").isNumeric().withMessage("Asset Limit must be a number"),

            body("storageLimit").exists().withMessage("Storage Limit can't be empty"),
            body("storageLimit").notEmpty().withMessage("Storage Limit can't be empty"),
            body("storageLimit").isNumeric().withMessage("Storage Limit must be a number"),

            body("modules").isString().withMessage("modules must be a string"),
        ];

        return await super.validate(validationChain, req, res, next);
    }

    public static async deleteKey(req: Request, res: Response, next) {
        const validationChain = [
            param("id").isMongoId().escape().blacklist("\\[\\]\"'"),
        ];

        return await super.validate(validationChain, req, res, next);
    }
}

export default RolesValidator;
