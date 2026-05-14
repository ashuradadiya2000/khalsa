// src/app.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


import authRoutes from './routes/auth.routes';

import adminVideoRoutes from './routes/admin/video.routes';
import adminPlaylistRoutes from './routes/admin/playlist.routes';
import adminAudioRoutes from './routes/admin/audio.routes';
import adminAvatarRoutes from './routes/admin/avatar.routes';
import adminUserRoutes from './routes/admin/user.routes';
import adminGamesRoutes from './routes/admin/game.routes';

import userPlaylistRoutes from './routes/user/playlist.routes';
import userVideosRoutes from './routes/user/videos.routes';
import userAudiosRoutes from './routes/user/audios.routes';
import userAvatarRoutes from './routes/user/avatar.routes';
import gamesAvatarRoutes from './routes/user/games.routes';
import gamesProfileRoutes from './routes/user/profile.routes';


app.use('/media', express.static(path.join(__dirname, '../uploads')));


// AUTH
app.use('/api/auth', authRoutes);

// ADMIN
app.use('/api/admin/playlist/', adminPlaylistRoutes);
app.use('/api/admin/video/', adminVideoRoutes);
app.use('/api/admin/audio/', adminAudioRoutes);
app.use('/api/admin/avatar/', adminAvatarRoutes);
app.use('/api/admin/user/', adminUserRoutes);
app.use('/api/admin/games/', adminGamesRoutes);

// USER
app.use('/api/user/playlist/', userPlaylistRoutes);
app.use('/api/user/videos/', userVideosRoutes);
app.use('/api/user/audios/', userAudiosRoutes);
app.use('/api/user/avatar/', userAvatarRoutes);
app.use('/api/user/games/', gamesAvatarRoutes);
app.use('/api/user/profile/', gamesProfileRoutes);





const publicPath = path.resolve(__dirname, '../public');
console.log('Resolved public path:', publicPath);
app.use(express.static(publicPath));

app.get('/', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

export default app;
