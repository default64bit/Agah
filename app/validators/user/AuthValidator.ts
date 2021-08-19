import { Request, Response } from "express";
import { body } from "express-validator";
import BaseValidator from "../BaseValidator";

class ProfileValidator extends BaseValidator {
    public static async register(req: Request, res: Response, next) {
        const validationChain = [
            body("name").exists().withMessage("First name can't be empty"),
            body("name").notEmpty().withMessage("First name can't be empty"),
            body("name").isLength({ max: 100 }).withMessage("First name max lenght is 100 characters"),

            body("family").exists().withMessage("Last name can't be empty"),
            body("family").notEmpty().withMessage("Last name can't be empty"),
            body("family").isLength({ max: 100 }).withMessage("Last name max lenght is 100 characters"),

            body("email").exists().withMessage("Email can't be empty"),
            body("email").notEmpty().withMessage("Email can't be empty"),
            body("email").isLength({ max: 100 }).withMessage("Email max lenght is 100 characters"),

            body("password").exists().withMessage("Password can't be empty"),
            body("password").notEmpty().withMessage("Password can't be empty"),
            body("password").isLength({ max: 100 }).withMessage("Password max lenght is 100 characters"),
            body("password").isLength({ min: 8 }).withMessage("Password must be atleast 8 characters"),

            body("termCheck").exists().withMessage("Please check the terms and policies"),
            body("termCheck").notEmpty().withMessage("Please check the terms and policies"),
            body("termCheck").isIn(['true','false']).withMessage("Please check the terms and policies"),
        ];

        return await super.validate(validationChain, req, res, next);
    }
}

export default ProfileValidator;
