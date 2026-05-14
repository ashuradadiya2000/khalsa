import express from 'express';
import { Profile, Delete } from '../../controllers/user/profile.controller'
import { userAuth } from '../../middleware/auth.middleware';

const router = express.Router();

router.get('/my-profile', userAuth, Profile);
router.patch('/delete-profile', userAuth, Delete);

export default router;
