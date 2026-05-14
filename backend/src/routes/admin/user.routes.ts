import express from 'express';
import { List, Block, Delete } from '../../controllers/admin/user.controller';
import { adminAuth } from '../../middleware/auth.middleware';

const router = express.Router();

router.get('/list', adminAuth, List);
router.post('/block', adminAuth, Block);
router.post('/delete', adminAuth, Delete);


export default router;
