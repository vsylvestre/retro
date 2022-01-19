import React, { useState } from "react";
import { useMutation } from "@apollo/react-hooks";
import { gql } from "apollo-boost";
import { animated, useSpring } from "react-spring";
import { Select } from "@chakra-ui/react";
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

const SELECT_ROOM_TYPE_MUTATION = gql`
    mutation SelectRoomType($type: String!) {
        selectRoomType(type: $type) {
            type
        }
    }
`;

export default function Login({ setUser, setRoomType, isNewRoom }) {
    const [username, setUsername] = useState('');
    const [type, setType] = useState(undefined);

    const [login, { data: userData }] = useMutation(LOGIN_MUTATION, { variables: { username: username.trim() }});
    const [selectRoomType, { data: roomData }] = useMutation(SELECT_ROOM_TYPE_MUTATION, { variables: { type: type }});

    const animationProps = useSpring({ opacity: 1, from: { opacity: 0 } });

    React.useEffect(() => {
        if (isNewRoom && userData && roomData) {
            setRoomType(roomData.selectRoomType.type);
            setUser(userData.login);
        }
        if (!isNewRoom && userData) {
            setUser(userData.login);
        }
    }, [userData, roomData, setUser]);

    const submit = () => {
        if (isNewRoom) {
            selectRoomType(type);
        }
        login();
    }

    return (
        <animated.div className="login" style={animationProps}>
            <Card>
                <div style={{ padding: "0 10px", lineHeight: 1.5, maxWidth: "90%", fontWeight: 300, fontSize: 14 }}>
                    Type your name:
                </div>
                <Input 
                    handleChange={ev => setUsername(ev.target.value)} 
                    submitOnEnter={!isNewRoom} 
                    submit={submit} 
                />
                {isNewRoom ? (
                    <>
                        <div style={{ padding: "20px 10px 0 10px", lineHeight: 1.5, maxWidth: "90%", fontWeight: 300, fontSize: 14 }}>
                            Select a room type:
                        </div>
                        <Select placeholder="Select room" onChange={(ev) => setType(ev.target.value)}>
                            <option value="MAD_SAD_GLAD">Mad / Sad / Glad</option>
                            <option value="START_STOP_CONTINUE">Start / Stop / Continue</option>
                            <option value="HAPPY_CONFUSED_SAD">Happy / Confused / Sad</option>
                        </Select>
                    </>
                ) : null}
                <Button handleClick={submit} disabled={username.trim().length === 0}>
                    Enter
                </Button>
            </Card>
        </animated.div>
    );
}