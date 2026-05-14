import fs from "fs";
import Joi from "joi";
import path from "path";
import mongoose from "mongoose";
import { Request, Response } from "express";

import { Avatar } from "../../models/avatar.model";

export interface AuthenticatedRequest extends Request {
    user?: { id: string; role: string };
}

export const List = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        Avatar.find({}).select("filename createdAt isActive").lean().then((list) => {
            return res.status(200).json({ list });
        })
    } catch (error) {
        console.log("err", error);
        return res.status(500).json({ message: 'Server error' });
    }
}