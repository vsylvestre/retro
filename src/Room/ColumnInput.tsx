import * as React from "react";
import { Context } from "../Context";
import Steps from "../Steps";
import useCardMutations from "./useCardMutations";
import { Tooltip } from "@chakra-ui/core";
import Card from "../_lib/Card";
import Textarea from "../_lib/Textarea";
import Button, { ButtonType } from "../_lib/Button";
import CardType from "./CardType";
import Icon from "../_lib/Icon";

import "./ColumnInput.css";

type ColumnInputProps = {
  submitCard: (card: CardType) => void;
  type: string;
};

export default function ColumnInput({ submitCard, type }: ColumnInputProps) {
  const { currentStep } = React.useContext(Context);

  const { newCard, createCard, editCard, reset } = useCardMutations(type);

  const submit = () => {
    if (newCard) {
      reset();
      submitCard(newCard);
    }
  };

  return currentStep > Steps.WRITE ? null : (
    <Card lessPadding width="95%">
      <div className="card-title">{type[0] + type.substr(1).toLowerCase()}</div>
      {currentStep === Steps.WAIT ? (
        <div
          style={{
            width: "100%",
            fontSize: 25,
            textAlign: "right",
            marginTop: -42,
          }}
        >
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
            value={newCard?.content ?? ""}
          />
          <Button type={ButtonType.Circular} handleClick={submit}>
            <Icon name="arrow-right" />
          </Button>
        </>
      )}
    </Card>
  );
}
