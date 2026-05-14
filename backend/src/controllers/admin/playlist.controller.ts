import Joi from 'joi';
import { Request, Response } from 'express';
import mongoose from 'mongoose';

import { Playlist } from '../../models/playlist.model';
import { Videos } from '../../models/videos.model';

export interface AuthenticatedRequest extends Request {
    user?: { id: string; role: string };
}

export const Create = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        const Schema = Joi.object({
            title: Joi.string().min(5).required(),
        }).required();
        const { error, value } = Schema.validate(req.body, { errors: { label: "key", wrap: { label: false } } });
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        } else {
            const payload = {
                ...value,
                createdBy: req.user?.id
            }
            await Playlist.create(payload);
            return res.status(201).json({ message: 'Playlist created successfully!' });
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
            const { _id, ...rest } = value;
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
            const data = await Playlist.findById(value.id)
            await Videos.deleteMany({ _id: { $in: data?.videos } })
            await data?.deleteOne()
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
            Playlist.aggregate([
                {
                    $match: {
                        createdBy: new mongoose.Types.ObjectId(req.user.id)
                    }
                },
                {
                    $lookup: {
                        from: 'User',
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
                                    username: 1,
                                }
                            }
                        ],
                        as: 'user'
                    }
                },
                {
                    $unwind: {
                        path: '$user',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $project: {
                        createdAt: 1,
                        title: 1,
                        username: '$user.username',
                        total_video: { $size: '$videos' }
                    }
                }
            ]).then((list) => {
                return res.status(200).json({ list, message: 'Playlist retrive successfully!' });
            })
        }
    } catch (error) {
        console.log("err", error);
        return res.status(500).json({ message: 'Server error' });
    }
}
