import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Form, Row, Col, Button } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import Message from "../components/Message";
import Loader from "../components/Loader";
import { login } from "../actions/userActions";
import FromContainer from "../components/FromContainer";
import { Bounce } from "react-reveal";

const LoginScreen = ({ location, history }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const dispatch = useDispatch();

    const userLogin = useSelector((state) => state.userLogin);
    const { loading, error, userInfo } = userLogin;

    const redirect = location.search ? location.search.split("=")[1] : "/";

    useEffect(() => {
        if (userInfo) {
            history.push(redirect);
        }
    }, [history, userInfo, redirect]);

    const handleSubmit = (e) => {
        e.preventDefault();

        dispatch(login(email, password));
    };

    return (
        <FromContainer>
            <h1>Sign In</h1>
            {error && <Message variant="danger">{error}</Message>}
            {loading && <Loader />}
            <Bounce right cascade>
                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="email">
                        <Form.Label>Email Address</Form.Label>
                        <Form.Control
                            type="email"
                            placeholder="Enter Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        ></Form.Control>
                    </Form.Group>

                    <Form.Group controlId="password">
                        <Form.Label>Password Address</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Enter Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        ></Form.Control>
                    </Form.Group>

                    <Button type="submit" variant="primary">
                        Sign In
                    </Button>
                </Form>
            </Bounce>

            <Row className="py-3">
                <Col>
                    <span>
                        New Customer?{" "}
                        <Link
                            to={
                                redirect !== "/"
                                    ? `/register?redirect=${redirect}`
                                    : "/register"
                            }
                        >
                            <u>Register</u>
                        </Link>
                    </span>
                </Col>
            </Row>
        </FromContainer>
    );
};

export default LoginScreen;
