import fs from 'fs';
import path from 'path';
import multer from 'multer';
import express from 'express';
import { Create, Delete, List, Manage } from '../../controllers/admin/avatar.controller';
import { adminAuth } from '../../middleware/auth.middleware';

const router = express.Router();


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '..', '..', '..', 'uploads', 'avatars');
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({ storage });


router.post('/create', adminAuth, upload.single('avatar'), Create);

router.get('/list', adminAuth, List);

router.delete('/delete/:id', adminAuth, Delete);

router.patch('/manage', adminAuth, Manage);


export default router;