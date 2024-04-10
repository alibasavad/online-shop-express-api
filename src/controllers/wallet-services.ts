import { NextFunction, Response } from "express";
import ZarinPal from "zarinpal-checkout";
import env from "../configs/env.json";
import { AppError } from "../handlers/error-handler";
import { normalizer } from "../handlers/response";
import { InvoiceType, RequestType, WalletType } from "../interfaces/index";
import { Invoice } from "../models/invoice";
import { Wallet } from "../models/wallet";

// read user wallet
export const readWallet = async (
    req: RequestType,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (req.isAuthenticated === false) {
            throw new AppError(328);
        }

        let wallet: WalletType | null = await Wallet.findOne({
            user: req.user?._id,
        });

        if (wallet === null) {
            wallet = new Wallet({ user: req.user?._id });
            wallet = await wallet.save();
        }

        normalizer(req, res, {
            result: wallet,
            messageCode: 100,
        });
    } catch (error) {
        return next(error);
    }
};

// deposit to wallet
export const deposit = async (
    req: RequestType,
    res: Response,
    next: NextFunction
) => {
    try {
        if (req.isAuthenticated === false) {
            throw new AppError(328);
        }

        let wallet: WalletType | null = await Wallet.findOne({
            user: req.user?._id,
        });

        if (wallet === null) {
            wallet = new Wallet({ user: req.user?._id });
            wallet = await wallet.save();
        }

        // use zarinpal gateway
        const zarinpal = ZarinPal.create(env.MERCHANT_ID, true);

        zarinpal
            .PaymentRequest({
                Amount: req.body.amount,
                CallbackURL:
                    "http://127.0.0.1:8000/api/v1/wallet/deposit/verify",
                Description: "Sandbox Test",
                Email: req.user?.email,
                Mobile: req.user?.phoneNumber,
            })
            .then(async (response) => {
                if (response.status == 100) {
                    await new Invoice({
                        user: req.user?._id,
                        authority: response.authority,
                        amount: req.body.amount,
                    }).save();
                    return res.redirect(response.url);
                }
            });
    } catch (error) {
        return next(error);
    }
};

// verify deposit
export const verification = async (
    req: RequestType,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const zarinpal = ZarinPal.create(env.MERCHANT_ID, true);

        let invoice: InvoiceType | null = await Invoice.findOne({
            authority: req.query.Authority,
        });

        if (invoice === null || invoice.amount === undefined)
            throw new AppError(300);

        if (invoice.result !== undefined) throw new AppError(330);

        let wallet: WalletType | null = await Wallet.findOne({
            user: invoice.user,
        });

        if (wallet === null) throw new AppError(300);

        let refId = await zarinpal
            .PaymentVerification({
                Amount: invoice.amount,
                Authority: req.query.Authority?.toString() || "",
            })
            .then(function (response) {
                if (response.status == 100) {
                    if (invoice === null) throw new AppError(300);
                    invoice.result = true;
                } else {
                    if (invoice === null) throw new AppError(300);
                    invoice.result = false;
                }
                return response.RefID;
            });

        invoice.trackerId = refId.toString();

        await invoice.save();

        if (!invoice.result) throw new AppError(332);

        wallet.credit += invoice.amount;

        await wallet.save();

        normalizer(req, res, {
            result: wallet,
            messageCode: 134,
        });
    } catch (error) {
        return next(error);
    }
};
