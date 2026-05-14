import mongoose, { Document, Schema, Types } from 'mongoose';

export interface Thumbnail {
    url: string;
    width?: number;
    height?: number;
}

export interface IAudiolist extends Document {
    createdBy: Types.ObjectId;
    videoId: string;
    etag: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: {
        default: Thumbnail;
        medium: Thumbnail;
        high: Thumbnail;
    };
    publishedAt?: Date;
    channelTitle: string;
    isSlider: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

const ThumbnailSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true
    },
    width: Number,
    height: Number,
});

const AudioSchema = new Schema<IAudiolist>({
    createdBy: {
        type: mongoose.Schema.ObjectId,
        required: true,
    },
    videoId: {
        type: String,
        required: true,
    },
    etag: {
        type: String,
        required: true,
    },
    channelId: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    thumbnails: {
        default: ThumbnailSchema,
        medium: ThumbnailSchema,
        high: ThumbnailSchema,
    },
    publishedAt: {
        type: Date
    },
    channelTitle: {
        type: String,
        required: true,
    },
    isSlider: {
        type: Boolean,
        default: false,
    },
},
    {
        versionKey: false,
        timestamps: true
    }
);

export const Audio = mongoose.model<IAudiolist>('Audio', AudioSchema, "Audio");
