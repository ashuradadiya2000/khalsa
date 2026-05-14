import Joi from 'joi';
import mongoose from 'mongoose';
import { Request, Response } from 'express';

import { Playlist } from '../../models/playlist.model';
import { Videos } from '../../models/videos.model';

export interface AuthenticatedRequest extends Request {
    user?: { id: string; role: string };
}

export const Create = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        const Schema = Joi.object({
            title: Joi.string().required(),
            videos: Joi.array().items(Joi.string().hex().length(24).required())
        }).required();
        const { error, value } = Schema.validate(req.body, { errors: { label: "key", wrap: { label: false } } });
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        } else {
            const data = await Playlist.create({ title: value.title, createdBy: req.user?.id, videos: value.videos })
            return res.status(201).json({ data, message: 'Playlist created successfully!' });
        }
    } catch (error) {
        console.log("err", error);
        return res.status(500).json({ message: 'Server error' });
    }
}

export const Edit = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        const Schema = Joi.object({
            _id: Joi.string().length(24).hex().required(),
            title: Joi.string().min(5).required(),
        });
        const { error, value } = Schema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        } else {
            const { _id, ...rest } = value
            await Playlist.updateOne({ _id: _id }, { $set: { ...rest } })
            return res.status(200).json({ message: 'Playlist updated successfully!' });
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
            await Playlist.findByIdAndDelete(value.id)
            await Videos.deleteMany({ playlist_id: value.id })
            return res.status(200).json({ message: 'Playlist deleted successfully!' });
        }
    } catch (error) {
        console.log("err", error);
        return res.status(500).json({ message: 'Server error' });
    }
}

export const List = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        if (req.user) {
            const list = await Playlist.aggregate([

                {
                    $lookup: {
                        from: "User",
                        let: { id: "$createdBy" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ['$_id', "$$id"]
                                    }
                                }
                            },
                            {
                                $project: {
                                    role: 1,
                                    username: 1
                                }
                            }
                        ],
                        as: 'user'
                    }
                },
                {
                    $unwind: {
                        path: "$user"
                    }
                },
                {
                    $project: {
                        title: 1,
                        user: 1
                    }
                },
            ])
            return res.status(200).json({ list, message: 'Playlist retrive successfully!' });
        } else {
            return res.status(403).json({ list: [], message: 'Playlist you can not be access!' });
        }
    } catch (error) {
        console.log("err", error);
        return res.status(500).json({ message: 'Server error' });
    }
}

