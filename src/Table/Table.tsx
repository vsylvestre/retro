import * as React from "react";
import Column from "./Column";
import { gql } from 'apollo-boost';
import { useSubscription } from '@apollo/react-hooks';

import "./Table.css";

type TableProps = {
    categories: string[]
};

export default function Table({ categories }: TableProps) {
    const columnEls: JSX.Element[] = [];

    categories.forEach((category) => {
        columnEls.push(<Column key={category} category={category} />);
    });

    return (
        <div className="table">
            {columnEls}
        </div>
    );
}
