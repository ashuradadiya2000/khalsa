import mongoose from "mongoose";
import { Request, Response } from "express";


import { User } from "../../models/user.model";

export interface AuthenticatedRequest extends Request {
    user?: { id: string; role: string };
}

export const Profile = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        User.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(req.user?.id)
                }
            },
            {
                $lookup: {
                    from: "Avatar",
                    let: { id: "$avatar_id" },
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
                                filename: 1
                            }
                        }
                    ],
                    as: 'profile_photo'
                }
            },
            {
                $unwind: {
                    path: '$profile_photo',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    password: 0,
                    updatedAt: 0,
                    avatar_id: 0
                }
            }
        ]).then((data) => {
            return res.status(200).json({ data: data[0] });
        })
    } catch (error) {
        console.log("err", error);
        return res.status(500).json({ message: 'Server error' });
    }
}

export const Delete = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        User.findOne({ _id: new mongoose.Types.ObjectId(req.user?.id) }).then((data) => {
            if (data) {
                User.updateOne({ _id: new mongoose.Types.ObjectId(req.user?.id) }, { $set: { deleted: true } }).then(() => {
                    return res.status(200).json({ message: "Your Account has been deleted successfully!" })
                })
            }
        })
    } catch (error) {
        console.log("err", error);
        return res.status(500).json({ message: 'Server error' });
    }
}