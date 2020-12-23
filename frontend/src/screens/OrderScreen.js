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
} from "../actions/orderActions";
import axios from "axios";
import { PayPalButton } from "react-paypal-button-v2";
import {
    ORDER_PAY_RESET,
    ORDER_DELIVER_RESET,
} from "../constants/orderConstants";

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

    useEffect(() => {
        if (!userInfo) {
            history.push("/login");
        } else {
            //Calculate Prices
            // if (!loading && !loadingUser) {
            // const addDecimals = (value) => {
            //     return (Math.round(value * 100) / 100).toFixed(2);
            // };
            // order.itemsPrice = addDecimals(
            //     order.orderItems.reduce(
            //         (acc, item) => acc + item.price * item.qty,
            //         0
            //     )
            // );
            // order.totalPrice = (
            //     Number(order.itemsPrice) +
            //     Number(order.shippingPrice) +
            //     Number(order.taxPrice)
            // ).toFixed(2);
            //}

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
                document.body.appendChild(script);
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
    }, [
        dispatch,
        history,
        orderId,
        successPay,
        order,
        userInfo,
        sdkReady,
        successDeliver,
    ]);

    const handlePaymentSucces = (paymentResult) => {
        console.log(JSON.stringify(paymentResult));

        dispatch(payOrder(orderId, paymentResult));
    };

    const deliverHandler = () => {
        dispatch(deliverOrder(order));
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

                        <ListGroup.Item>
                            <h2>Payment Method</h2>
                            <p>
                                <strong>Method: </strong>
                                {order.paymentMethod}
                            </p>
                            {order.isPaid ? (
                                <Message variant="success">
                                    Paid On: {order.paidAt}
                                </Message>
                            ) : (
                                <Message variant="danger">Not Paid</Message>
                            )}
                        </ListGroup.Item>

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
                                                    <Image
                                                        src={item.image}
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
                                                        {item.price} = $
                                                        {item.qty * item.price}
                                                    </span>
                                                </Col>
                                            </Row>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            )}
                        </ListGroup.Item>
                    </ListGroup>
                </Col>
                <Col md={4}>
                    <Card>
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

                            {!order.isPaid &&
                                order.user &&
                                userInfo &&
                                order.user._id === userInfo._id && (
                                    <ListGroup.Item>
                                        <Row>
                                            <Col>
                                                {loadingPay && <Loader />}
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
                                        </Row>
                                    </ListGroup.Item>
                                )}
                            {loadingDeliver && <Loader />}
                            {userInfo &&
                                userInfo.isAdmin &&
                                order.isPaid &&
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
                    </Card>
                </Col>
            </Row>
        </>
    );
};

export default OrderScreen;
