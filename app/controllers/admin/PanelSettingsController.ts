import { Request, Response } from "express";
import AuthenticatedRequest from "../../interfaces/AuthenticatedRequest";
import adminPermissionCheck from "../../helpers/adminPermissionCheck";
import PanelSettings from "../../models/PanelSettings";

class PanelSettingsController {
    public async getSettings(req: AuthenticatedRequest, res: Response) {
        if (!adminPermissionCheck(req, req.admin)) return res.status(403).end();

        const panelSettings = await PanelSettings.model.findOne().exec();

        res.json(panelSettings);
    }

    public async updateSettings(req: AuthenticatedRequest, res: Response) {
        const companyName = req.body.companyName.toString();
        const locale = req.body.locale.toString();
        const theme = req.body.theme.toString();
        const panelSettings = await PanelSettings.model
            .updateOne(
                {},
                {
                    companyName: companyName,
                    locale: locale,
                    theme: theme,
                },
                {
                    upsert: true,
                }
            )
            .exec();

        return res.end();
    }
}

export default PanelSettingsController;
