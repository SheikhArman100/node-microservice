import express from 'express';
import { UserController } from './user.controller';
import { UserValidation } from './user.validation';
import validateRequest from '../../middleware/validateRequest';

import { ENUM_PERMISSION } from '../../enum/rbac';
import authorize from '../../middleware/authorize';
import { FileUploadHelper } from '../../helpers/fileUploadHelpers';
import formDataToJson from '../../middleware/formDataToJson';

const router = express.Router();

// Admin-only routes (read, update, delete permissions - no create, that's handled by auth signup)
router.get('/', authorize(ENUM_PERMISSION.READ_USER), UserController.getAllUsers);
router.get('/:id', authorize(ENUM_PERMISSION.READ_USER), UserController.getUserByID);
router.patch('/:id', authorize(ENUM_PERMISSION.UPDATE_USER), FileUploadHelper.uploadSingle('users'), formDataToJson, validateRequest(UserValidation.UpdateUserSchema), UserController.updateUser);
router.delete('/:id', authorize(ENUM_PERMISSION.DELETE_USER), UserController.deleteUserByID);

export const userRoute = router;
