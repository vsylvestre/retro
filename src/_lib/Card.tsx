import * as React from "react";

import "./Card.css";

type CardProps = {
  children: React.ReactNode;
  lessPadding?: boolean;
  flex?: boolean;
  padding?: number | string;
  width?: number | string;
};

const defaultProps = {
  lessPadding: false,
  width: 400,
};

const Card = (props: CardProps) => {
  const { children, lessPadding, flex, padding, width } = props;

  const style: React.CSSProperties = {
    display: flex ? "flex" : undefined,
    padding: padding,
    width,
  };

  return (
    <div className={`card${lessPadding ? " min" : ""}`} style={style}>
      {children}
    </div>
  );
};

Card.defaultProps = defaultProps;

export default Card;
