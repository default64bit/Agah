import { Request, Response } from "express";
import { body, param, query } from "express-validator";
import BaseValidator from "../BaseValidator";

class Validator extends BaseValidator {
    public static async getStores(req: Request, res: Response, next) {
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

    public static async getStore(req: Request, res: Response, next) {
        const validationChain = [
            param("id").isMongoId().escape().blacklist("\\[\\]\"'"),
        ];

        return await super.validate(validationChain, req, res, next);
    }

    public static async addStore(req: Request, res: Response, next) {
        const validationChain = [
            body("name").isString().withMessage("Name must be a string"),
            body("name").notEmpty().withMessage("Name must not be empty"),
            body("name").isLength({ max: 50 }).withMessage("Name must be max 50 characters"),
        ];
        
        if(req.body.laborCost){
            validationChain.concat([
                body("description").isString().withMessage("Description must be a string"),
                body("description").isLength({ max: 500 }).withMessage("Description must be max 500 characters"),
            ]);
        }

        return await super.validate(validationChain, req, res, next);
    }

    public static async editStore(req: Request, res: Response, next) {
        const validationChain = [
            body("name").isString().withMessage("Name must be a string"),
            body("name").notEmpty().withMessage("Name must not be empty"),
            body("name").isLength({ max: 50 }).withMessage("Name must be max 50 characters"),
        ];
        
        if(req.body.laborCost){
            validationChain.concat([
                body("description").isString().withMessage("Description must be a string"),
                body("description").isLength({ max: 500 }).withMessage("Description must be max 500 characters"),
            ]);
        }

        return await super.validate(validationChain, req, res, next);
    }

    public static async deleteStore(req: Request, res: Response, next) {
        const validationChain = [
            param("id").isMongoId().escape().blacklist("\\[\\]\"'"),
        ];

        return await super.validate(validationChain, req, res, next);
    }
}

export default Validator;
