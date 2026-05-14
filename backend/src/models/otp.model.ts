import mongoose, { Document, Schema } from 'mongoose';

export interface IOtp extends Document {
    otp: number;
    email: string;
}

const otpSchema = new Schema<IOtp>({
		otp: {
			type: Number,
		},
		email: {
			type: String,
		},
},
    {
        versionKey: false,
        timestamps: true
    }
);

export const Otp = mongoose.model<IOtp>('Otp', otpSchema, "Otp");
