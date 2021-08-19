import { Request } from "express";
import {IAdmin} from "../models/Admin";
import {IUser} from "../models/User";

interface AuthenticatedRequest extends Request {
    admin?: IAdmin;
    user?: IUser;
}

export default AuthenticatedRequest;
