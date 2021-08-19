import { Request, Response } from "express";
import { validationResult } from "express-validator";

class BaseValidator {
    public static async validate(validationChain, req: Request, res: Response, next) {
        await Promise.all(validationChain.map((validation) => validation.run(req)));
        const validationResults = validationResult(req);
        if (!validationResults.isEmpty()) {
            let validatorError = validationResults.array({ onlyFirstError: true })[0];

            return res.status(422).json({
                error: validatorError.msg,
                field: validatorError.param,
            });
        }
        return next();
    }
}

export default BaseValidator;
