import React from "react";
import { Flex } from "@chakra-ui/react";
import styled from "@emotion/styled";
import Header from "./Header/Header";
import Card from "./Card";

import "./App.css";

const StyledFlex = styled(Flex)`
    height: 100vh;
    justify-content: center;
    align-items: center;

    .card {
        text-align: center;

        h1 {
            margin-top: 8px;
        }

        a {
            color: var(--accent-color);
        }
    }
`;

export default function App() {

    return (
        <StyledFlex>
            <Header />
            <Card>
                <h1>📦 Rétro moved!</h1>
                <p style={{ marginBottom: 0, lineHeight: 1.3 }}>
                    Go to <a href="https://retro.up.railway.app/">https://retro.up.railway.app/</a> to get access to Rétro.
                </p>
            </Card>
        </StyledFlex>
    );
}
