import { Request, Response } from "express";
import { body } from "express-validator";
import BaseValidator from "../BaseValidator";

class ProfileValidator extends BaseValidator {
    public static async updateInfo(req: Request, res: Response, next) {
        const validationChain = [
            body("firstName").exists().withMessage("name can't be empty"),
            body("firstName").notEmpty().withMessage("name can't be empty"),
            body("firstName").isLength({ max: 100 }).withMessage("max lenght is 100 characters"),

            body("lastName").exists().withMessage("family can't be empty"),
            body("lastName").notEmpty().withMessage("family can't be empty"),
            body("lastName").isLength({ max: 100 }).withMessage("max lenght is 100 characters"),
        ];

        return await super.validate(validationChain, req, res, next);
    }

    public static async changePassword(req: Request, res: Response, next) {
        const validationChain = [
            body("oldPassword").exists().withMessage("old password is required"),
            body("oldPassword").notEmpty().withMessage("old password can't be empty"),
            body("oldPassword").isLength({ max: 30, min: 8 }).withMessage("password must be atleast 8 characters"),

            body("newPassword").exists().withMessage("new password is required"),
            body("newPassword").notEmpty().withMessage("new password can't be empty"),
            body("newPassword").isLength({ max: 30, min: 8 }).withMessage("password must be atleast 8 characters"),

            body("newPasswordConfirmation").exists().withMessage("family can't be empty"),
            body("newPasswordConfirmation").isLength({ max: 30, min: 8 }).withMessage("password must be atleast 8 characters"),
            body("newPasswordConfirmation").custom((value,{req})=>{
                if (value !== req.body.newPassword) throw new Error('Password confirmation does not match password');
                return true;
            }),
        ];

        return await super.validate(validationChain, req, res, next);
    }
}

export default ProfileValidator;
