import * as React from "react";
import { gql } from "apollo-boost";
import { useLazyQuery, useMutation } from "@apollo/react-hooks";
import { useDisclosure } from "@chakra-ui/core";
import { Context } from "../Context";
import { UserRole } from "../UserType";
import useFileDownload from "./useFileDownload";
import Modal from "../_lib/Modal";
import Icon from "../_lib/Icon";
import Button, { ButtonType } from "../_lib/Button";
import MainAction from "./MainAction";
import ShareLink from "./ShareLink";
import Steps from "../Steps";
import Timer from "./Timer";

import "./Footer.css";

const GET_CARDS = gql`
  query {
    cards {
      content
      type
    }
  }
`;

const LEAVE_ROOM_MUTATION = gql`
  mutation {
    leaveRoom
  }
`;

export default function Footer() {
  const [loadCards, { data }] = useLazyQuery(GET_CARDS, {
    fetchPolicy: "network-only",
  });
  const [leaveRoom] = useMutation(LEAVE_ROOM_MUTATION, {
    onCompleted: () => {
      window.location.pathname = "/";
    },
  });

  const disclosure = useDisclosure();

  const { currentStep, user, setShowNotes, showNotes } = React.useContext(
    Context
  );

  useFileDownload(data);

  return (
    <div className="footer">
      <div className="footer-left">
        <Timer
          shouldStart={currentStep === Steps.WRITE}
          over={currentStep === Steps.REVEAL}
        />
      </div>
      <div className="footer-right">
        <Button
          handleClick={() =>
            user && user.role === UserRole.ADMIN
              ? disclosure.onOpen()
              : leaveRoom()
          }
        >
          Leave room
        </Button>
        <Button
          type={ButtonType.CircularLarge}
          tooltip="Export"
          handleClick={() => loadCards()}
        >
          <Icon name="download" size={17} />
        </Button>
        <ShareLink />
        {currentStep !== Steps.WAIT && (
          <Button
            type={
              showNotes
                ? ButtonType.CircularLargeEmpty
                : ButtonType.CircularLarge
            }
            tooltip={showNotes ? "Hide notes" : "Show notes"}
            handleClick={() => setShowNotes(!showNotes)}
          >
            <Icon name="list" size={17} />
          </Button>
        )}
        <MainAction currentStep={currentStep} />
      </div>
      <Modal
        header="End this meeting?"
        disclosure={disclosure}
        handleSubmit={() => leaveRoom()}
      >
        You are the admin in this room. Once you leave, the meeting will be
        considered over, and the content of the room will be saved as is for{" "}
        <b>7 days</b>. Are you sure you want to leave now?
      </Modal>
    </div>
  );
}
