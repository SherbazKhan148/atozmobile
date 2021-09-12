import Product from "../models/productModel.js";
import asyncHandler from "express-async-handler";

// @desc 	FETCH ALL PRODUCTS
// @route 	GET /api/products
// @access	PUBLIC
const getProducts = asyncHandler(async (req, res) => {
    const pageSize = 10;
    const page = Number(req.query.pageNumber) || 1;

    const keyword = req.query.keyword
        ? {
              name: {
                  $regex: req.query.keyword,
                  $options: "i",
              },
          }
        : {};

    const count = await Product.countDocuments({ ...keyword });

    const products = await Product.find({ ...keyword })
        .limit(pageSize)
        .skip(pageSize * (page - 1));

    console.log("Get All Products");
    res.json({ products, page, pages: Math.ceil(count / pageSize) });
});

// @desc 	FETCH SINGLE PRODUCT
// @route 	GET /api/products/:id
// @access	PUBLIC
const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
        console.log("Get Single Product");
        res.json(product);
    } else {
        res.status(404);
        throw new Error("No Product Found For This Id");
    }
});

// @desc 	DELETE A PRODUCT
// @route 	DELETE /api/products/:id
// @access	PRIVATE/ADMIN
const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
        console.log("Delete Product By Admin Using Id");
        product.remove();
        res.json({ message: "Product Removed" });
    } else {
        res.status(404);
        throw new Error("No Product Found For This Id");
    }
});

// @desc 	CREATE A PRODUCT
// @route 	POST /api/products
// @access	PRIVATE/ADMIN
const createProduct = asyncHandler(async (req, res) => {
    const product = new Product({
        name: "Sample Name",
        pirce: 0.0,
        user: req.user._id,
        image: "/images/sample.jpg",
        s3Image: "/images/sample.jpg",
        brand: "Sample Brand",
        category: "Sample Category",
        countInStock: 0,
        numReviews: 0,
        description: "Sample Description",
    });

    const createdProduct = await product.save();
    console.log("Product Inserted By Admin");
    res.status(201).json(createdProduct);
});

// @desc 	UDPATE A PRODUCT
// @route 	PUT /api/products/:id
// @access	PRIVATE/ADMIN
const updateProduct = asyncHandler(async (req, res) => {
    const {
        name,
        price,
        description,
        image,
        s3Image,
        brand,
        category,
        countInStock,
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
        product.name = name;
        product.price = price;
        product.description = description;
        product.image = image;
        product.s3Image = s3Image;
        product.brand = brand;
        product.category = category;
        product.countInStock = countInStock;

        const updatedProduct = await product.save();
        console.log("Product Updated By Admin");

        res.status(200).json(updatedProduct);
    } else {
        res.status(404);
        throw new Error("Product Not Found");
    }
});

// @desc 	CREATE NEW REVIEW
// @route 	POST /api/products/:id/reviews
// @access	PRIVATE
const createProductReview = asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
        const alreadyReviewed = product.reviews.find(
            (r) => r.user.toString() === req.user._id.toString()
        );

        if (alreadyReviewed) {
            res.status(400);
            throw new Error("Product Already Reviewed");
        }

        const review = {
            name: req.user.name,
            rating: Number(rating),
            comment,
            user: req.user._id,
        };

        product.reviews.push(review);

        product.numReviews = product.reviews.length;

        product.rating =
            product.reviews.reduce((acc, item) => item.rating + acc, 0) /
            product.reviews.length;

        await product.save();

        console.log("Product Reviewed Successfully");
        res.status(201).json({ message: "Product Reviewed Successfully" });
    } else {
        res.status(404);
        throw new Error("Product Not Found");
    }
});

// @desc 	GET TOP RATED PRODUCTS
// @route 	GET /api/products/top
// @access	PUBLIC
const getTopRatedProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({}).sort({ rating: -1 }).limit(3);

    res.json(products);
});

export {
    getProducts,
    getProductById,
    deleteProduct,
    createProduct,
    updateProduct,
    createProductReview,
    getTopRatedProducts,
};
