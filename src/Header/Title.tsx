import * as React from "react";
import Steps from "../Steps";
import { Context } from "../Context";

import "./Title.css";

function getTitle(currentStep: number | null) {
  switch (currentStep) {
    case Steps.WAIT:
      return "Waiting to start...";
    case Steps.WRITE:
      return "Time to write";
    case Steps.REVEAL:
      return "Time to read your answers";
    default:
      return "The meeting is over";
  }
}

const Title = () => {
  const { currentStep, room } = React.useContext(Context);

  return (
    <div className="title-container">
      <div className="title">{getTitle(room?.done ? null : currentStep)}</div>
    </div>
  );
};

export default Title;
