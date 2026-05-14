import express from 'express';
import { login, register, firebaseAuth, forgotPassword, verifyOtp, resetPassword, updateProfile } from '../controllers/auth.controller';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/social-login', firebaseAuth);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);
router.post('/update-profile', updateProfile);

export default router;
