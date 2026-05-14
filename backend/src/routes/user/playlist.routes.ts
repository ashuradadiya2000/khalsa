import express from 'express';
import { Create, Edit, Delete, List } from '../../controllers/user/playlist.controller'
import { userAuth } from '../../middleware/auth.middleware';

const router = express.Router();

router.post('/create', userAuth, Create);
router.patch('/edit', userAuth, Edit);
router.delete('/delete/:id', userAuth, Delete);
router.get('/list', userAuth, List);

export default router;
