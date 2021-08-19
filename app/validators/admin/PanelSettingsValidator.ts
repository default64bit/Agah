import { Request, Response } from "express";
import { body, param, query } from "express-validator";
import BaseValidator from "../BaseValidator";

class PanelSettingsValidator extends BaseValidator {
    public static async editAdmin(req: Request, res: Response, next) {
        const validationChain = [
            body("companyName").isString().withMessage("Compnay name must be a string"),
            body("companyName").notEmpty().withMessage("Compnay name must not be empty"),
            body("companyName").exists().withMessage("Compnay name must not be empty"),
            body("companyName").isLength({ max: 255, min: 0 }).withMessage("Compnay name must be max 255 characters"),
            
            body("locale").isString().withMessage("Language must be a string"),
            body("locale").notEmpty().withMessage("Language must not be empty"),
            body("locale").exists().withMessage("Language must not be empty"),
            body("locale").isLength({ max: 2, min: 0 }).withMessage("Language must be max 2 characters"),
            
            body("theme").isString().withMessage("Theme must be a string"),
            body("theme").notEmpty().withMessage("Theme must not be empty"),
            body("theme").exists().withMessage("Language must not be empty"),
        ];

        return await super.validate(validationChain, req, res, next);
    }
}

export default PanelSettingsValidator;
