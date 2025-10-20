import express from 'express';
import { UserController } from './user.controller';

import { ENUM_PERMISSION } from '../../enum/rbac';
import authorize from '../../middleware/authorize';

const router = express.Router();

// Admin-only routes (read, update, delete permissions - no create, that's handled by auth signup)
router.get('/', authorize(ENUM_PERMISSION.READ_USER), UserController.getAllUsers);
router.get('/:id', authorize(ENUM_PERMISSION.READ_USER), UserController.getUserByID);
router.patch('/:id', authorize(ENUM_PERMISSION.UPDATE_USER), UserController.updateUser);
router.delete('/:id', authorize(ENUM_PERMISSION.DELETE_USER), UserController.deleteUserByID);

export const userRoute = router;
