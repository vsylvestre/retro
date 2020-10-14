import * as React from "react";
import { gql } from "apollo-boost";
import { useSubscription, useQuery } from "@apollo/react-hooks";
import { Context } from "../Context";
import ColumnCard from "./ColumnCard";
import ColumnInput from "./ColumnInput";
import CardType from "./CardType";

import "./Column.css";
import Steps from "../Steps";

type ColumnProps = {
    category: string
};

const GET_CARDS = gql`
    query getCards {
        cards {
            id
            type
            userId
            content
        }
    }
`;

const CARD_ADDED_SUBSCRIPTION = gql`
    subscription onCardAdded($userId: String!, $type: String!) {
        cardAdded(userId: $userId, type: $type) {
            id
            type
            userId
        }
    }
`;

const CARD_DELETED_SUBSCRIPTION = gql`
    subscription onCardDeleted($type: String!) {
        cardDeleted(type: $type) {
            id
        }
    }
`;

export default function Column({ category }: ColumnProps) {
    const [cards, setCards] = React.useState<CardType[]>([]);

    // First, we load any existing cards, in case the user who
    // arrives is late to the game!
    const { data: getCards, refetch } = useQuery(GET_CARDS);

    // Also, when we reveal the cards, we'll fetch them again
    // so that all users see their cards in the same order. That's
    // why we need the currentStep
    const { currentStep, user } = React.useContext(Context);

    React.useEffect(() => {
        if (currentStep === Steps.REVEAL) {
            refetch();
        }
    }, [currentStep, refetch]);

    React.useEffect(() => {
        if (getCards && getCards.cards) {
            setCards((getCards.cards || []).filter((card: any) => card.type === category));
        }
    }, [getCards, category]);

    // We send the userId along with the subscription, because we
    // don't want to return the cards that were created by the
    // current user (and we'll filter on the server). Those cards
    // are added when the user submits (see ColumnInput.tsx).
    const { data: cardAddedEv } = useSubscription(CARD_ADDED_SUBSCRIPTION, {
        variables: { type: category, userId: user?.id }
    });

    React.useEffect(() => {
        if (cardAddedEv) {
            setCards(c => [cardAddedEv.cardAdded, ...c]);
        }
    }, [cardAddedEv]);

    // Same as CARD_ADDED_SUBSCRIPTION, except we don't need to send
    // the userId: all cards will be deleted through here, including
    // the current user's
    const { data: cardDeletedEv } = useSubscription(CARD_DELETED_SUBSCRIPTION, {
        variables: { type: category }
    });

    React.useEffect(() => {
        if (cardDeletedEv) {
            setCards(c => c.filter(({ id }) => id !== cardDeletedEv.cardDeleted.id));
        }
    }, [cardDeletedEv]);

    return (
        <div className="column">
            <ColumnInput
                submitCard={card => setCards([card, ...cards])}
                type={category}
            />
            {cards.map(card => (
                <ColumnCard
                    key={card.id}
                    id={card.id}
                    userId={card.userId}
                    type={category}
                    initialText={(card as any).content || card.text}
                />
            ))}
        </div>
    );
}