import * as React from "react";
import { Modal as ChakraModal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter } from "@chakra-ui/core";
import { UseDisclosureReturn } from "@chakra-ui/core/dist/useDisclosure";
import Button from "./Button";

import "./Modal.css";

type ModalProps = {
    header: string
    handleSubmit: () => void
    disclosure: UseDisclosureReturn
};

export default function Modal(props: React.PropsWithChildren<ModalProps>) {
    const {
        header, children, handleSubmit, disclosure
    } = props;

    const { isOpen, onClose } = disclosure;

    return (
        <ChakraModal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay />
            <ModalContent className="modal" borderRadius={8}>
                <ModalHeader>
                    {header}
                </ModalHeader>
                <ModalCloseButton
                    border="none"
                    background="transparent"
                    color="var(--accent-color)"
                />
                <ModalBody>
                    {children}
                </ModalBody>
                <ModalFooter>
                    <Button handleClick={() => handleSubmit()}>
                        Yes
                    </Button>
                </ModalFooter>
            </ModalContent>
        </ChakraModal>
    )
}
