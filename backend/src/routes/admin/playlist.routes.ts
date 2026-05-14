import express from 'express';
import { Create, Edit, Delete, List } from '../../controllers/admin/playlist.controller';
import { adminAuth } from '../../middleware/auth.middleware';

const router = express.Router();

router.get('/list', adminAuth, List);
router.post('/create', adminAuth, Create);
router.patch('/edit', adminAuth, Edit);
router.delete('/delete/:id', adminAuth, Delete);


export default router;
