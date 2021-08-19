import { Request, Response } from "express";
import { body, param, query } from "express-validator";
import BaseValidator from "../BaseValidator";

class AdminsValidator extends BaseValidator {
    public static async getAdmins(req: Request, res: Response, next) {
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

        if (req.query.status) {
            validationChain.push(
                query("status").notEmpty().isString().withMessage("status not valid")
            );
        }

        return await super.validate(validationChain, req, res, next);
    }

    public static async getAdmin(req: Request, res: Response, next) {
        const validationChain = [
            param("id").isMongoId().escape().blacklist("\\[\\]\"'"),
        ];

        return await super.validate(validationChain, req, res, next);
    }

    public static async addAdmin(req: Request, res: Response, next) {
        const validationChain = [
            body("name").exists().withMessage("name can't be empty"),
            body("name").notEmpty().withMessage("name can't be empty"),
            body("name").isString().withMessage("name must be string of characters"),
            body("name").isLength({ max: 100 }).withMessage("max lenght is 100 characters"),

            body("family").exists().withMessage("family can't be empty"),
            body("family").notEmpty().withMessage("family can't be empty"),
            body("family").isString().withMessage("name must be string of characters"),
            body("family").isLength({ max: 100 }).withMessage("max lenght is 100 characters"),

            body("email").exists().withMessage("email can't be empty"),
            body("email").notEmpty().withMessage("email can't be empty"),
            body("email").isEmail().withMessage("email format is incorrect"),
            body("email").isLength({ max: 255 }).withMessage("max lenght is 255 characters"),

            body("status").exists().withMessage("status can't be empty"),
            body("status").notEmpty().withMessage("status can't be empty"),
            body("status").isIn(['active','deactive']).withMessage("status must be either active or deactive"),

            body("role").exists().withMessage("role can't be empty"),
            body("role").notEmpty().withMessage("role can't be empty"),
            body("role").isMongoId().withMessage("role value must be a valid ID"),

            body("password").exists().withMessage("password can't be empty"),
            body("password").notEmpty().withMessage("password can't be empty"),
            body("password").isLength({ max: 30, min: 8 }).withMessage("password must be atleast 8 characters"),
        ];

        return await super.validate(validationChain, req, res, next);
    }

    public static async editAdmin(req: Request, res: Response, next) {
        const validationChain = [
            body("id").isMongoId().withMessage("ID is not valid"),

            body("avatarFile").exists().withMessage("avatar file can't be empty"),
            body("avatarFile").isString().withMessage("avatar file must be valid url"),

            body("name").exists().withMessage("name can't be empty"),
            body("name").notEmpty().withMessage("name can't be empty"),
            body("name").isString().withMessage("name must be string of characters"),
            body("name").isLength({ max: 100 }).withMessage("max lenght is 100 characters"),

            body("family").exists().withMessage("family can't be empty"),
            body("family").notEmpty().withMessage("family can't be empty"),
            body("family").isString().withMessage("name must be string of characters"),
            body("family").isLength({ max: 100 }).withMessage("max lenght is 100 characters"),

            body("email").exists().withMessage("email can't be empty"),
            body("email").notEmpty().withMessage("email can't be empty"),
            body("email").isEmail().withMessage("email format is incorrect"),
            body("email").isLength({ max: 255 }).withMessage("max lenght is 255 characters"),

            body("status").exists().withMessage("status can't be empty"),
            body("status").notEmpty().withMessage("status can't be empty"),
            body("status").isIn(['active','deactive']).withMessage("status must be either active or deactive"),

            body("role").exists().withMessage("role can't be empty"),
            body("role").notEmpty().withMessage("role can't be empty"),
            body("role").isMongoId().withMessage("role value must be a valid ID"),
        ];

        if(req.body.password){
            validationChain.concat([
                body("password").exists().withMessage("password can't be empty"),
                body("password").notEmpty().withMessage("password can't be empty"),
                body("password").isLength({ max: 30, min: 8 }).withMessage("password must be atleast 8 characters"),
            ]);
        }

        return await super.validate(validationChain, req, res, next);
    }

    public static async deleteAdmin(req: Request, res: Response, next) {
        const validationChain = [
            param("id").isMongoId().escape().blacklist("\\[\\]\"'"),
        ];

        return await super.validate(validationChain, req, res, next);
    }
}

export default AdminsValidator;
