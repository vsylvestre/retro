import * as React from 'react';

import './Card.css';

type CardProps = {
    children: React.ReactNode
    lessPadding: boolean
};

const Card = ({ children, lessPadding }: CardProps) => (
    <div className={`card${lessPadding ? ' min' : ''}`}>
        {children}
    </div>
);

Card.defaultProps = {
    lessPadding: false
};

export default Card;
