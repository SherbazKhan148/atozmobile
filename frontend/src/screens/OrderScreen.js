import React, { useState, useEffect } from "react";
import { Row, Col, ListGroup, Image, Card, Button } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import Message from "../components/Message";
import Loader from "../components/Loader";
import { Link } from "react-router-dom";
import {
    getOrderDetails,
    payOrder,
    deliverOrder,
    payOrderStripe,
} from "../actions/orderActions";
import axios from "axios";
import { PayPalButton } from "react-paypal-button-v2";
import StripeCheckout from "react-stripe-checkout";
import {
    ORDER_PAY_RESET,
    ORDER_DELIVER_RESET,
} from "../constants/orderConstants";
import { LightSpeed, Roll } from "react-reveal";

const OrderScreen = ({ location, history, match }) => {
    const orderId = match.params.id;

    const dispatch = useDispatch();

    const [sdkReady, setSdkReady] = useState(false);

    const orderDetails = useSelector((state) => state.orderDetails);
    const { order, loading, error } = orderDetails;

    const orderPay = useSelector((state) => state.orderPay);
    const { loading: loadingPay, success: successPay } = orderPay;

    const orderDeliver = useSelector((state) => state.orderDeliver);
    const { loading: loadingDeliver, success: successDeliver } = orderDeliver;

    //For Redirecting to Home Page
    const userLogin = useSelector((state) => state.userLogin);
    const { userInfo } = userLogin; //loading: loadingUser

    const [stripePublishKey, setStripePublishKey] = useState(null);

    const getStripePublishKey = async () => {
        try {
            const { data } = await axios.get("/api/config/stripe");

            if (data) {
                if (!stripePublishKey) {
                    setStripePublishKey(data.stripePublishableKey);
                }
            } else {
                alert("Problem in getting Stripe Publish Key");
            }
        } catch (err) {
            alert(
                "Error in getting Stripe Publish Key \n" +
                    err.response.data.message
            );
        }
    };

    useEffect(() => {
        if (!userInfo) {
            history.push("/login");
        } else {
            if (!stripePublishKey) {
                getStripePublishKey();
            }

            const addPaypalScript = async () => {
                const {
                    data: { clientId },
                } = await axios.get("/api/config/paypal");

                const script = document.createElement("script");
                script.type = "text/javascript";
                script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}`;
                script.async = true;
                script.onload = () => {
                    setSdkReady(true);
                };
                let check = true;
                document.querySelectorAll("script").forEach((scr) => {
                    if (scr.hasAttribute("type")) {
                        console.log("Found Paypal Script");
                        check = false;
                    }
                });
                if (check) {
                    document.body.appendChild(script);
                }
            };

            //dispatch(getOrderDetails(orderId));

            if (
                !order ||
                (order && order._id !== orderId) ||
                successPay ||
                successDeliver
            ) {
                dispatch({ type: ORDER_PAY_RESET });
                dispatch({ type: ORDER_DELIVER_RESET });
                dispatch(getOrderDetails(orderId));

                //Clear LocalStorage After Successful Payment
                if (successPay) {
                    localStorage.removeItem("paymentMethod");
                    localStorage.removeItem("cartItems");
                    localStorage.removeItem("shippingAddress");
                }
            } else if (!order.isPaid) {
                if (!window.paypal) {
                    if (!sdkReady) {
                        addPaypalScript();
                    }
                } else {
                    setSdkReady(true);
                }
            }
        }
        // eslint-disable-next-line
    }, [
        dispatch,
        history,
        orderId,
        successPay,
        order,
        userInfo,
        sdkReady,
        successDeliver,
        stripePublishKey,
    ]);

    const deliverHandler = () => {
        dispatch(deliverOrder(order));
    };

    // Paypal
    const handlePaymentSucces = (paymentResult) => {
        console.log(JSON.stringify(paymentResult));

        const finalPaymentResult = {
            ...paymentResult,
            paymentMethod: "Paypal",
        };
        dispatch(payOrder(orderId, finalPaymentResult));
    };

    const handleStripeToken = (token, addresses) => {
        const finalPaymentResult = {
            ...token,
            ...addresses,
            paymentMethod: "Stripe",
            products: getProductNames(),
        };

        dispatch(payOrderStripe(orderId, finalPaymentResult));
    };

    const getProductNames = () => {
        let finalName = "";
        if (order && order.orderItems && order.orderItems.length > 0) {
            order.orderItems.forEach((item) => {
                if (finalName === "") finalName = `${item.qty} ${item.name}`;
                else finalName += `, ${item.qty} ${item.name}`;
            });
        }
        return finalName;
    };

    return loading ? (
        <Loader />
    ) : error ? (
        <Message variant="danger">{error}</Message>
    ) : (
        <>
            <h2>Order {order._id}</h2>
            <Row>
                <Col md={8}>
                    <Roll left cascade>
                        <ListGroup variant="flush">
                            <ListGroup.Item>
                                <h2>Shipping</h2>
                                <p>
                                    <strong>Name: </strong> {order.user.name}
                                </p>
                                <p>
                                    <strong>Email: </strong>
                                    <a href={`mailto:${order.user.email}`}>
                                        {order.user.email}
                                    </a>
                                </p>
                                <p>
                                    <strong>Address: </strong>
                                    {order.shippingAddress.address},{" "}
                                    {order.shippingAddress.city}{" "}
                                    {order.shippingAddress.postalCode},{" "}
                                    {order.shippingAddress.country}
                                </p>
                                {order.isDelivered ? (
                                    <Message variant="success">
                                        Delivered On: {order.deliveredAt}
                                    </Message>
                                ) : (
                                    <Message variant="danger">
                                        Not Delivered
                                    </Message>
                                )}
                            </ListGroup.Item>

                            {order?.paymentMethod === "Cash" && (
                                <ListGroup.Item>
                                    <h2>Payment Method</h2>
                                    <p>
                                        <strong>Method: </strong>
                                        {order?.paymentMethod === "Stripe"
                                            ? "Card"
                                            : order?.paymentMethod}
                                    </p>

                                    {order?.paymentMethod !== "Cash" &&
                                        (order.isPaid ? (
                                            <Message variant="success">
                                                Paid On: {order.paidAt}
                                            </Message>
                                        ) : (
                                            <Message variant="danger">
                                                Not Paid
                                            </Message>
                                        ))}
                                </ListGroup.Item>
                            )}

                            <ListGroup.Item>
                                <h2>Order Items</h2>
                                {order &&
                                order.orderItems &&
                                order.orderItems.length === 0 ? (
                                    <Message>Order Is Empty</Message>
                                ) : (
                                    <ListGroup variant="flush">
                                        {order.orderItems.map((item, index) => (
                                            <ListGroup.Item key={index}>
                                                <Row>
                                                    <Col md={1}>
                                                        {/* src={item.image} */}
                                                        <Image
                                                            style={{
                                                                maxHeight:
                                                                    "40px",
                                                                maxWidth:
                                                                    "40px",
                                                            }}
                                                            src={item.s3Image}
                                                            alt={item.name}
                                                            fluid
                                                            rounded
                                                        />
                                                    </Col>
                                                    <Col>
                                                        <Link
                                                            to={`/product/${item.product}`}
                                                        >
                                                            {item.name}
                                                        </Link>
                                                    </Col>
                                                    <Col md={4}>
                                                        <span>
                                                            {item.qty} x{" "}
                                                            {item.price} = Rs{" "}
                                                            {item.qty *
                                                                item.price}
                                                        </span>
                                                    </Col>
                                                </Row>
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                )}
                            </ListGroup.Item>
                        </ListGroup>
                    </Roll>
                </Col>
                <Col md={4}>
                    <Card>
                        <LightSpeed right cascade>
                            <ListGroup variant="flush">
                                <ListGroup.Item>
                                    <h2>Order Summary</h2>
                                </ListGroup.Item>

                                <ListGroup.Item>
                                    <Row>
                                        <Col>Items</Col>
                                        <Col>${order.itemsPrice}</Col>
                                    </Row>
                                </ListGroup.Item>

                                <ListGroup.Item>
                                    <Row>
                                        <Col>Shipping</Col>
                                        <Col>${order.shippingPrice}</Col>
                                    </Row>
                                </ListGroup.Item>

                                <ListGroup.Item>
                                    <Row>
                                        <Col>Tax</Col>
                                        <Col>${order.taxPrice}</Col>
                                    </Row>
                                </ListGroup.Item>

                                <ListGroup.Item>
                                    <Row>
                                        <Col>Total</Col>
                                        <Col>${order.totalPrice}</Col>
                                    </Row>
                                </ListGroup.Item>

                                {!order?.isPaid &&
                                    order?.user &&
                                    userInfo &&
                                    order?.user._id === userInfo._id && (
                                        <ListGroup.Item>
                                            <Row>
                                                {order?.paymentMethod ===
                                                    "Paypal" && (
                                                    <Col>
                                                        {loadingPay && (
                                                            <Loader />
                                                        )}
                                                        {!sdkReady ? (
                                                            <Loader />
                                                        ) : (
                                                            <PayPalButton
                                                                amount={
                                                                    order.totalPrice
                                                                }
                                                                onSuccess={
                                                                    handlePaymentSucces
                                                                }
                                                            ></PayPalButton>
                                                        )}
                                                    </Col>
                                                )}
                                                {order?.paymentMethod ===
                                                    "Stripe" &&
                                                    stripePublishKey && (
                                                        <Col>
                                                            <StripeCheckout
                                                                stripeKey={
                                                                    stripePublishKey
                                                                }
                                                                token={
                                                                    handleStripeToken
                                                                }
                                                                billingAddress
                                                                shippingAddress
                                                                amount={
                                                                    order.totalPrice *
                                                                    100
                                                                }
                                                                name={
                                                                    "Test Product"
                                                                }
                                                            >
                                                                <button className="btn btn-success btn-block">
                                                                    Pay with
                                                                    Credit Card
                                                                </button>
                                                            </StripeCheckout>
                                                        </Col>
                                                    )}
                                                {order?.paymentMethod ===
                                                    "Cash" && (
                                                    <div>
                                                        <h1>Note:</h1>
                                                        Please Copy the "Order
                                                        Id" from heading or from
                                                        here <b>{order?._id}</b>
                                                        . If your order is not
                                                        dilvered or you need any
                                                        inquiry related to your
                                                        order then kindly send
                                                        us the ORDER ID so we
                                                        can assit you.{" "}
                                                        <b>Thankyou</b>
                                                    </div>
                                                )}
                                            </Row>
                                        </ListGroup.Item>
                                    )}
                                {loadingDeliver && <Loader />}
                                {userInfo &&
                                    userInfo.isAdmin &&
                                    // order.isPaid &&
                                    !order.isDelivered && (
                                        <ListGroup.Item>
                                            <Button
                                                type="button"
                                                className="btn btn-block"
                                                onClick={deliverHandler}
                                            >
                                                Mark as Delivered
                                            </Button>
                                        </ListGroup.Item>
                                    )}
                            </ListGroup>
                        </LightSpeed>
                    </Card>
                </Col>
            </Row>
        </>
    );
};

export default OrderScreen;
