import React, { useState } from "react";
import { useMutation } from "@apollo/react-hooks";
import { animated, useSpring } from "react-spring";
import { gql } from "apollo-boost";
import RoomType from "../Room/RoomType";
import Button from "../_lib/Button";
import Card from "../_lib/Card";
import Input from "../_lib/Input";

import "./JoinRoom.css";

type JoinRoomProps = {
  getRoom: (input: { variables: { id: string } }) => void;
  setRoom: (room: RoomType) => void;
  hasError: boolean;
};

const CREATE_ROOM_MUTATION = gql`
  mutation {
    createRoom {
      id
      step
      createdAt
      done
    }
  }
`;

export default function JoinRoom({
  getRoom,
  setRoom,
  hasError,
}: JoinRoomProps) {
  const [roomId, setRoomId] = useState("");

  const [createRoom, { data: createRoomData }] = useMutation(
    CREATE_ROOM_MUTATION
  );

  const animationProps = useSpring({ opacity: 1, from: { opacity: 0 } });

  React.useEffect(() => {
    if (createRoomData) {
      setRoom(createRoomData.createRoom);
    }
  }, [createRoomData, setRoom]);

  return (
    <animated.div className="menu" style={animationProps}>
      <div
        style={{ maxWidth: 450, fontSize: 14, color: "hsla(0, 0%, 100%, 0.4)" }}
      >
        <Card width={450}>
          <div
            style={{
              textAlign: "center",
              fontSize: 29,
              fontWeight: 500,
              color: "#ffffffde",
            }}
          >
            Join a room
          </div>
          <div style={{ textAlign: "center", padding: "5px 0" }}>
            Type the room code
          </div>
          <Input
            handleChange={(ev) => setRoomId(ev.target.value)}
            value={roomId}
          />
          {hasError && (
            <div
              style={{
                color: "var(--red-color)",
                fontSize: 13,
                padding: "0 10px",
                marginTop: -5,
              }}
            >
              This room does not exist.
            </div>
          )}
          <Button handleClick={() => getRoom({ variables: { id: roomId } })}>
            Join
          </Button>
          <div style={{ paddingTop: 15, textAlign: "center" }}>
            or <a onClick={() => createRoom()}>Create a room</a>
          </div>
        </Card>
      </div>
    </animated.div>
  );
}
