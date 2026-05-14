import mongoose, { Document, Schema } from 'mongoose';

export interface IAvtar extends Document {
    filename: string;
    path: string;
    isActive: boolean;
}

const avatarSchema = new Schema<IAvtar>({
    filename: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: false
    },
}, {
    versionKey: false,
    timestamps: true
});

export const Avatar = mongoose.model('Avatar', avatarSchema, "Avatar");
