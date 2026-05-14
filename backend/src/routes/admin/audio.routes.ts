import express from 'express';

import { adminAuth } from '../../middleware/auth.middleware';

import { Create, List, SearchAudios, ShowInSlider, Delete } from '../../controllers/admin/audio.controller';

const router = express.Router();

router.post('/create', adminAuth, Create);

router.get('/search-audio', adminAuth, SearchAudios);

router.get('/list', adminAuth, List);

router.post('/set-slider', adminAuth, ShowInSlider);

router.delete('/delete/:id', adminAuth, Delete);

export default router;