import { Request, Response } from "express";
import { body, param, query } from "express-validator";
import BaseValidator from "../BaseValidator";

class Validator extends BaseValidator {
    public static async acceptInvite(req: Request, res: Response, next) {
        const validationChain = [
            body("id").isMongoId().escape().blacklist("\\[\\]\"'"),
        ];

        return await super.validate(validationChain, req, res, next);
    }

    public static async rejectInvite(req: Request, res: Response, next) {
        const validationChain = [
            body("id").isMongoId().escape().blacklist("\\[\\]\"'"),
        ];

        return await super.validate(validationChain, req, res, next);
    }
}

export default Validator;
