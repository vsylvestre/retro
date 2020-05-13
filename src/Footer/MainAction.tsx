import * as React from "react";
import { useMutation } from "@apollo/react-hooks";
import { gql } from "apollo-boost";
import Button, { ButtonType } from "../_lib/Button";
import Steps from "../Steps";

type MainActionProps = {
    currentStep: number
}

const SWITCH_STEPS = gql`
    mutation {
        switchSteps
    }
`;

function getMainAction(currentStep: number) {
    switch (currentStep) {
        case Steps.WAIT:
            return "Start";
        case Steps.WRITE:
            return "Reveal";
        case Steps.REVEAL:
            return "End session";
        default:
            return "?";
    }
}

const MainAction = ({ currentStep }: MainActionProps) => {
    const isAdmin = localStorage.getItem("userRole") === "ADMIN";

    const [switchSteps] = useMutation(SWITCH_STEPS);

    return !isAdmin || currentStep > 1 ? null : (
        <Button handleClick={() => switchSteps()}>
            {getMainAction(currentStep)}
        </Button>
    );
};

export default MainAction;