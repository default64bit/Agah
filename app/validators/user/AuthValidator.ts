import { Request, Response } from "express";
import { body } from "express-validator";
import BaseValidator from "../BaseValidator";

class ProfileValidator extends BaseValidator {
    public static async login(req: Request, res: Response, next) {
        const validationChain = [
            body("username").exists().withMessage("پست الکترونیک خود را وارد کنید"),
            body("username").notEmpty().withMessage("پست الکترونیک خود را وارد کنید"),
            body("username").isEmail().withMessage("پست الکترونیک نامعتبر"),
        ];

        return await super.validate(validationChain, req, res, next);
    }

    public static async verfication(req: Request, res: Response, next) {
        const validationChain = [
            body("username").exists().withMessage("پست الکترونیک نامعتبر"),
            body("username").notEmpty().withMessage("پست الکترونیک نامعتبر"),
            body("username").isEmail().withMessage("پست الکترونیک نامعتبر"),
            
            body("code").exists().withMessage("کد را وارد کنید"),
            body("code").notEmpty().withMessage("کد را وارد کنید"),
            body("code").isLength({ max: 6, min:6 }).withMessage("کد 6 رقمی است"),
        ];

        return await super.validate(validationChain, req, res, next);
    }

    public static async register(req: Request, res: Response, next) {
        const validationChain = [
            body("username").exists().withMessage("پست الکترونیک نامعتبر"),
            body("username").notEmpty().withMessage("پست الکترونیک نامعتبر"),
            body("username").isEmail().withMessage("پست الکترونیک نامعتبر"),
            
            body("code").exists().withMessage("کد را وارد کنید"),
            body("code").notEmpty().withMessage("کد را وارد کنید"),
            body("code").isLength({ max: 6, min:6 }).withMessage("کد 6 رقمی است"),

            body("name").exists().withMessage("نام خود را وارد کنید"),
            body("name").notEmpty().withMessage("نام خود را وارد کنید"),
            body("name").isLength({ max: 20 }).withMessage("حداکثر 20 کاراکتر"),

            body("family").exists().withMessage("نام خانوادگی خود را وارد کنید"),
            body("family").notEmpty().withMessage("نام خانوادگی خود را وارد کنید"),
            body("family").isLength({ max: 30 }).withMessage("حداکثر 30 کاراکتر"),

            body("mobile").exists().withMessage("mobile can't be empty"),
            body("mobile").notEmpty().withMessage("mobile can't be empty"),
            body("mobile").trim().custom((value)=>{
                var regex = new RegExp('^(\\+98|0)?9\\d{9}$');
                if (!regex.test(value)) throw new Error('شماره موبایل معتبر نیست');
                return true;
            }),
        ];

        return await super.validate(validationChain, req, res, next);
    }
}

export default ProfileValidator;
