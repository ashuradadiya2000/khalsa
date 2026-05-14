import fs from 'fs';
import Joi from 'joi';
import path from 'path';
import mongoose from 'mongoose';
import { Request, Response } from 'express';

import { Games } from '../../models/game.model';

export interface AuthenticatedRequest extends Request {
    user?: { id: string; role: string }
}

export const Create = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        const Schema = Joi.object({
            name: Joi.string().required(),
            price: Joi.number().min(1).required(),
            reward: Joi.number().required(),
            paid: Joi.bool().required(),
            lavel: Joi.number().required(),
        }).required();

        const { error, value } = Schema.validate(req.body, { errors: { label: "key", wrap: { label: false } } });

        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        } else {
            const payload = {
                ...value
            }
            if (req.file && req.file.filename) {
                payload['image'] = req.file.filename
            }

            await Games.create(payload);
            return res.status(201).json({ message: 'Game created successfully!' });
        }
    } catch (error) {
        console.log("err", error);
        return res.status(500).json({ message: 'Server error' });
    }
}

export const Edit = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        const Schema = Joi.object({
            _id: Joi.string().hex().length(24).required(),
            name: Joi.string().required(),
            price: Joi.number().min(1).required(),
            reward: Joi.number().required(),
            paid: Joi.bool().required(),
            lavel: Joi.number().required(),
        });
        const { error, value } = Schema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        } else {
            const { _id, ...rest } = value;

            Games.findOne({ _id: _id }).then(async (data) => {
                if (data) {
                    const payload = {
                        ...rest
                    }

                    if (req.file && req.file.filename) {

                        payload['image'] = req.file.filename;

                        const filePath = path.join(__dirname, '..', '..', '..', 'uploads', 'games_thumbs', data.image as string);
                        if (fs.existsSync(filePath)) {
                            fs.unlinkSync(filePath);
                        }
                    }

                    await Games.updateOne({ _id: _id }, { $set: payload })
                    return res.status(200).json({ message: 'Game updated successfully!' });
                } else {
                    return res.status(404).json({ message: 'Game not found' });
                }
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
            id: Joi.string().length(24).hex().required(),
        });
        const { error, value } = Schema.validate(req.params);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        } else {
            Games.findOne({ _id: new mongoose.Types.ObjectId(value.id) }).then(async (game) => {
                if (game) {
                    const filePath = path.join(__dirname, '..', '..', '..', 'uploads', 'games_thumbs', game.image as string);
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                    await Games.deleteOne({ _id: new mongoose.Types.ObjectId(value.id) })
                    return res.status(200).json({ message: 'Game deleted successfully!' });
                } else {
                    return res.status(404).json({ message: 'Game not found' });
                }
            })
        }
    } catch (error) {
        console.log("err", error);
        return res.status(500).json({ message: 'Server error' });
    }
}

export const List = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        if (req.user) {
            Games.find({}).then((list) => {
                return res.status(200).json({ list, message: 'Games retrive successfully!' });
            })
        }
    } catch (error) {
        console.log("err", error);
        return res.status(500).json({ message: 'Server error' });
    }
}
