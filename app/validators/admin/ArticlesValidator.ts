import { Request, Response } from "express";
import { body, param, query } from "express-validator";
import BaseValidator from "../BaseValidator";

class Validator extends BaseValidator {
    public static async getArticles(req: Request, res: Response, next) {
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

    public static async getArticle(req: Request, res: Response, next) {
        const validationChain = [
            param("id").isMongoId().escape().blacklist("\\[\\]\"'"),
        ];

        return await super.validate(validationChain, req, res, next);
    }

    public static async addArticle(req: Request, res: Response, next) {
        const validationChain = [
            body("title").isString().withMessage("title must be a string"),
            body("title").notEmpty().withMessage("title must not be empty"),
            body("title").isLength({ max: 75 }).withMessage("title must be max 75 characters"),

            body("desc").isString().withMessage("description must be a string"),
            body("desc").notEmpty().withMessage("description must not be empty"),
            body("desc").isLength({ max: 250 }).withMessage("description must be max 250 characters"),

            body("status").exists().withMessage("status can't be empty"),
            body("status").notEmpty().withMessage("status can't be empty"),
            body("status").isIn(['published','pending']).withMessage("status must be either published or pending"),

            body("metaDesc").isString().withMessage("metadata description must be a string"),
            body("metaDesc").notEmpty().withMessage("metadata description must not be empty"),
            body("metaDesc").isLength({ max: 150 }).withMessage("metadata description must be max 150 characters"),

            body("metaTags").isString().withMessage("meta tags must be a string"),
            body("metaTags").notEmpty().withMessage("meta tags must not be empty"),

            body("text").isString().withMessage("text must be a string"),
            body("text").notEmpty().withMessage("text must not be empty"),
        ];

        return await super.validate(validationChain, req, res, next);
    }

    public static async editArticle(req: Request, res: Response, next) {
        const validationChain = [
            body("id").isMongoId().withMessage("ID is not valid"),

            body("title").isString().withMessage("title must be a string"),
            body("title").notEmpty().withMessage("title must not be empty"),
            body("title").isLength({ max: 75 }).withMessage("title must be max 75 characters"),

            body("desc").isString().withMessage("description must be a string"),
            body("desc").notEmpty().withMessage("description must not be empty"),
            body("desc").isLength({ max: 250 }).withMessage("description must be max 250 characters"),

            body("status").exists().withMessage("status can't be empty"),
            body("status").notEmpty().withMessage("status can't be empty"),
            body("status").isIn(['published','pending']).withMessage("status must be either published or pending"),

            body("metaDesc").isString().withMessage("metadata description must be a string"),
            body("metaDesc").notEmpty().withMessage("metadata description must not be empty"),
            body("metaDesc").isLength({ max: 150 }).withMessage("metadata description must be max 150 characters"),

            body("metaTags").isString().withMessage("meta tags must be a string"),
            body("metaTags").notEmpty().withMessage("meta tags must not be empty"),

            body("text").isString().withMessage("text must be a string"),
            body("text").notEmpty().withMessage("text must not be empty"),
        ];

        return await super.validate(validationChain, req, res, next);
    }

    public static async deleteArticle(req: Request, res: Response, next) {
        const validationChain = [
            param("id").isMongoId().escape().blacklist("\\[\\]\"'"),
        ];

        return await super.validate(validationChain, req, res, next);
    }
}

export default Validator;
