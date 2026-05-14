
import { Request, Response } from "express";

import { User } from "../../models/user.model";
import Joi from "joi";
import mongoose from "mongoose";

export interface AuthenticatedRequest extends Request {
    user?: { id: string; role: string };
}

export const List = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        const select = 'avatar_id createdAt email role username verifyed reward_points block deleted'

        User.find({ role: "user" }).select(select).lean().then((list) => {
            return res.status(200).json({ list });
        })
    } catch (error) {
        console.log("err", error);
        return res.status(500).json({ message: 'Server error' });
    }
}

export const Block = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        const Schema = Joi.object({
            id: Joi.string().hex().length(24).required(),
            status: Joi.bool().required()
        }).required()

        const { error, value } = Schema.validate(req.body, { abortEarly: true, errors: { label: "key", wrap: { label: false } } });

        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        } else {
            User.updateOne({ _id: new mongoose.Types.ObjectId(value.id) }, { $set: { block: value.status } })
                .then(() => {
                    return res.status(200).json({ success: true });
                })
        }
    } catch (error) {
        console.log("err", error);
        return res.status(500).json({ message: 'Server error' });
    }
}

export const Delete = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        const Schema = Joi.object({
            id: Joi.string().hex().length(24).required(),
            status: Joi.bool().required()
        }).required()

        const { error, value } = Schema.validate(req.body, { abortEarly: true, errors: { label: "key", wrap: { label: false } } });

        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        } else {
            User.updateOne({ _id: new mongoose.Types.ObjectId(value.id) }, { $set: { deleted: value.status } })
                .then(() => {
                    return res.status(200).json({ success: true });
                })
        }
    } catch (error) {
        console.log("err", error);
        return res.status(500).json({ message: 'Server error' });
    }
}