import Joi from "joi";
import axios from "axios";
import { Request, Response } from "express";

import { Audio } from "../../models/audio.model";



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
            await Audio.insertMany(value)
            return res.status(201).json({ message: 'Audio saved successfully!' });
        }
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
                channelId: process.env.YT_MUSIC_ACCESS_CHaNNEL_ID,
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

export const SearchAudios = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        const videos = await searchYouTubeVideos(req.query.search as string, 5);
        return res.status(200).json({ videos });
    } catch (error) {
        console.log("err", error);
        return res.status(500).json({ message: 'Server error' });
    }
}

export const List = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        const audios = await Audio.aggregate([
            {
                $project: {
                    image: "$thumbnails.default.url",
                    channelTitle: 1,
                    createdAt: 1,
                    isSlider: 1,
                    title: 1,
                    videoId: 1
                }
            }
        ])
        return res.status(200).json({ list: audios });
    } catch (error) {
        console.log("err", error);
        return res.status(500).json({ message: 'Server error' });
    }
}

export const ShowInSlider = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        const Schema = Joi.object({
            id: Joi.string().hex().length(24).required(),
            show: Joi.bool().required(),
        }).required()

        const { error, value } = Schema.validate(req.body, { errors: { label: "key", wrap: { label: false } } });
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        } else {
            await Audio.updateOne({ _id: value.id }, { $set: { isSlider: value.show } })
            return res.status(200).json({ success: true });
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
        }).required()

        const { error, value } = Schema.validate(req.params, { errors: { label: "key", wrap: { label: false } } });
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        } else {
            await Audio.deleteOne({ _id: value.id })
            return res.status(200).json({ success: true });
        }
    } catch (error) {
        console.log("err", error);
        return res.status(500).json({ message: 'Server error' });
    }
}