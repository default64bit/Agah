import { Request, Response } from "express";
import AuthenticatedRequest from "../../interfaces/AuthenticatedRequest";
import Admin from "../../models/Admin";
import Schedule from "../../models/Schedule";
import TimeOffSchedule from "../../models/TimeOffSchedule";
import BookedSchedule from "../../models/BookedSchedule";

class Controller {
    public async bookConsultationSession(req: AuthenticatedRequest, res: Response) {
        // TODO
        // check if the time is in consulter schedule
        // check if the time is not holiday or in off day of consulter
        // check if anyone is booked this time before or not
        // also check if this user has any unpayed booked session and make them canceled

        // send a request to pay.ir and get the identifier
        // save a record and identifyer
        // send the identifier to front so that it can be redirected to payment gateway
    }
}

export default Controller;
