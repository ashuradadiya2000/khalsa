import fs from 'fs';
import Joi from 'joi';
import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';

import { Avatar } from '../models/avatar.model';
import { User } from '../models/user.model';
import { Otp } from '../models/otp.model';
import { generateToken } from '../utils/generateToken';

import { sendEmail } from '../utils/sendmail';
import admin from '../utils/firebase';
import mongoose from 'mongoose';

const email_message = {
    "string.email": "Please enter a valid email address",
    "any.required": "Please enter a valid email address",
}

export const register = async (req: Request, res: Response): Promise<any> => {
    try {
        const Schema = Joi.object({
            username: Joi.string().min(3).max(30).required(),
            email: Joi.string().email().required().messages(email_message),
            password: Joi.string().min(6).required(),
        }).required();
        const { error, value } = Schema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }
        else {
            const { email, username, password } = value;

            const exist = await User.findOne({ email });
            if (exist && exist.verifyed) {
                return res.status(400).json({ message: 'User already exists' });
            }

            const otp = Math.floor(100000 + Math.random() * 900000);
            await Otp.findOneAndUpdate({ email: value.email }, { otp }, { upsert: true, new: true });

            const otp_template = fs.readFileSync('src/utils/email-template/verify-otp.html', 'utf-8');

            const config = {
                toEmail: value.email,
                subject: "One Time Password(OTP) for your email verification.",
                html: otp_template.replace("{{OTP}}", String(otp)),
            }

            await sendEmail(config)

            const avatar = await Avatar.findOne({ isActive: true })

            const hashedPassword = await bcrypt.hash(password, 10);

            if (!exist) {
                await User.create({
                    email,
                    username,
                    role: 'user',
                    password: hashedPassword,
                    avatar_id: avatar?._id
                });
            }

            return res.status(201).json({ message: 'User registered successfully' });
        }
    } catch (err) {
        console.log("err", err);
        return res.status(500).json({ message: 'Server error' });
    }
};

export const login = async (req: Request, res: Response): Promise<any> => {

    try {

        const Schema = Joi.object({
            email: Joi.string().email().required().messages(email_message),
            password: Joi.string().required()
        }).required();

        const { error, value } = Schema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        } else {

            const { email, password } = value;

            const user = await User.findOne({ email, verifyed: true }).lean();
            if (!user)
                return res.status(400).json({ message: 'Invalid credentials' });
            else if (user.block)
                return res.status(400).json({ message: 'Your account has been blocked!' });
            else if (user.deleted)
                return res.status(400).json({ message: 'Your account has been deleted!' });

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch)
                return res.status(400).json({ message: 'Invalid credentials' });

            const token = generateToken(user._id as string, user.role)

            return res.json({ token, user: { id: user._id, email: user.email, role: user.role } });
        }
    } catch (err) {
        console.log("err", err);
        return res.status(500).json({ message: 'Server error' });
    }
};


export const firebaseAuth = async (req: Request, res: Response): Promise<any> => {
    try {

        const Schema = Joi.object({
            idToken: Joi.string().required(),
        }).required();

        const { error, value } = Schema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        } else {
            const decodedToken = await admin.auth().verifyIdToken(value.idToken);
            const { uid, email, name } = decodedToken;
            console.log("uid, email, name", uid, email, name);

            if (!email) {
                return res.status(400).json({ message: 'No email in token' });
            }
            let user = await User.findOne({ email });
            if (!user) {
                user = await User.create({
                    email,
                    username: name || email.split('@')[0],
                    role: 'user',
                    provider: 'firebase',
                });
            }

            const token = generateToken(user._id as string, user.role);
            return res.status(200).json({ token, user: { id: user._id, email: user.email } });
        }
    } catch (error) {
        console.log("error", error);
        return res.status(500).json({ message: 'Server error' });
    }
}


