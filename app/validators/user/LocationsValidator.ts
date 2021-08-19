import { Request, Response } from "express";
import { body, param, query } from "express-validator";
import BaseValidator from "../BaseValidator";

class Validator extends BaseValidator {
    public static async getLocations(req: Request, res: Response, next) {
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

    public static async getLocation(req: Request, res: Response, next) {
        const validationChain = [
            param("id").isMongoId().escape().blacklist("\\[\\]\"'"),
        ];

        return await super.validate(validationChain, req, res, next);
    }

    public static async addLocation(req: Request, res: Response, next) {
        const validationChain = [
            body("name").isString().withMessage("Name must be a string"),
            body("name").notEmpty().withMessage("Name must not be empty"),
            body("name").isLength({ max: 50 }).withMessage("Name must be max 50 characters"),

            body("address").isString().withMessage("Address must be a string"),
            body("address").notEmpty().withMessage("Address must not be empty"),
            body("address").isLength({ max: 255 }).withMessage("Address must be max 255 characters"),

            body("withMapCoordinates").isString().withMessage("withMapCoordinates must be a string"),
            body("withMapCoordinates").notEmpty().withMessage("withMapCoordinates must not be empty"),
            body("withMapCoordinates").isIn(['true','false']).withMessage("withMapCoordinates must be true of false"),
        ];
        
        if(req.body.laborCost){
            validationChain.concat([
                body("description").isString().withMessage("Description must be a string"),
                body("description").isLength({ max: 500 }).withMessage("Description must be max 500 characters"),
            ]);
        }
        if(req.body.mapCoordinates){
            validationChain.concat([
                body("mapCoordinates").isObject().withMessage("mapCoordinates must be an object"),
            ]);
        }

        return await super.validate(validationChain, req, res, next);
    }

    public static async editLocation(req: Request, res: Response, next) {
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

    public static async deleteLocation(req: Request, res: Response, next) {
        const validationChain = [
            param("id").isMongoId().escape().blacklist("\\[\\]\"'"),
        ];

        return await super.validate(validationChain, req, res, next);
    }
}

export default Validator;
