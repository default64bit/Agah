import { Request, Response } from "express";
import { body, param, query } from "express-validator";
import BaseValidator from "../BaseValidator";

class Validator extends BaseValidator {
    public static async getUsers(req: Request, res: Response, next) {
        const validationChain = [
            query("page").escape(),
            query("pp").escape(),
            query("sort").escape(),
            query("sort_type").escape(),
            query("search")
                .escape()
                .blacklist("\\[\\]\"'"),
        ];

        return await super.validate(validationChain, req, res, next);
    }

    public static async getUser(req: Request, res: Response, next) {
        const validationChain = [
            param("id")
                .isMongoId()
                .escape()
                .blacklist("\\[\\]\"'"),
        ];

        return await super.validate(validationChain, req, res, next);
    }

    public static async editUser(req: Request, res: Response, next) {
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

            body("emailVerified").exists().withMessage("emailVerified can't be empty"),
            body("emailVerified").notEmpty().withMessage("emailVerified can't be empty"),
            body("emailVerified").isIn(['true','false']).withMessage("emailVerified must be either true or false"),

            body("mobile").exists().withMessage("mobile can't be empty"),
            body("mobile").notEmpty().withMessage("mobile can't be empty"),
            body("mobile").isLength({ max: 11 }).withMessage("max lenght is 11 characters"),

            body("mobileVerified").exists().withMessage("mobileVerified can't be empty"),
            body("mobileVerified").notEmpty().withMessage("mobileVerified can't be empty"),
            body("mobileVerified").isIn(['true','false']).withMessage("mobileVerified must be either true or false"),

            body("status").exists().withMessage("status can't be empty"),
            body("status").notEmpty().withMessage("status can't be empty"),
            body("status").isIn(['active','deactive']).withMessage("status must be either active or deactive"),
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

    public static async deleteUser(req: Request, res: Response, next) {
        const validationChain = [
            param("id")
                .isMongoId()
                .escape()
                .blacklist("\\[\\]\"'"),
        ];

        return await super.validate(validationChain, req, res, next);
    }
}

export default Validator;
