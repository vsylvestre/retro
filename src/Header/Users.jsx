import React, { useState } from "react";
import { useSubscription, useQuery, useMutation } from "@apollo/react-hooks";
import { gql } from "apollo-boost";
import { Tooltip } from "@chakra-ui/core";

import "./Users.css";

const GET_USERS = gql`
    query {
        users {
            id
            name
            role
        }
    }
`;

const LEAVE_ROOM_MUTATION = gql`
    mutation {
        leaveRoom
    }
`;

const USER_JOINED_SUBSCRIPTION = gql`
    subscription userJoined {
        userJoined {
            name
        }
    }
`;

const USER_LEFT_SUBSCRIPTION = gql`
    subscription userLeft {
        userLeft {
            name
        }
    }
`;

export default function Users() {
    const [users, setUsers] = useState([]);

    // Upon loading, we get all of the users that have already
    // joined the room before us
    useQuery(GET_USERS, { onCompleted: data => setUsers(data.users) });

    // Then, if further users are logging in (or out), we update
    // the list using this subscription
    const { data: userJoinedEv } = useSubscription(USER_JOINED_SUBSCRIPTION);
    const { data: userLeftEv } = useSubscription(USER_LEFT_SUBSCRIPTION);

    const [leaveRoom] = useMutation(LEAVE_ROOM_MUTATION);

    function unload(ev) {
        leaveRoom();
        return null;
    }

    React.useEffect(() => {
        window.addEventListener("beforeunload", unload);
        return () => window.removeEventListener("beforeunload", unload);
    }, [unload]);

    React.useEffect(() => {
        if (userJoinedEv) {
            setUsers(u => [...u, { name: userJoinedEv.userJoined.name }]);
        }
    }, [userJoinedEv]);

    React.useEffect(() => {
        if (userLeftEv) {
            setUsers(u => u.filter(({ name }) => name !== userLeftEv.userLeft.name));
        }
    }, [userLeftEv]);

    if (users.length === 0) {
      return null;
    }

    return (
        <div className="users">
            {users.map(user => (
                <Tooltip
                    key={user.id}
                    label={user.name}
                    aria-label={user.name}
                    placement="top"
                    backgroundColor="black"
                    borderRadius="3px"
                    fontSize="12px"
                    color="var(--text-default-color)"
                >
                    <div className="user">
                        {user.name[0].toUpperCase()}
                    </div>
                </Tooltip>
            ))}
        </div>
    );
}