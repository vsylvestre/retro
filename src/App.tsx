import React, { useState } from "react";
import { ApolloProvider } from '@apollo/react-hooks';
import { ThemeProvider, DarkMode } from "@chakra-ui/core";
import useApolloClient from "./useApolloClient";
import ContextProvider from "./Context";
import Header from "./Header/Header";
import Menu from "./Login/Menu";
import Login from "./Login/Login";
import Table from "./Table/Table";
import Users from "./Header/Users";
import Title from "./Header/Title";
import Footer from "./Footer/Footer";

import "./App.css";

export default function App() {
    const client = useApolloClient();

    // We will set this to `true` once the user
    // has passed the login page, in order to display
    // the room
    const [hasUser, setHasUser] = useState(false);
    const [room, setRoom] = useState<string | null>(null);

    return (
        <ApolloProvider client={client}>
            <ContextProvider room={room} hasUser={hasUser}>
                <ThemeProvider>
                    <DarkMode>
                        <Header />
                        {!room
                            ? <Menu setRoom={setRoom} />
                            : (
                                !hasUser
                                    ? <Login setHasUser={setHasUser} />
                                    : (
                                        <>
                                            <Users />
                                            <Title />
                                            <Table categories={["MAD", "SAD", "GLAD"]} />
                                            <Footer />
                                        </>
                                    )
                            )
                        }
                    </DarkMode>
                </ThemeProvider>
            </ContextProvider>
        </ApolloProvider>
    );
}
