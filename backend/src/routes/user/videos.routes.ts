import express from 'express';
import { List } from '../../controllers/user/videos.controller'
import { userAuth } from '../../middleware/auth.middleware';

const router = express.Router();

router.post('/list', userAuth, List);

export default router;
