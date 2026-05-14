import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IGames extends Document {
    name: string;
    image: String;
    price: Number;
    reward: Number,
    paid: Boolean,
    lavel: Number,
}

const gamesSchema = new Schema<IGames>({
    name: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    reward: {
        type: Number,
        required: true,
    },
    paid: {
        type: Boolean,
        required: true,
    },
    lavel: {
        type: Number,
        required: true,
    },

},
    {
        versionKey: false,
        timestamps: true
    }
);

export const Games = mongoose.model<IGames>('Games', gamesSchema, "Games");
