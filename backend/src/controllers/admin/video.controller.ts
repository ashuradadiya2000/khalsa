import Joi from 'joi';
import axios from "axios";
import mongoose from 'mongoose';
import { Request, Response } from 'express';

import { Videos } from '../../models/videos.model';
import { Playlist } from '../../models/playlist.model';

export interface AuthenticatedRequest extends Request {
    user?: { id: string; role: string };
}

const thumbSchema = Joi.object({
    url: Joi.string().uri().required(),
    width: Joi.number().optional(),
    height: Joi.number().optional(),
});


export const Create = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {

        const videos = Joi.object({
            createdBy: Joi.string().hex().length(24).required(), // MongoDB ObjectId
            videoId: Joi.string().required(),
            etag: Joi.string().required(),
            channelId: Joi.string().required(),
            title: Joi.string().required(),
            description: Joi.string().required(),
            thumbnails: Joi.object({
                default: thumbSchema.required(),
                medium: thumbSchema.required(),
                high: thumbSchema.required(),
            }).required(),
            channelTitle: Joi.string().required(),
            publishedAt: Joi.date().optional(),
        })
        const Schema = Joi.array().items(videos).min(1).required();

        const { error, value } = Schema.validate(req.body, { errors: { label: "key", wrap: { label: false } } });
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        } else {
            const data = await Videos.insertMany(value)
            const ids = data.map((ele) => ele._id)

            Playlist.updateOne(
                { _id: new mongoose.Types.ObjectId(req.params.pid) },
                { $push: { videos: { $each: ids } } }
            ).then((udata) => {
                return res.status(201).json({ udata, message: 'Videos saved in playlist successfully!' });
            })
        }
    } catch (error) {
        console.log("err", error);
        return res.status(500).json({ message: 'Server error' });
    }
}

export const PlaylistVideo = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        Playlist.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(req.params.pid)
                }
            },
            {
                $project: {
                    title: 1,
                    videos: 1
                }
            },
            {
                $lookup: {
                    from: 'Videos',
                    let: { ids: "$videos" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $in: ['$_id', "$$ids"]
                                }
                            }
                        },
                        {
                            $project: {
                                channelId: 0,
                                channelTitle: 0,
                                createdBy: 0,
                                publishedAt: 0,
                                updatedAt: 0,
                            }
                        }
                    ],
                    as: 'videos'
                }
            }
        ]).then((list) => {
            return res.status(200).json({ list, message: 'Playlist videos retrive successfully!' });
        })
    } catch (error) {
        console.log("err", error);
        return res.status(500).json({ message: 'Server error' });
    }
}

const YOUTUBE_API_BASE = "https://youtube.googleapis.com/youtube/v3";

async function searchYouTubeVideos(query: string, maxResults: number) {
    try {
        const response = await axios.get(`${YOUTUBE_API_BASE}/search`, {
            params: {
                key: process.env.YT_ACCESS_KEY,
                channelId: process.env.YT_ACCESS_CHaNNEL_ID,
                part: "snippet",
                type: "video",
                maxResults,
                q: query,
            },
        });

        return response.data.items;
    } catch (error: unknown) {
        console.error("YouTube API Error:", error);
    }
}

export const SearchVideos = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        const videos = await searchYouTubeVideos(req.query.search as string, 5);
        return res.status(200).json({ videos });
    } catch (error) {
        console.log("err", error);
        return res.status(500).json({ message: 'Server error' });
    }
}

export const DeletePlaylistVideo = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        await Videos.findByIdAndDelete(req.params.vid)
        await Playlist.updateOne(
            { _id: new mongoose.Types.ObjectId(req.params.id) },
            { $pull: { videos: new mongoose.Types.ObjectId(req.params.vid) } }
        )
        return res.status(200).json({ message: 'Videos deleted from playlist!' });
    } catch (error) {
        console.log("err", error);
        return res.status(500).json({ message: 'Server error' });
    }
}