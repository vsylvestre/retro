import * as React from "react";
import Steps from "../Steps";
import { Context } from "../Context";

import "./Title.css";

function getTitle(currentStep: number) {
    switch (currentStep) {
        case Steps.WAIT:
            return "Waiting to start...";
        case Steps.WRITE:
            return "Write";
        case Steps.REVEAL:
            return "Read your answers";
        default:
            return "?";
    }
}

const Title = () => {
    const { currentStep } = React.useContext(Context);

    return (
        <div className="title-container">
            <div className="title">
                {currentStep === 0 ? getTitle(currentStep) : (
                    <>
                        Time to
                        {" "}
                        {getTitle(currentStep).toLowerCase()}
                    </>
                )}
            </div>
        </div>
    );
};

export default Title;