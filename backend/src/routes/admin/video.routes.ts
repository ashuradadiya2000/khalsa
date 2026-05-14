import express from 'express';
import { Create, PlaylistVideo, SearchVideos, DeletePlaylistVideo } from '../../controllers/admin/video.controller';
import { adminAuth } from '../../middleware/auth.middleware';

const router = express.Router();

router.post('/add-to-playlist/:pid', adminAuth, Create);

router.get('/playlist-videos/:pid', adminAuth, PlaylistVideo);

router.delete('/delete-videos/:vid/:id', adminAuth, DeletePlaylistVideo);
router.get('/search-video', adminAuth, SearchVideos);

export default router;