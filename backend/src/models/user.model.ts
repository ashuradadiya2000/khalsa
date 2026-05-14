import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    role: string;
    provider: string;
    verifyed: Boolean;
    block: Boolean;
    deleted: Boolean;
    avatar_id: Types.ObjectId
    reward_points: number
    lavel: number
}

const userSchema = new Schema<IUser>({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
    },
    role: {
        type: String,
    },
    provider: {
        type: String,
    },
    verifyed: {
        type: Boolean,
        default: false
    },
    block: {
        type: Boolean,
    },
    deleted: {
        type: Boolean,
    },
    avatar_id: {
        type: mongoose.Schema.ObjectId,
    },
    reward_points: {
        type: Number,
        default: 0
    },
    lavel: {
        type: Number,
        default: 0
    }
},
    {
        versionKey: false,
        timestamps: true
    }
);

export const User = mongoose.model<IUser>('User', userSchema, "User");