export const forgotPassword = async (req: Request, res: Response): Promise<any> => {
    try {
        const schema = Joi.object().keys({
            email: Joi.string().trim().email().required().messages(email_message),
        }).required();

        const { error, value } = schema.validate(req.body, { errors: { label: "key", wrap: { label: false } } });
        if (error && error.details) {
            return res.status(400).json({ message: error.details[0].message, success: false });
        } else {
            User.findOne({ email: value.email }).then(async (exist) => {
                if (exist) {
                    const otp = Math.floor(100000 + Math.random() * 900000);
                    await Otp.create({ otp, email: value.email })

                    const otp_template = fs.readFileSync('src/utils/email-template/verify-otp.html', 'utf-8');

                    const config = {
                        toEmail: value.email,
                        subject: "One Time Password(OTP) for your email verification.",
                        html: otp_template.replace("{{OTP}}", String(otp)),
                    }
                    await sendEmail(config)
                    return res.status(200).json({ success: true });
                } else {
                    return res.status(404).json({ success: false });
                }
            })
        }
    } catch (error) {
        console.log("error", error);
        return res.status(500).json({ message: 'Server error' });
    }
}

export const verifyOtp = async (req: Request, res: Response): Promise<any> => {
    try {
        const schema = Joi.object().keys({
            otp: Joi.string().required(),
            email: Joi.string().trim().email().required().messages(email_message),
            type: Joi.string().valid('register', "forgotpw").required(),
        });
        const { error, value } = schema.validate(req.body, { errors: { label: "key", wrap: { label: false } } });
        if (error && error.details) {
            return res.status(400).json({ message: error.details[0].message });
        } else {
            Otp.findOne({ email: value.email, otp: value.otp }).then(async (exist) => {
                if (exist) {

                    await Otp.deleteOne({ email: value.email, otp: value.otp })

                    if (value.type === "register") {
                        const user = await User.findOne({ email: value.email })
                        if (!user) return res.status(400).json({ message: 'Invalid credentials' });
                        else {
                            user.verifyed = true;
                            await user.save();
                        }
                        const token = generateToken(user._id as string, user.role)
                        return res.status(200).json({ token, success: true });
                    } else {
                        return res.status(200).json({ success: true });
                    }
                } else {
                    return res.status(400).json({ success: false, message: "invalid otp." });
                }
            }).catch((err) => {
                console.log("verify OTP find error :", err);
                return res.status(200).json({ success: false });
            });
        }
    } catch (error) {
        console.log("error", error);
        return res.status(500).json({ message: 'Server error' });
    }
}

export const resetPassword = async (req: Request, res: Response): Promise<any> => {
    try {
        const schema = Joi.object().keys({
            password: Joi.string().min(6).required(),
            email: Joi.string().trim().email().required().messages(email_message),
        }).required();
        const { error, value } = schema.validate(req.body, { errors: { label: "key", wrap: { label: false } } });
        if (error && error.details) {
            return res.status(400).json({ message: error.details[0].message });
        } else {
            const hashed = await bcrypt.hash(value.password, 10);
            await User.findOneAndUpdate({ email: value.email }, { $set: { password: hashed } })
            return res.status(200).json({ success: true });
        }
    } catch (error) {
        console.log("error", error);
        return res.status(500).json({ message: 'Server error' });
    }
}

export const updateProfile = async (req: Request, res: Response): Promise<any> => {
    try {
        const schema = Joi.object().keys({
            id: Joi.string().hex().length(24).required(),
            username: Joi.string().required(),
            avatar_id: Joi.string().hex().length(24).required(),
        }).required();
        const { error, value } = schema.validate(req.body, { errors: { label: "key", wrap: { label: false } } });
        if (error && error.details) {
            return res.status(400).json({ message: error.details[0].message });
        } else {
            await User.updateOne({ _id: value.id }, { $set: { username: value.username, avatar_id: new mongoose.Types.ObjectId(value.avatar_id) } })
            return res.status(200).json({ success: true });
        }
    } catch (error) {
        console.log("error", error);
        return res.status(500).json({ message: 'Server error' });
    }
}