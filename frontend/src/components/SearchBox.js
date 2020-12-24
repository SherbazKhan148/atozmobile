import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";

const SearchBox = ({ history }) => {
    const submitHandler = (e) => {
        e.preventDefault();

        if (keyword.trim()) {
            const tempKeyword = keyword;
            setKeyword("");
            history.push(`/search/${tempKeyword}`);
        } else {
            history.push("/");
        }
    };

    const [keyword, setKeyword] = useState("");
    return (
        <Form onSubmit={submitHandler}>
            <div style={{ display: "flex" }}>
                <Form.Control
                    type="text"
                    name="q"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Search Products..."
                ></Form.Control>

                <Button type="submit" variant="outline-success" className="p-2">
                    Search
                </Button>
            </div>
        </Form>
    );
};

export default SearchBox;
