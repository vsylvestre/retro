import * as React from "react";
import { useMutation } from "@apollo/react-hooks";
import { gql } from "apollo-boost";
import Button from "../_lib/Button";
import Steps from "../Steps";
import { Context } from "../Context";
import { UserRole } from "../UserType";

type MainActionProps = {
  currentStep: number;
};

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

const styles = {
  display: "inline-flex",
  paddingRight: 20,
  marginRight: 10,
  borderRight: "1px solid var(--border-color)",
};

const MainAction = ({ currentStep }: MainActionProps) => {
  const { user } = React.useContext(Context);
  const isAdmin = user && user.role === UserRole.ADMIN;

  const [switchSteps] = useMutation(SWITCH_STEPS);

  return !isAdmin || currentStep > 1 ? null : (
    <div style={styles}>
      <Button handleClick={() => switchSteps()}>
        {getMainAction(currentStep)}
      </Button>
    </div>
  );
};

export default MainAction;
