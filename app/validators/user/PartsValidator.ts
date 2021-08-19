import { Request, Response } from "express";
import { body, param, query } from "express-validator";
import BaseValidator from "../BaseValidator";

class Validator extends BaseValidator {
    public static async getParts(req: Request, res: Response, next) {
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

        if (req.query.store) {
            validationChain.push(
                query("store").isMongoId().withMessage("selected store is not valid")
            );
        }

        return await super.validate(validationChain, req, res, next);
    }

    public static async getPart(req: Request, res: Response, next) {
        const validationChain = [
            param("id").isMongoId().escape().blacklist("\\[\\]\"'"),
        ];

        return await super.validate(validationChain, req, res, next);
    }

    public static async restockPart(req: Request, res: Response, next) {
        const validationChain = [
            param("id").isMongoId().escape().blacklist("\\[\\]\"'"),

            body("newQuantity").isNumeric().withMessage("New Quantity must be a number"),
            body("newQuantity").notEmpty().withMessage("New Quantity must not be empty"),
            body("newQuantity").isLength({ min: 1 }).withMessage("New Quantity must be atleast 1"),
        ];

        if(req.body.description){
            validationChain.concat([
                body("description").isString().withMessage("Description must be a string"),
                body("description").isLength({ max: 200 }).withMessage("Description must be max 200 characters"),
            ]);
        }

        return await super.validate(validationChain, req, res, next);
    }

    public static async addPart(req: Request, res: Response, next) {
        const validationChain = [
            body("code").isString().withMessage("Code must be a string"),
            body("code").notEmpty().withMessage("Code must not be empty"),
            body("code").isLength({ max: 15 }).withMessage("Code must be max 50 characters"),

            body("name").isString().withMessage("Name must be a string"),
            body("name").notEmpty().withMessage("Name must not be empty"),
            body("name").isLength({ max: 50 }).withMessage("Name must be max 50 characters"),

            body("currentLevel").isNumeric().withMessage("Current Level must be numeric"),
            body("currentLevel").notEmpty().withMessage("Current Level must not be empty"),
            body("currentLevel").isLength({ min: 0 }).withMessage("Current Level cannot be lower than 0"),

            body("cost").isNumeric().withMessage("Cost must be a numeric"),
            body("cost").notEmpty().withMessage("Cost must not be empty"),
            body("cost").isLength({ min: 0 }).withMessage("Cost cannot be lower than 0"),
        ];
        
        if(req.body.description){
            validationChain.concat([
                body("description").isString().withMessage("Description must be a string"),
                body("description").isLength({ max: 500 }).withMessage("Description must be max 500 characters"),
            ]);
        }
        if(req.body.minLevel){
            validationChain.concat([
                body("minLevel").isNumeric().withMessage("Minimum Level must be numeric"),
                body("minLevel").isLength({ min: 0 }).withMessage("Minimum Level cannot be lower than 0"),
            ]);
        }
        if(req.body.maxLevel){
            validationChain.concat([
                body("maxLevel").isNumeric().withMessage("Maximum Level must be numeric"),
                body("maxLevel").isLength({ min: 0 }).withMessage("Maximum Level cannot be lower than 0"),
            ]);
        }
        if(req.body.specs){
            validationChain.concat([
                body("specs").isString().escape().withMessage("Specs must be in array form"),
            ]);
        }
        if(req.body.store){
            validationChain.concat([
                body("store").isMongoId().withMessage("Store does not exists"),
            ]);
        }

        return await super.validate(validationChain, req, res, next);
    }

    public static async editPart(req: Request, res: Response, next) {
        const validationChain = [
            body("id").isMongoId().withMessage("ID is not valid"),

            body("code").isString().withMessage("Code must be a string"),
            body("code").notEmpty().withMessage("Code must not be empty"),
            body("code").isLength({ max: 15 }).withMessage("Code must be max 50 characters"),

            body("name").isString().withMessage("Name must be a string"),
            body("name").notEmpty().withMessage("Name must not be empty"),
            body("name").isLength({ max: 50 }).withMessage("Name must be max 50 characters"),

            body("cost").isNumeric().withMessage("Cost must be a numeric"),
            body("cost").notEmpty().withMessage("Cost must not be empty"),
            body("cost").isLength({ min: 0 }).withMessage("Cost cannot be lower than 0"),
        ];
        
        if(req.body.description){
            validationChain.concat([
                body("description").isString().withMessage("Description must be a string"),
                body("description").isLength({ max: 500 }).withMessage("Description must be max 500 characters"),
            ]);
        }
        if(req.body.minLevel){
            validationChain.concat([
                body("minLevel").isNumeric().withMessage("Minimum Level must be numeric"),
                body("minLevel").isLength({ min: 0 }).withMessage("Minimum Level cannot be lower than 0"),
            ]);
        }
        if(req.body.maxLevel){
            validationChain.concat([
                body("maxLevel").isNumeric().withMessage("Maximum Level must be numeric"),
                body("maxLevel").isLength({ min: 0 }).withMessage("Maximum Level cannot be lower than 0"),
            ]);
        }
        if(req.body.specs){
            validationChain.concat([
                body("specs").isString().escape().withMessage("Specs must be in array form"),
            ]);
        }
        if(req.body.store){
            validationChain.concat([
                body("store").isMongoId().withMessage("Store does not exists"),
            ]);
        }

        return await super.validate(validationChain, req, res, next);
    }

    public static async deletePart(req: Request, res: Response, next) {
        const validationChain = [
            param("id").isMongoId().escape().blacklist("\\[\\]\"'"),
        ];

        return await super.validate(validationChain, req, res, next);
    }
}

export default Validator;
