import { Request, Response } from "express";
import { body, param, query } from "express-validator";
import BaseValidator from "../BaseValidator";

class Validator extends BaseValidator {
    public static async getOrganizations(req: Request, res: Response, next) {
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

    public static async getOrganization(req: Request, res: Response, next) {
        const validationChain = [
            param("id").isMongoId().escape().blacklist("\\[\\]\"'"),
        ];

        return await super.validate(validationChain, req, res, next);
    }

    public static async addOrganization(req: Request, res: Response, next) {
        const validationChain = [
            body("orgName").isString().withMessage("Organization Name can't be empty"),
            body("orgName").notEmpty().withMessage("Organization Name can't be empty"),
            body("orgName").isLength({ max: 255, min: 1 }).withMessage("Organizationey name must be max 255 characters"),

            body("address").isString().withMessage("Address can't be empty"),
            body("address").notEmpty().withMessage("Address can't be empty"),
            body("address").isLength({ max: 255 }).withMessage("Address must be max 255 characters"),

            body("tel").isString().withMessage("Organization Telephone can't be empty"),
            body("tel").notEmpty().withMessage("Organization Telephone can't be empty"),
            body("tel").custom((value)=>{
                const regex = new RegExp(/^0\d{2}-\d{8}$/);
                if (!regex.test(value)) throw new Error('Organization Telephone is not valid');
                return true;
            }),
            
            body("costUnit").exists().withMessage("Cost unit can't be empty"),
            body("costUnit").notEmpty().withMessage("Cost unit can't be empty"),
            body("costUnit").isLength({ max: 3, min: 3 }).withMessage("Cost unit must be max 3 characters"),

            body("licenceKey").exists().withMessage("Licence key can't be empty"),
            body("licenceKey").notEmpty().withMessage("Licence key can't be empty"),
            body("licenceKey").isLength({ max: 25, min: 25 }).withMessage("Licence key must be 25 characters"),
        ];

        if(req.body.website){
            validationChain.concat([
                body("website").isString().withMessage("Website must be string"),
                body("website").isLength({ max: 50 }).withMessage("Website must be max 50 characters"),
            ]);
        }
        if(req.body.businessType){
            validationChain.concat([
                body("businessType").isString().withMessage("Business Type must be string"),
                body("businessType").isLength({ max: 50 }).withMessage("Website must be max 50 characters"),
            ]);
        }

        return await super.validate(validationChain, req, res, next);
    }

    public static async editOrganization(req: Request, res: Response, next) {
        const validationChain = [
            body("id").isMongoId().withMessage("ID is not valid"),

            body("orgName").isString().withMessage("Organization Name can't be empty"),
            body("orgName").notEmpty().withMessage("Organization Name can't be empty"),
            body("orgName").isLength({ max: 255, min: 1 }).withMessage("Organizationey name must be max 255 characters"),

            body("address").isString().withMessage("Address can't be empty"),
            body("address").notEmpty().withMessage("Address can't be empty"),
            body("address").isLength({ max: 255 }).withMessage("Address must be max 255 characters"),

            body("tel").isString().withMessage("Organization Telephone can't be empty"),
            body("tel").notEmpty().withMessage("Organization Telephone can't be empty"),
            body("tel").custom((value)=>{
                const regex = new RegExp(/^0\d{2}-\d{8}$/);
                if (!regex.test(value)) throw new Error('Organization Telephone is not valid');
                return true;
            }),
            
            body("costUnit").exists().withMessage("Cost unit can't be empty"),
            body("costUnit").notEmpty().withMessage("Cost unit can't be empty"),
            body("costUnit").isLength({ max: 3, min: 3 }).withMessage("Cost unit must be max 3 characters"),
        ];

        if(req.body.website){
            validationChain.concat([
                body("website").isString().withMessage("Website must be string"),
                body("website").isLength({ max: 50 }).withMessage("Website must be max 50 characters"),
            ]);
        }
        if(req.body.businessType){
            validationChain.concat([
                body("businessType").isString().withMessage("Business Type must be string"),
                body("businessType").isLength({ max: 50 }).withMessage("Website must be max 50 characters"),
            ]);
        }

        return await super.validate(validationChain, req, res, next);
    }

    public static async deleteOrganization(req: Request, res: Response, next) {
        const validationChain = [
            param("id").isMongoId().escape().blacklist("\\[\\]\"'"),
        ];

        return await super.validate(validationChain, req, res, next);
    }
}

export default Validator;
