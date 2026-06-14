import express from 'express';
import * as authController from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.use(protect);

router.get('/me', authController.getMe);
router.patch('/updateMyPassword', authController.updateMyPassword);
router.patch('/updateMe', authController.updateMe);
router.delete('/deleteMe', authController.deleteMe);

export default router;
