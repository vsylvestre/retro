import React, { useState } from "react";
import { useMutation } from "@apollo/react-hooks";
import { gql } from "apollo-boost";
import { animated, useSpring } from "react-spring";
import Input from "../_lib/Input";
import Button from "../_lib/Button";
import Card from "../_lib/Card";

import "./Login.css";

const LOGIN_MUTATION = gql`
    mutation Login($username: String!) {
        login(username: $username) {
            id
            name
            role
        }
    }
`;

export default function Login({ setHasUser }) {
    const [username, setUsername] = useState('')
    const [login, { data }] = useMutation(LOGIN_MUTATION, { variables: { username }});

    const animationProps = useSpring({ opacity: 1, from: { opacity: 0 } });

    React.useEffect(() => {
        if (data) {
            localStorage.setItem("userId", data.login.id);
            localStorage.setItem("userRole", data.login.role);
            setHasUser(true);
        }
    }, [data]);

    return (
        <animated.div className="login" style={animationProps}>
            <Card>
                <div style={{ padding: "0 10px", lineHeight: 1.5, maxWidth: "90%", fontWeight: 300, fontSize: 14 }}>
                    Type your name:
                </div>
                <Input handleChange={ev => setUsername(ev.target.value)} submit={login} />
                <Button handleClick={login}>
                    Enter
                </Button>
            </Card>
        </animated.div>
    );
}