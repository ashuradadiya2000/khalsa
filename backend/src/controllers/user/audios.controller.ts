import Joi from 'joi';
import { Request, Response } from 'express';
import { Audio } from '../../models/audio.model';


export interface AuthenticatedRequest extends Request {
    user?: { id: string; role: string };
}


export const List = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        const Schema = Joi.object({
            isSlider: Joi.boolean(),
            page: Joi.number().min(1).required(),
            limit: Joi.number().min(1).required(),
        }).required();
        const { error, value } = Schema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        } else {
            const match: any = {};
            if (value.isSlider !== undefined) match.isSlider = value.isSlider;

            const page = value.page;
            const limit = value.limit;
            const skip = (page - 1) * limit;

            const list = await Audio.aggregate([
                {
                    $match: match
                },
                {
                    $facet: {
                        list: [
                            { $skip: skip },
                            { $limit: limit },
                        ],
                        total: [
                            { $count: "count" }
                        ]
                    }
                }
            ])
            return res.status(200).json({ list: list[0].list, total: list[0].total[0].count });
        }
    } catch (error) {
        console.log("err", error);
        return res.status(500).json({ message: 'Server error' });
    }
}


