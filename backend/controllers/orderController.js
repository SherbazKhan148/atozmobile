import Order from "../models/orderModel.js";
import asyncHandler from "express-async-handler";

// @desc 	Create New Order
// @route 	POST /api/orders
// @access	PRIVATE
const addOrderItems = asyncHandler(async (req, res) => {
    const {
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
    } = req.body;

    if (orderItems && orderItems.length === 0) {
        res.status(400);
        throw new Error("No Order Items Found");
        return;
    } else {
        const order = new Order({
            orderItems,
            user: req.user._id,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            shippingPrice,
            taxPrice,
            totalPrice,
        });

        const createdOrder = await order.save();

        console.log("Create New Order");

        res.status(201).json(createdOrder);
    }
});

// @desc 	Get Order By Id
// @route 	GET /api/orders/:id
// @access	PRIVATE
const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate(
        "user",
        "id name email"
    );

    if (order) {
        console.log("Get Order By id");
        res.status(200).json(order);
    } else {
        res.status(404);
        throw new Error("Order Not Found");
    }
});

// @desc 	Update Order to Paid
// @route 	GET /api/orders/:id/pay
// @access	PRIVATE
const updateOrderToPaid = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
            id: req.body.id,
            status: req.body.status,
            update_time: req.body.update_time,
            email_address: req.body.payer.email_address,
        };

        const updatedOrder = await order.save();

        console.log("Update Order To Paid After Response From Paypal");

        res.status(200).json(updatedOrder);
    } else {
        res.status(404);
        throw new Error("Order Not Found");
    }
});

// @desc 	Update Order to Delivered
// @route 	GET /api/orders/:id/deliver
// @access	PRIVATE/ADMIN
const updateOrderToDelivered = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        order.isDelivered = true;
        order.deliveredAt = Date.now();

        const updatedOrder = await order.save();

        console.log("Update Order To Delivered By Admin");

        res.status(200).json(updatedOrder);
    } else {
        res.status(404);
        throw new Error("Order Not Found");
    }
});

// @desc 	Get LoggedIn User Orders
// @route 	GET /api/orders/myorders
// @access	PRIVATE
const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id });

    console.log("Get Orders By User Id");
    res.status(200).json(orders);
});

// @desc 	Get All Orders
// @route 	GET /api/orders
// @access	PRIVATE/ADMIN
const getOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({}).populate("user", "id name");

    console.log("Get All Order ADMIN");
    res.status(200).json(orders);
});

export {
    addOrderItems,
    getOrderById,
    updateOrderToPaid,
    getMyOrders,
    getOrders,
    updateOrderToDelivered,
};
