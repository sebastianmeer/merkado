import express from 'express';
import * as productController from '../controllers/productController';
import { protect, restrictTo } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect);

router
  .route('/top-3-cheapest')
  .get(productController.aliasTopCheapProducts, productController.getAllProducts);

router.route('/product-category').get(productController.getProductCategoryStats);

router
  .route('/')
  .get(productController.getAllProducts)
  .post(restrictTo('admin'), productController.createProduct);

router
  .route('/:id')
  .get(productController.getProduct)
  .patch(restrictTo('admin'), productController.updateProduct)
  .delete(restrictTo('admin'), productController.deleteProduct);

export default router;
