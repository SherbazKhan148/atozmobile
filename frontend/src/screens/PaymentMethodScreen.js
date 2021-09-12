import React, { useState } from "react";
import { Form, Button, Col } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import FromContainer from "../components/FromContainer";
import { savePaymentMethod } from "../actions/cartActions";
import CheckoutSteps from "../components/CheckoutSteps";
import { Flip } from "react-reveal";

const PaymentMethodScreen = ({ history, location }) => {
    //For Redirecting to Home Page
    const userLogin = useSelector((state) => state.userLogin);
    const { userInfo } = userLogin;

    if (!userInfo) {
        history.push("/login");
    }

    const cart = useSelector((state) => state.cart);
    const { shippingAddress } = cart;

    if (!shippingAddress) {
        history.push("/shipping");
    }

    const [paymentMethod, setPaymentMethod] = useState("Cash");

    const dispatch = useDispatch();

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(savePaymentMethod(paymentMethod));
        history.push("/placeOrder");
    };
    return (
        <FromContainer>
            <CheckoutSteps step1 step2 step3 pathname={location.pathname} />
            <h1>Payment Method</h1>
            <Flip left cascade>
                <Form onSubmit={handleSubmit}>
                    <Form.Group>
                        <Form.Label as="legend">Select Method</Form.Label>
                        <Col>
                            <Form.Check
                                type="radio"
                                label="Cash On Delivery"
                                id="cash"
                                name="paymentMethod"
                                value="Cash"
                                checked
                                onChange={(e) =>
                                    setPaymentMethod(e.target.value)
                                }
                            ></Form.Check>
                            {/* <Form.Check
                                type="radio"
                                label="PayPal or Credit Card"
                                id="PayPal"
                                name="paymentMethod"
                                value="PayPal"
                                checked
                                onChange={(e) =>
                                    setPaymentMethod(e.target.value)
                                }
                            ></Form.Check>
                            <Form.Check
                                type="radio"
                                label="Card"
                                id="stripe"
                                name="paymentMethod"
                                value="Stripe"
                                onChange={(e) =>
                                    setPaymentMethod(e.target.value)
                                }
                            ></Form.Check> */}
                        </Col>
                    </Form.Group>

                    <Button type="submit" variant="primary">
                        Continue
                    </Button>
                </Form>
            </Flip>
        </FromContainer>
    );
};

export default PaymentMethodScreen;
