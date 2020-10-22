import * as React from "react";
import { gql } from "apollo-boost";
import { useQuery, useSubscription } from "@apollo/react-hooks";
import { Context } from "./../Context";
import CardType from "./CardType";

type UseCardsList = {
  cards: CardType[] | null;
  setCards: (cards: CardType[]) => void;
  refetch: () => void;
  loading: boolean;
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

/**
 * Use this hook at the level of a column (to display the
 * cards of a certain type).
 *
 * This takes care of adding/removing cards in real-time
 * based on subscriptions. It also fetches them when first
 * mounting, in case the user arrives in the middle of a
 * game.
 *
 * Note that it is not responsible for _updating_ the cards;
 * each card should be responsible for its own updates
 * subscription. The reason for that is that we don't want
 * to update the whole tree on every single card update.
 */
export default function useCardsList(type: string): UseCardsList {
  const [cards, setCards] = React.useState<CardType[] | null>(null);

  const { user } = React.useContext(Context);

  // First, we load any existing cards, in case the user that
  // arrives is late to the game!
  const { data: getCards, loading, refetch, called } = useQuery(GET_CARDS);

  React.useEffect(() => {
    if (getCards && getCards.cards) {
      setCards(
        (getCards.cards || []).filter((card: any) => card.type === type)
      );
    }
  }, [getCards, type]);

  // We send the userId along with the subscription, because we
  // don't want to return the cards that were created by the
  // current user (and we'll filter on the server). Those cards
  // are added when the user submits (see ColumnInput.tsx).
  const { data: cardAddedEv } = useSubscription(CARD_ADDED_SUBSCRIPTION, {
    variables: { type, userId: user?.id },
  });

  React.useEffect(() => {
    if (cardAddedEv) {
      setCards((c) => [cardAddedEv.cardAdded, ...(c || [])]);
    }
  }, [cardAddedEv]);

  // Same as CARD_ADDED_SUBSCRIPTION, except we don't need to send
  // the userId: all cards will be deleted through here, including
  // the current user's
  const { data: cardDeletedEv } = useSubscription(CARD_DELETED_SUBSCRIPTION, {
    variables: { type },
  });

  React.useEffect(() => {
    if (cardDeletedEv) {
      setCards((c) =>
        (c || []).filter(({ id }) => id !== cardDeletedEv.cardDeleted.id)
      );
    }
  }, [cardDeletedEv]);

  return {
    cards,
    setCards,
    refetch,
    loading: loading || !called,
  };
}
