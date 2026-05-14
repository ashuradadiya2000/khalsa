import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IPlaylist extends Document {
    title: string;
    createdBy: Types.ObjectId;
    videos: Types.ObjectId;
}

const playlistSchema = new Schema<IPlaylist>({
    title: {
        type: String,
        required: true,
    },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        required: true,
    },
    videos: [
        {
            type: mongoose.Schema.ObjectId
        }
    ]
},
    {
        versionKey: false,
        timestamps: true
    }
);

export const Playlist = mongoose.model<IPlaylist>('Playlist', playlistSchema, "Playlist");
