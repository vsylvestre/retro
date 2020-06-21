import * as React from "react";
import Column from "./Column";

import "./Room.css";

type RoomProps = {
    categories: string[]
};

export default function Room({ categories }: RoomProps) {
    const columnEls: JSX.Element[] = [];

    categories.forEach((category) => {
        columnEls.push(<Column key={category} category={category} />);
    });

    return (
        <div className="room">
            {columnEls}
        </div>
    );
}
