import React from "react";
import { ApolloProvider } from "@apollo/react-hooks";
import { ThemeProvider, DarkMode } from "@chakra-ui/core";
import RoomType from "./Room/RoomType";
import UserType from "./UserType";
import ContextProvider from "./Context";
import useApolloClient from "./useApolloClient";
import Header from "./Header/Header";
import Router from "./Router";

import "./App.css";

export default function App() {
  const [room, setRoom] = React.useState<RoomType | null>(null);
  const [user, setUser] = React.useState<UserType | null>(null);

  const client = useApolloClient(user ? user.id : null, room ? room.id : null);

  return (
    <ApolloProvider client={client}>
      <ContextProvider room={room} user={user}>
        <ThemeProvider>
          <DarkMode>
            <Header />
            <Router
              room={room}
              setRoom={setRoom}
              user={user}
              setUser={setUser}
            />
          </DarkMode>
        </ThemeProvider>
      </ContextProvider>
    </ApolloProvider>
  );
}
