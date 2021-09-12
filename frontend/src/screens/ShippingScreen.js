import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import FromContainer from "../components/FromContainer";
import { saveShippingAddress } from "../actions/cartActions";
import CheckoutSteps from "../components/CheckoutSteps";
import { Roll } from "react-reveal";

const ShippingScreen = ({ history, location }) => {
    const cart = useSelector((state) => state.cart);
    const { shippingAddress } = cart;

    const [address, setAddresss] = useState(shippingAddress.address);
    const [city, setCity] = useState(shippingAddress.city);
    const [postalCode, setPostalCode] = useState(shippingAddress.postalCode);
    const [country, setCountry] = useState(shippingAddress.country);

    const dispatch = useDispatch();

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(saveShippingAddress({ address, city, postalCode, country }));
        history.push("/payment");
    };
    return (
        <FromContainer>
            <CheckoutSteps step1 step2 pathname={location.pathname} />
            <h1>Shipping</h1>
            <Roll left cascade>
                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="address">
                        <Form.Label>Address</Form.Label>
                        <Form.Control
                            type="address"
                            placeholder="Enter Address"
                            value={address}
                            required
                            onChange={(e) => setAddresss(e.target.value)}
                        ></Form.Control>
                    </Form.Group>

                    <Form.Group controlId="city">
                        <Form.Label>City</Form.Label>
                        <Form.Control
                            type="city"
                            placeholder="Enter City"
                            value={city}
                            required
                            onChange={(e) => setCity(e.target.value)}
                        ></Form.Control>
                    </Form.Group>

                    <Form.Group controlId="postalCode">
                        <Form.Label>Postal Code</Form.Label>
                        <Form.Control
                            type="postalCode"
                            placeholder="Enter Postal Code"
                            value={postalCode}
                            required
                            onChange={(e) => setPostalCode(e.target.value)}
                        ></Form.Control>
                    </Form.Group>

                    <Form.Group controlId="country">
                        <Form.Label>Country</Form.Label>
                        <Form.Control
                            type="country"
                            placeholder="Enter Postal Code"
                            value={country}
                            required
                            onChange={(e) => setCountry(e.target.value)}
                        ></Form.Control>
                    </Form.Group>

                    <Button type="submit" variant="primary">
                        Continue
                    </Button>
                </Form>
            </Roll>
        </FromContainer>
    );
};

export default ShippingScreen;
