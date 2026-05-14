import Joi from 'joi';
import mongoose from 'mongoose';
import { Request, Response } from 'express';

import { Videos } from '../../models/videos.model';
import { Playlist } from '../../models/playlist.model';

export interface AuthenticatedRequest extends Request {
    user?: { id: string; role: string };
}


export const List = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        const Schema = Joi.object({
            playlist: Joi.array().items(Joi.string().length(24).hex()).default([]),
            page: Joi.number().min(1).required(),
            limit: Joi.number().min(1).required(),
        }).required();
        const { error, value } = Schema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        } else {
            const page = parseInt(value.page) || 1;
            const limit = parseInt(value.limit) || 10;
            const skip = (page - 1) * limit;

            const match: any = {};

            if (value.playlist.length) {
                const ids = [];
                const plist = await Playlist.find({ _id: { $in: value.playlist } }).lean()
                for (const element of plist) {
                    ids.push(element.videos);
                }
                match["_id"] = { $in: ids.flat(1) }
            }

            const result = await Videos.aggregate([
                {
                    $match: match
                },
                {
                    $group: {
                        _id: '$videoId',
                        id: { $first: "$_id" },
                        createdBy: { $first: "$createdBy" },
                        etag: { $first: "$etag" },
                        channelId: { $first: "$channelId" },
                        title: { $first: "$title" },
                        description: { $first: "$description" },
                        thumbnails: { $first: "$thumbnails" },
                        publishedAt: { $first: "$publishedAt" },
                        channelTitle: { $first: "$channelTitle" },
                        createdAt: { $first: "$createdAt" },
                    }
                },
                {
                    $facet: {
                        "list": [
                            { $sort: { createdAt: -1 } },
                            { $skip: skip },
                            { $limit: limit },
                        ],
                        "total": [
                            { $count: "count" }
                        ]
                    }
                }

            ])
            return res.status(200).json({
                list: result[0].list,
                total: result[0].total[0]?.count || 0,
            });

        }
    } catch (error) {
        console.log("err", error);
        return res.status(500).json({ message: 'Server error' });
    }
}


