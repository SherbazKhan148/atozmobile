import express from "express";
const router = express.Router();
import {
    getProducts,
    getProductById,
    deleteProduct,
    updateProduct,
    createProduct,
    createProductReview,
    getTopRatedProducts,
} from "../controllers/productController.js";
import { isAdmin, protect } from "../middleware/authMiddleware.js";

router.route("/").get(getProducts).post(protect, isAdmin, createProduct);
router.get("/top", getTopRatedProducts);
router
    .route("/:id/reviews")
    .get(getProducts)
    .post(protect, createProductReview);

router
    .route("/:id")
    .get(getProductById)
    .delete(protect, isAdmin, deleteProduct)
    .put(protect, isAdmin, updateProduct);

export default router;
