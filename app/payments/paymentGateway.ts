import { Request } from "express";
import { GatewayInterface, TransactionResponse, VerficationResponseInterface } from "./GatewayInterface";
import { Gateway as Zarinpal } from "./methods/zarinpal";
import { Gateway as PayIr } from "./methods/payir";

export class PaymentGateway implements GatewayInterface {
    public method: string;
    private apiKey: string;
    private gateway: GatewayInterface;

    public constructor(method: string) {
        this.method = method;
        switch (this.method) {
            case "zarinpal":
                this.apiKey = process.env.ZARINPAL_KEY;
                this.gateway = new Zarinpal();
                break;
            case "pay_ir":
                this.apiKey = process.env.PAY_IR_KEY;
                this.gateway = new PayIr();
                break;
        }
    }

    public async getIdentifier(apiKey: string, amount: number, redirect: string, description: string, mobile?): Promise<string> {
        return await this.gateway.getIdentifier(apiKey, amount, redirect, description, mobile);
    }
    public getGatewayUrl(identifier: string): string {
        return this.gateway.getGatewayUrl(identifier);
    }
    public getTransactionResponse(req: Request): TransactionResponse {
        return this.gateway.getTransactionResponse(req);
    }
    public async verify(apiKey: string, identifier: string, extra?): Promise<VerficationResponseInterface> {
        return await this.gateway.verify(apiKey, identifier, extra);
    }

    public getMethod() {
        return this.method;
    }
    public getApiKey() {
        return this.apiKey;
    }
}
