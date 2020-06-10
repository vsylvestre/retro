import React, { useLayoutEffect } from "react";

const Icon = ({ name, size = 16 }) => {
    useLayoutEffect(() => {
        window.feather.replace();
    }, []);

    return (
        <i data-feather={name} style={{ width: size, height: size }} />
    );
};

export default Icon;