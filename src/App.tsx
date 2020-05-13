import React, { useState } from "react";
import { ApolloProvider } from '@apollo/react-hooks';
import useApolloClient from "./useApolloClient";
import ContextProvider from "./Context";
import Header from "./Header/Header";
import Table from "./Table/Table";
import Login from "./Login/Login";
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

    return (
        <ApolloProvider client={client}>
            <ContextProvider>
                <Header />
                {!hasUser
                    ? <Login setHasUser={setHasUser} />
                    : (
                        <>
                            <Users />
                            <Title />
                            <Table categories={["MAD", "SAD", "GLAD"]} />
                            <Footer />
                        </>
                    )
                }
            </ContextProvider>
        </ApolloProvider>
    );
}
