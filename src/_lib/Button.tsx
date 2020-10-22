import * as React from "react";
import Tooltip from "./Tooltip";

import "./Button.css";

export enum ButtonType {
  Normal,
  Small,
  Circular,
  CircularLarge,
  CircularLargeEmpty,
}

type ButtonProps = {
  handleClick: (ev?: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
  tooltip?: string;
  type?: ButtonType;
};

const Button = ({ handleClick, tooltip, type, children }: ButtonProps) => {
  const classNames = [
    "button",
    type === ButtonType.Small && "min",
    type === ButtonType.Circular && "circle",
    type === ButtonType.CircularLarge && "circle large",
    type === ButtonType.CircularLargeEmpty && "circle large empty",
  ].filter(Boolean);

  const button = (
    <div className={classNames.join(" ")}>
      <button onClick={handleClick}>{children}</button>
    </div>
  );

  return tooltip ? <Tooltip label={tooltip}>{button}</Tooltip> : button;
};

Button.defaultProps = {
  type: ButtonType.Normal,
};

export default Button;
