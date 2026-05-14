import express from 'express';

import { List } from '../../controllers/user/avatar.controller';

import { userAuth } from '../../middleware/auth.middleware';


const router = express.Router();

router.get('/list', userAuth, List);

export default router;