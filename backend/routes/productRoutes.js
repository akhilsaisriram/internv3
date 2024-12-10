const express = require("express");
const {
    createProduct,
    getProducts,
    getProduct,
    updateProduct,
    deleteProduct,
    filterProducts,
} = require("../controllers/productController");
const handleMulterError = require("../utils/m");

const router = express.Router();

router.post("/", handleMulterError, createProduct); // Add image upload handling
router.get("/", getProducts);
router.get("/:slug", getProduct);
router.put("/:slug", handleMulterError, updateProduct); // Update with image
router.delete("/:slug", deleteProduct);
router.post("/filter", filterProducts);

module.exports = router;
