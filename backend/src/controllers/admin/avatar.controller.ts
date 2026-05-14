import fs from "fs";
import Joi from "joi";
import path from "path";
import mongoose from "mongoose";
import { Request, Response } from "express";

import { Avatar } from "../../models/avatar.model";

export interface AuthenticatedRequest extends Request {
    user?: { id: string; role: string };
}

export const Create = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        const Schema = Joi.object({
            fieldname: Joi.string().valid('avatar').required(),
            originalname: Joi.string().required(),
            encoding: Joi.string().required(),
            mimetype: Joi.string().valid('image/jpeg', 'image/png', 'image/gif', 'image/webp').required(),
            size: Joi.number().max(15 * 1024 * 1024).required(), // 15MB max
            destination: Joi.string().required(),
            filename: Joi.string().required(),
            path: Joi.string().required()
        }).required()

        const { error } = Schema.validate(req.file, { abortEarly: false, errors: { label: "key", wrap: { label: false } } });

        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        } else {
            if (req?.file?.filename) {
                const avatar = new Avatar({
                    filename: req.file.filename,
                    path: req.file.path,
                    isActive: false
                });
                await avatar.save();
                return res.status(201).json({ message: 'Avatar Create successfully!' });
            }
        }
    } catch (error) {
        console.log("err", error);
        return res.status(500).json({ message: 'Server error' });
    }
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


export const Delete = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        const Schema = Joi.object({
            id: Joi.string().hex().length(24).required()
        }).required()

        const { error, value } = Schema.validate(req.params, { abortEarly: false, errors: { label: "key", wrap: { label: false } } });

        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        } else {
            Avatar.findOne({ _id: new mongoose.Types.ObjectId(value.id) }).then(async (avatar) => {
                if (avatar) {

                    const filePath = path.join(__dirname, '..', '..', '..', 'uploads', 'avatars', avatar.filename);
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }

                    await Avatar.deleteOne({ _id: new mongoose.Types.ObjectId(value.id) })
                    return res.status(200).json({ message: 'Avatar Deleted successfully!' });
                } else {
                    return res.status(404).json({ message: 'Avatar not found' });
                }
            })
        }
    } catch (error) {
        console.log("err", error);
        return res.status(500).json({ message: 'Server error' });
    }
}

export const Manage = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {

        const Schema = Joi.object({
            id: Joi.string().hex().length(24).required(),
            active: Joi.bool().required()
        }).required()

        const { error, value } = Schema.validate(req.body, { abortEarly: false, errors: { label: "key", wrap: { label: false } } });

        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        } else {
            const avatar = await Avatar.findById(value.id).lean();
            if (!avatar) {
                return res.status(404).json({ message: 'Avatar not found' });
            }
            await Avatar.findByIdAndUpdate(value.id, { isActive: value.active });
            return res.status(200).json({ message: 'Status updated successfully' });
        }

    } catch (error) {
        console.log("err", error);
        return res.status(500).json({ message: 'Server error' });
    }
}