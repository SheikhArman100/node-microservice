import express from 'express';
import { UserController } from './user.controller';

import { ENUM_PERMISSION } from '../../enum/rbac';
import authenticate from '../../middleware/authenticate';
import authorize from '../../middleware/authorize';

const router = express.Router();

// Admin-only routes (read, update, delete permissions - no create, that's handled by auth signup)
router.get('/', authenticate, authorize(ENUM_PERMISSION.READ_USER), UserController.getAllUsers);
router.get('/:id', authenticate, authorize(ENUM_PERMISSION.READ_USER), UserController.getUserByID);
router.patch('/:id', authenticate, authorize(ENUM_PERMISSION.UPDATE_USER), UserController.updateUser);
router.delete('/:id', authenticate, authorize(ENUM_PERMISSION.DELETE_USER), UserController.deleteUserByID);

export const userRoute = router;
