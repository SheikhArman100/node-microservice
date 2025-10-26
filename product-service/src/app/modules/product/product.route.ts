import express from 'express';
import validateRequest from '../../middleware/validateRequest';
import { ProductController } from './product.controller';
import { ProductValidation } from './product.validation';
import authorize from '../../middleware/authorize';

const router = express.Router();

router.post(
    '/',
    authorize("create_product"),
    validateRequest(ProductValidation.createProductZodSchema),
    ProductController.createProduct
);

router.get(
    '/',
    authorize("read_product"),
    ProductController.getAllProducts
);

router.get(
    '/:id',
    authorize("read_product"),
    ProductController.getProductByID
);

router.patch(
    '/:id',
    authorize("update_product"),
    validateRequest(ProductValidation.updateProductZodSchema), 
    ProductController.updateProduct
);

router.delete(
    '/:id',
    authorize("delete_product"),
    ProductController.deleteProductByID
);

export const ProductRoutes = router;
