import { Request, Response } from "express";
import jwt from "jsonwebtoken";

export const getPayload = (req: Request, tokenName: string, secret: string): string | jwt.JwtPayload => {
    let token = "";
    if (req.headers[tokenName]) token = req.headers[tokenName].toString();
    if (req.cookies[tokenName]) token = req.cookies[tokenName].toString();
    if (!token) return "";
    return jwt.verify(token, secret);
};
