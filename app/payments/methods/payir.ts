import axios from "axios";
import { Request } from "express";
import { GatewayInterface, TransactionResponse, VerficationResponseInterface } from "../GatewayInterface";

export class Gateway implements GatewayInterface {
    public async getIdentifier(apiKey: string, amount: number, redirect: string, description: string, mobile?): Promise<string> {
        let identifier = "";
        await axios
            .post("https://pay.ir/pg/send", { api: apiKey, amount: amount * 10, redirect: redirect, description: description, mobile: mobile })
            .then((response) => {
                if (response.data.status == 1 && response.data.token) identifier = response.data.token;
            })
            .catch((error) => {
                // TODO : log the error in logger
            });
        return identifier;
    }

    public getGatewayUrl(identifier: string): string {
        return `https://pay.ir/pg/${identifier}`;
    }

    public getTransactionResponse(req: Request): TransactionResponse {
        const response = {
            status: "",
            identifier: req.query.token.toString(),
        };
        if (req.query.status == "1") response.status = "OK";
        else response.status = "NOK";
        return response;
    }

    public async verify(apiKey: string, identifier: string, extra?): Promise<VerficationResponseInterface> {
        return new Promise(async (resolve, reject) => {
            await axios
                .post("https://pay.ir/pg/verify", {
                    api: apiKey,
                    token: identifier,
                })
                .then((response) => {
                    resolve({
                        transactionCode: response.data.transId,
                        status: response.data.status,
                        other: response.data,
                    });
                })
                .catch((error) => {
                    reject(error);
                    // TODO : log the error in logger
                });
        });
    }
}
