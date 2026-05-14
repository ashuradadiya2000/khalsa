import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import { User } from '../models/user.model';

export interface AuthenticatedRequest extends Request {
    user?: { id: string; role: string };
}

export const userAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<any> => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) return res.status(401).json({ message: 'Authorization token is missing' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; role: string };
        const user = await User.findOne({ _id: decoded.id, role: 'user' }).lean();

        if (!user) {
            return res.status(401).json({ message: "Unauthorized access!" })
        } else if (user.block) {
            return res.status(401).json({ message: "Unauthorized access!" })
        } else if (user.deleted) {
            return res.status(401).json({ message: "Unauthorized access!" })
        }
        req.user = { id: decoded.id, role: decoded.role };
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};


export const adminAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<any> => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) return res.status(401).json({ message: 'Authorization token is missing' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; role: string };
        const user = await User.findOne({ _id: decoded.id, role: 'super_admin' }).lean()

        if (!user) {
            return res.status(401).json({ message: "Unauthorized access!" })
        }
        req.user = { id: decoded.id, role: decoded.role };
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};
