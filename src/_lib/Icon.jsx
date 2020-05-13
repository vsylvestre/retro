import React, { useLayoutEffect } from "react";

const Icon = ({ name, width = 16, height = 16 }) => {
    useLayoutEffect(() => {
        window.feather.replace();
    }, []);

    return (
        <i data-feather={name} style={{ width, height }} />
    );
};

export default Icon;