import * as React from "react";
import { gql } from "apollo-boost";
import { useLazyQuery } from "@apollo/react-hooks";
import RoomType from "./Room/RoomType";
import UserType from "./UserType";
import Steps from "./Steps";
import JoinRoom from "./Login/JoinRoom";
import Login from "./Login/Login";
import Users from "./Header/Users";
import Title from "./Header/Title";
import Room from "./Room/Room";
import Footer from "./Footer/Footer";

type RouterProps = {
    room: RoomType | null
    setRoom: (room: RoomType) => void
    user: UserType | null
    setUser: (user: UserType) => void
};

const GET_ROOM = gql`
    query getRoom($id: String!) {
        room(id: $id) {
            id
            step
            createdAt
            done
        }
    }
`;

/**
 * This Router is a bit rudimentary because we don't
 * really expect to have a lot of "pages" for now. So it's
 * mostly a bunch of booleans that we toggle and we display
 * different components based on their state.
 *
 * It's also here that we find the Room URL logic.
 */
export default function Router(props: RouterProps) {
    const {
        room, setRoom, user, setUser
    } = props;

    const [getRoom, { data: getRoomData, loading }] = useLazyQuery(GET_ROOM);

    // We set this to `true` if the room URL or the
    // room code entered by the user does not exist
    const [hasError, setHasError] = React.useState(false);

    React.useEffect(() => {
        if (window.location.pathname !== "/") {
            getRoom({ variables: { id: window.location.pathname.substr(1) } });
        }
    }, [getRoom]);

    React.useEffect(() => {
        if (room) {
            window.history.pushState(null, "", `/${room.id}`);
        }
    }, [room]);

    React.useEffect(() => {
        if (getRoomData && !room) {
            if (getRoomData.room) {
                // If the room is archived, we consider that we're at the last step,
                // regardless of where the meeting was at when it ended
                const step = getRoomData.room.done ? Steps.REVEAL : getRoomData.room.step;
                setRoom({ ...getRoomData.room, step });
            } else {
                setHasError(true);
            }
        }
    }, [getRoomData, setRoom, setHasError, room]);

    if (loading) {
        return null;
    }

    if (!room) {
        return <JoinRoom setRoom={setRoom} getRoom={getRoom} hasError={hasError} />;
    }

    if (!user) {
        return <Login setUser={setUser} />;
    }

    return (
        <>
            <Users />
            <Title />
            <Room categories={["MAD", "SAD", "GLAD"]} />
            <Footer />
        </>
    );
}