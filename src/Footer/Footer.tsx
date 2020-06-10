import * as React from "react";
import { gql } from "apollo-boost";
import { useLazyQuery } from "@apollo/react-hooks";
import { Context } from "../Context";
import useFileDownload from "./useFileDownload";
import Icon from "../_lib/Icon";
import Button, { ButtonType } from "../_lib/Button";
import MainAction from "./MainAction";
import ShareLink from "./ShareLink";
import Steps from "../Steps";
import Timer from "./Timer";

import "./Footer.css";

const GET_CARDS = gql`
    query {
        cards {
            content
            type
        }
    }
`;

export default function Footer() {
    const [loadCards, { data }] = useLazyQuery(GET_CARDS, { fetchPolicy: "network-only" });

    const { currentStep } = React.useContext(Context);

    useFileDownload(data);

    return (
        <div className="footer">
            <div className="footer-left">
                <Timer shouldStart={currentStep === Steps.WRITE} />
            </div>
            <div className="footer-right">
                <Button type={ButtonType.CircularLarge} handleClick={() => loadCards()}>
                    <Icon name="download" size={17} />
                </Button>
                <ShareLink />
                <MainAction currentStep={currentStep} />
            </div>
        </div>
    );
}