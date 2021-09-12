import React, { useEffect } from "react";
import { Row, Col, ListGroup, Button, Image, Card } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import Message from "../components/Message";
import CheckoutSteps from "../components/CheckoutSteps";
import { Link } from "react-router-dom";
import {
    clearNewlyCreatedOrder,
    createOrder,
    getOrderDetails,
} from "../actions/orderActions";
import { clearCartItems } from "../actions/cartActions";
import { LightSpeed, Roll } from "react-reveal";

const PlaceOrderScreen = ({ location, history }) => {
    const dispatch = useDispatch();

    const cart = useSelector((state) => state.cart);

    //Calculate Prices
    const addDecimals = (value) => {
        return (Math.round(value * 100) / 100).toFixed(2);
    };

    cart.itemsPrice = addDecimals(
        cart.cartItems.reduce((acc, item) => acc + item.price * item.qty, 0)
    );

    cart.shippingPrice = addDecimals(cart.itemsPrice > 100 ? 0 : 100);

    cart.taxPrice = addDecimals(Number((0.15 * cart.itemsPrice).toFixed(2)));

    cart.totalPrice = (
        Number(cart.itemsPrice) +
        Number(cart.shippingPrice) +
        Number(cart.taxPrice)
    ).toFixed(2);

    const orderState = useSelector((state) => state.orderCreate);
    const { order, success, error } = orderState;

    //For Redirecting to Home Page
    const userLogin = useSelector((state) => state.userLogin);
    const { userInfo } = userLogin;

    useEffect(() => {
        if (!userInfo) {
            history.push("/login");
        }
        if (success) {
            //Getting Order Details After It Is Created
            dispatch(getOrderDetails(order._id));

            //Clearing Created Order and Cart Items From State So New Order Can be Created without Checking This Order is Paid Or Not
            dispatch(clearNewlyCreatedOrder());
            dispatch(clearCartItems());

            history.push(`/order/${order._id}`);
        }
        // eslint-disable-next-line
    }, [success, history]);

    const handlePlaceOrder = () => {
        dispatch(
            createOrder({
                orderItems: cart.cartItems,
                shippingAddress: cart.shippingAddress,
                paymentMethod: cart.paymentMethod,
                itemsPrice: cart.itemsPrice,
                shippingPrice: cart.shippingPrice,
                taxPrice: cart.taxPrice,
                totalPrice: cart.totalPrice,
            })
        );
    };

    return (
        <>
            <CheckoutSteps
                step1
                step2
                step3
                step4
                pathname={location.pathname}
            />
            <Row>
                <Col md={8}>
                    <Roll left cascade>
                        <ListGroup variant="flush">
                            <ListGroup.Item>
                                <h2>Shipping</h2>
                                <p>
                                    <strong>Address: </strong>
                                    {cart.shippingAddress.address},{" "}
                                    {cart.shippingAddress.city}{" "}
                                    {cart.shippingAddress.postalCode},{" "}
                                    {cart.shippingAddress.country}
                                </p>
                            </ListGroup.Item>

                            <ListGroup.Item>
                                <h2>Payment Method</h2>
                                <strong>Method: </strong>
                                {cart.paymentMethod === "Stripe"
                                    ? "Card"
                                    : cart.paymentMethod}
                            </ListGroup.Item>

                            <ListGroup.Item>
                                <h2>Order Items</h2>
                                {cart.cartItems.length === 0 ? (
                                    <Message>Your Cart Is Empty</Message>
                                ) : (
                                    <ListGroup variant="flush">
                                        {cart.cartItems.map((item, index) => (
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
                    <LightSpeed right cascade>
                        <Card>
                            <ListGroup variant="flush">
                                <ListGroup.Item>
                                    <h2>Order Summary</h2>
                                </ListGroup.Item>

                                <ListGroup.Item>
                                    <Row>
                                        <Col>Items</Col>
                                        <Col>Rs {cart.itemsPrice}</Col>
                                    </Row>
                                </ListGroup.Item>

                                <ListGroup.Item>
                                    <Row>
                                        <Col>Shipping</Col>
                                        <Col>Rs {cart.shippingPrice}</Col>
                                    </Row>
                                </ListGroup.Item>

                                <ListGroup.Item>
                                    <Row>
                                        <Col>Tax</Col>
                                        <Col>Rs {cart.taxPrice}</Col>
                                    </Row>
                                </ListGroup.Item>

                                <ListGroup.Item>
                                    <Row>
                                        <Col>Total</Col>
                                        <Col>Rs {cart.totalPrice}</Col>
                                    </Row>
                                </ListGroup.Item>

                                <ListGroup.Item>
                                    {error && (
                                        <Message variant="danger">
                                            {error}
                                        </Message>
                                    )}
                                </ListGroup.Item>

                                <ListGroup.Item>
                                    <Button
                                        type="button "
                                        className="btn-block"
                                        disabled={cart.cartItems.length === 0}
                                        onClick={handlePlaceOrder}
                                    >
                                        Place Order
                                    </Button>
                                </ListGroup.Item>
                            </ListGroup>
                        </Card>
                    </LightSpeed>
                </Col>
            </Row>
        </>
    );
};

export default PlaceOrderScreen;
