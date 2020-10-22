import * as React from "react";
import { gql } from "apollo-boost";
import { useMutation } from "@apollo/react-hooks";
import CardType from "./CardType";

type UseCardMutations = {
  newCard: CardType | null;
  createCard: () => void;
  editCard: (
    ev: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string
  ) => void;
  reset: () => void;
};

const ADD_CARD = gql`
  mutation AddCard($type: String!) {
    addCard(type: $type) {
      id
    }
  }
`;

const UPDATE_CARD = gql`
  mutation UpdateCard($id: String!, $content: String!) {
    updateCard(id: $id, content: $content) {
      id
    }
  }
`;

export default function useCardMutations(type: string): UseCardMutations {
  const [newCard, setNewCard] = React.useState<CardType | null>(null);

  const [addCard, { data }] = useMutation(ADD_CARD);
  const [updateCard] = useMutation(UPDATE_CARD);

  React.useEffect(() => {
    if (data) {
      setNewCard({ id: data.addCard.id });
    }
  }, [data]);

  const createCard = () => {
    if (!newCard) {
      addCard({ variables: { type } });
    }
  };

  const editCard = (
    input: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string
  ) => {
    if (newCard) {
      const card = {
        id: newCard.id,
        content: typeof input === "string" ? input : input.target.value,
      };
      setNewCard(card);
      updateCard({ variables: { id: card.id, content: card.content } });
    }
  };

  const reset = () => setNewCard(null);

  return {
    newCard,
    createCard,
    editCard,
    reset,
  };
}
