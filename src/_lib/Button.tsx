import * as React from "react";

import "./Button.css";

export enum ButtonType {
    Normal,
    Small,
    Circular,
    CircularLarge
};

type ButtonProps = {
    handleClick: (ev: React.MouseEvent<HTMLButtonElement>) => void
    children: React.ReactNode
    type?: ButtonType
};

const Button = ({ handleClick, type, children }: ButtonProps) => {
    const classNames = [
        "button",
        type === ButtonType.Small && "min",
        type === ButtonType.Circular && "circle",
        type === ButtonType.CircularLarge && "circle large"
    ].filter(Boolean);

    return (
        <div className={classNames.join(" ")}>
            <button onClick={handleClick}>
                {children}
            </button>
        </div>
    );
};

Button.defaultProps = {
    type: ButtonType.Normal
};

export default Button;
