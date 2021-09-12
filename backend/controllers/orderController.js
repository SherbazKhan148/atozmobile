import Order from "../models/orderModel.js";
import User from "../models/userModel.js";
import asyncHandler from "express-async-handler";
import Stripe from "stripe";
import { v4 } from "uuid";
import { token } from "morgan";
import { sendMailToAdmin, sendMailToCustomer } from "../smtp/email.js";

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

        const adminEmailResponse = await sendMailToAdmin({
            user: req.user,
            order: createdOrder,
            orderItems,
            shippingAddress,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
        });

        const customerEmailResponse = await sendMailToCustomer({
            user: req.user,
            order: createdOrder,
            orderItems,
            shippingAddress,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
        });

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
    try {
        const order = await Order.findById(req.params.id);
        const { user } = req;
        const {
            id,
            update_time,
            email,
            status,
            payer,
            paymentMethod,
            card,
            products,
        } = req.body;

        if (order) {
            if (paymentMethod === "Paypal") {
                order.isPaid = true;
                order.paidAt = Date.now();
                order.paymentResult = {
                    paypalId: id,
                    paypalStatus: status,
                    paypalUpdateTime: update_time,
                    paypalEmail: payer.email_address,
                };

                const updatedOrder = await order.save();

                console.log("Update Order To Paid After Response From Paypal");

                res.status(200).json(updatedOrder);
            } else if (paymentMethod === "Stripe") {
                const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
                order.isPaid = true;
                order.paidAt = Date.now();

                // Before Charging, Checking if User have Stripe Customer Id then get Customer
                let customer = "";
                let newCard = "";
                if (user.stripeCustomerId) {
                    customer = await stripe.customers.retrieve(
                        user.stripeCustomerId
                    );
                    console.log("Customer Retrieved: " + customer.id);

                    // Get Cards If Card Already Exists
                    const getCards = await stripe.customers.listSources(
                        user.stripeCustomerId,
                        { object: "card", limit: 10 }
                    );

                    if (getCards) {
                        let cardAlreadyExists = getCards.data.find(
                            (c) =>
                                c.last4 === card.last4 &&
                                c.exp_month === card.exp_month &&
                                c.exp_year === card.exp_year
                        );

                        if (cardAlreadyExists) {
                            // Update Customer's Default Card so this transaction will be charged with this card
                            const customerUpdate =
                                await stripe.customers.update(
                                    user.stripeCustomerId,
                                    { default_source: cardAlreadyExists.id }
                                );

                            console.log(
                                "Card Already Exists => Customer's Default Card Updated"
                            );
                        } else {
                            newCard = await stripe.customers.createSource(
                                user.stripeCustomerId,
                                { source: id } // id = tok_1IUQuQC0tZjWnFuaGhUlZSVw
                            );

                            // Update Customer's Default Card so this transaction will be charged with this card
                            const customerUpdate =
                                await stripe.customers.update(
                                    user.stripeCustomerId,
                                    { default_source: newCard.id }
                                );
                            console.log(
                                "Card Not Found After Checking Every Card: New Card Created => Customer's Default Card Updated"
                            );
                        }
                    } else {
                        newCard = await stripe.customers.createSource(
                            user.stripeCustomerId,
                            { source: id } // id = tok_1IUQuQC0tZjWnFuaGhUlZSVw
                        );
                        if (newCard)
                            console.log(
                                "User Had No Cards In Stripe: New Card Created: " +
                                    newCard.id
                            );
                    }
                } else {
                    // Create Customer Stripe
                    customer = await stripe.customers.create({
                        name: user.name,
                        email,
                        source: id, //id = tok_1IUQuQC0tZjWnFuaGhUlZSVw
                    });
                    console.log(
                        "New Customer Created: Card Will be Created Automatically " +
                            customer.id
                    );

                    const userToUpdate = await User.findById(req.user.id);

                    if (userToUpdate) {
                        userToUpdate.stripeCustomerId = customer.id;

                        await userToUpdate.save();
                    } else {
                        console.log(
                            "No User Found To Update Stripe Customer Id"
                        );
                        res.status(404);
                        throw new Error(
                            "No User Found To Update Stripe Customer Id"
                        );
                    }
                }

                const charge = await stripe.charges.create({
                    amount: order.totalPrice * 100,
                    currency: "usd",
                    description: products,
                    customer: customer.id,
                    receipt_email: email,
                    // payment_method: card.id,
                });

                order.paymentResult = {
                    stripeTokenId: id,
                    stripeCardId: card.id,
                    stripeChargeId: charge.id,
                    status: "Stripe Success",
                    stripeEmail: email,
                };

                const updatedOrder = await order.save();
                console.log("Update Order To Paid After Response From Stripe");

                res.status(200).json(updatedOrder);

                const idempotency_Key =
                    customer.id + " " + Math.random().toString();
            } else {
                console.log("No Payment Gateway Found");
                res.status(404);
                throw new Error("No Payment Gateway Found");
            }
        } else {
            res.status(404);
            console.log("Order Not Found");
            throw new Error("Order Not Found");
        }
    } catch (error) {
        console.log("Error in Charging: " + JSON.stringify(error));
        res.status(500);
        throw new Error("Error in Charging");
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
