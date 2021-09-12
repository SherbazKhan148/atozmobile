// const nodemailer = require("nodemailer");
import nodemailer from "nodemailer";
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "sherbazkhan1408@gmail.com", //[process.env.FROM_EMAIL].toString(),
        pass: "12don123", //[process.env.FROM_EMAIL_PASS].toString(), // naturally, replace both with your real credentials or an application-specific password
    },
});

export const sendMailToAdmin = async (orderDetails) => {
    try {
        const {
            user,
            order,
            orderItems,
            shippingAddress,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
        } = orderDetails;

        const mailOptionsAdmin = {
            from: "sherbazkhan1408@gmail.com",
            to: "sherbazkhan148@gmail.com", //, enemiesofenron@gmail.com",
            subject: "New Order",
            html: "",
        };

        mailOptionsAdmin.html = `<div>
            <div>Customer: <b>${user.name} <b></div> <br/>
            <div>Order Id: <b>${order._id}<b></div> <br/>
            <div>
            <h2>Order Items:</h2> 
            <table style="width:100%">
                <thead>
                    <tr>
                        <th style="text-align: left;">Item Name</th><th style="text-align: left;">Quantity</th><th style="text-align: left;">Price</th>
                    </tr>
                </thead>
                <tbody>
                    ${
                        orderItems &&
                        orderItems?.map(
                            (item) =>
                                `<tr>
                                    <td style="text-align: left;">${item.name}</td><td style="text-align: center;">${item.qty}</td><td style="text-align: right;">${item.price}</td>
                                </tr>`
                        )
                    }
                </tbody>
            </table>
            </div> <br/>
            <div>Items Price: <b>${itemsPrice}<b></div> <br/> 
            <div>Shipping Price: <b>${shippingPrice}<b></div> <br/>
            <div>Tax Price: <b>${taxPrice}<b></div>  <br/>
            <div>Shipping Address: <b>${shippingAddress.address} ${
            shippingAddress.city
        } ${shippingAddress.postalCode} ${
            shippingAddress.country
        }<b></div> <br/>
            <h2>Total Price: <b>${totalPrice}<b></h2> 
        </div>`;

        transporter.sendMail(mailOptionsAdmin, (error, info) => {
            if (error) {
                console.log("Error in Sending Email To Admin: " + error);
                return "Error in Sending Email To Admin: " + error;
            } else {
                console.log("Email sent to Admin: " + info.response);
                return "Email sent to Admin: " + info.response;
            }
        });
    } catch (error) {
        console.log("Catch: " + error);
        return "Catch: " + error;
    }
};

export const sendMailToCustomer = async (orderDetails) => {
    try {
        const {
            user,
            order,
            orderItems,
            shippingAddress,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
        } = orderDetails;

        const mailOptionsCustomer = {
            from: "sherbazkhan1408@gmail.com",
            to: user.email, //, enemiesofenron@gmail.com",
            subject: "Thankyou For Your Order",
            html: "",
        };

        mailOptionsCustomer.html = `<h1>Dear ${user.name}, Your Order Id is: ${
            order._id
        }</h1><br/>
        <div>
            <h2>Order Items:</h2> 
            <table style="width:100%">
                <thead>
                    <tr>
                        <th style="text-align: left;">Item Name</th><th style="text-align: left;">Quantity</th><th style="text-align: left;">Price</th>
                    </tr>
                </thead>
                <tbody>
                    ${
                        orderItems &&
                        orderItems?.map(
                            (item) =>
                                `<tr>
                                    <td style="text-align: left;">${item.name}</td><td style="text-align: center;">${item.qty}</td><td style="text-align: right;">${item.price}</td>
                                </tr>`
                        )
                    }
                </tbody>
            </table>
        <div>
        <div>Items Price: <b>${itemsPrice}<b></div> <br/> 
        <div>Shipping Price: <b>${shippingPrice}<b></div> <br/>
        <div>Tax Price: <b>${taxPrice}<b></div>  <br/>
        <div>Shipping Address: <b>${shippingAddress.address} ${
            shippingAddress.city
        } ${shippingAddress.postalCode} ${
            shippingAddress.country
        } <b></div> <br/>
        <h2>Total Price: <b>${totalPrice}<b></h2> `;

        transporter.sendMail(mailOptionsCustomer, (error, info) => {
            if (error) {
                console.log("Error in Sending Email To Customer: " + error);
            } else {
                console.log("Email sent to Customer: " + info.response);
            }
        });
    } catch (error) {
        console.log("Catch:" + error);
    }
};
