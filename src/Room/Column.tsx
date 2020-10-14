import * as React from "react";
import { Context } from "../Context";
import ColumnCard from "./ColumnCard";
import ColumnInput from "./ColumnInput";
import Steps from "../Steps";
import useCardsList from "./useCardsList";

import "./Column.css";

type ColumnProps = {
    category: string
};


export default function Column({ category }: ColumnProps) {
    // This takes care of fetching all cards when mounting +
    // subscribing to card events based on the category. Note
    // that this does _not_ take care of updates; only adding
    // or removing cards. Each card is responsible for its own
    // updates subscription (see `ColumnCard.tsx`)
    const { cards, setCards, refetch } = useCardsList(category);

    // When we reveal the cards, we'll fetch them again that all
    // users see their cards in the same order. That's why we
    // need the currentStep
    const { currentStep } = React.useContext(Context);

    React.useEffect(() => {
        if (currentStep === Steps.REVEAL) {
            refetch();
        }
    }, [currentStep]);

    return (
        <div className={`column ${category.toLowerCase()}`}>
            <ColumnInput
                submitCard={card => setCards([card, ...(cards || [])])}
                type={category}
            />
            {(cards || []).map(card => (
                <ColumnCard
                    key={card.id}
                    id={card.id}
                    userId={card.userId}
                    type={category}
                    initialText={card.content}
                />
            ))}
        </div>
    );
}