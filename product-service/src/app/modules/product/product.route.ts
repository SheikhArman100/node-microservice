import express from 'express';
import validateRequest from '../../middleware/validateRequest';
import { ProductController } from './product.controller';
import { ProductValidation } from './product.validation';
// import auth from '../../../middlewares/auth';
// import { ENUM_USER_ROLE } from '../../../enums/user';

const router = express.Router();

router.post(
    '/',
    validateRequest(ProductValidation.createProductZodSchema),
    ProductController.createProduct
);

router.get(
    '/',
    // auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER), 
    ProductController.getAllProducts
);

router.get(
    '/:id',
    // auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER), 
    ProductController.getProductByID
);

router.patch(
    '/:id',
    // auth(ENUM_USER_ROLE.ADMIN), 
    // validateRequest(ProductValidation.updateProductZodSchema), 
    ProductController.updateProduct
);

router.delete(
    '/:id',
    // auth(ENUM_USER_ROLE.ADMIN), 
    ProductController.deleteProductByID
);

export const ProductRoutes = router;
