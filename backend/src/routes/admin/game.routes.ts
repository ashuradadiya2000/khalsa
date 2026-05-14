import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

import { Create, Edit, Delete, List } from '../../controllers/admin/game.controller';
import { adminAuth } from '../../middleware/auth.middleware';

const router = express.Router();


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '..', '..', '..', 'uploads', 'games_thumbs');
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now();
        const processedName = file.originalname.toLowerCase().replace(/\s+/g, '-');
        cb(null, uniqueSuffix + '-' + processedName);
    }

});

const upload = multer({ storage });


router.post('/create', adminAuth, upload.single('image'), Create);
router.patch('/edit', adminAuth, upload.single('image'), Edit);
router.delete('/delete/:id', adminAuth, Delete);
router.get('/list', adminAuth, List);


export default router;
