import * as React from "react"
import { gql } from "apollo-boost";
import { useMutation } from "@apollo/react-hooks";
import { Tooltip } from "@chakra-ui/core";
import Card from "../_lib/Card";
import Textarea from "../_lib/Textarea";
import Button, { ButtonType } from "../_lib/Button";
import CardType from "./CardType";
import Icon from "../_lib/Icon";

import "./ColumnInput.css";
import { Context } from "../Context";
import Steps from "../Steps";

type ColumnInputProps = {
    submitCard: (card: CardType) => void
    type: string
}

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

export default function ColumnInput({ submitCard, type }: ColumnInputProps) {
    const { currentStep } = React.useContext(Context);

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
            addCard({ variables: { type }});
        }
    };

    const editCard = (ev: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (newCard) {
            const card = { id: newCard.id, text: ev.target.value };
            setNewCard(card);
            updateCard({ variables: { id: card.id, content: card.text } });
        }
    };

    const submit = () => {
        if (newCard) {
            setNewCard(null);
            submitCard(newCard);
        }
    };

    return currentStep > Steps.WRITE ? null : (
        <Card lessPadding width="95%">
            <div className="card-title">
                {type[0] + type.substr(1).toLowerCase()}
            </div>
            {currentStep === Steps.WAIT ? (
                <div style={{ width: "100%", fontSize: 25, textAlign: "right", marginTop: -42 }}>
                    <Tooltip
                        label="We're waiting to start!"
                        aria-label="Waiting to start"
                        placement="left"
                        backgroundColor="black"
                        borderRadius="3px"
                        fontSize="13px"
                        color="var(--text-default-color)"
                    >
                        ⏱
                    </Tooltip>
                </div>
            ) : (
                <>
                    <Textarea
                        handleChange={editCard}
                        handleFocus={createCard}
                        submit={submit}
                        placeholder="Start typing here"
                        value={newCard?.text || ''}
                    />
                    <Button type={ButtonType.Circular} handleClick={submit}>
                        <Icon name="arrow-right" />
                    </Button>
                </>
            )}
        </Card>
    );
}