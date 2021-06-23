import * as React from 'react';
import gql from 'graphql-tag';
import { useMutation } from '@apollo/react-hooks';
import { 
    Menu, 
    MenuButton,
    MenuItem,
    MenuList,
    Portal,
    useClipboard,
} from "@chakra-ui/react";
import Icon from '../_lib/Icon';

const DELETE_CARD_MUTATION = gql`
    mutation DeleteCard($id: String!) {
        deleteCard(id: $id)
    }
`;

type ColumnCardOptionsProps = {
    cardId: string
    cardText: string
    belongsToUser: boolean
    onOpen: () => void
    onClose: () => void
};

export default function ColumnCardOptions(props: ColumnCardOptionsProps) {
    const {
        cardId,
        cardText,
        belongsToUser,
        onOpen,
        onClose,
    } = props;

    const [deleteCard] = useMutation(DELETE_CARD_MUTATION, { variables: { id: cardId } });

    const { onCopy } = useClipboard(cardText);

    const items = React.useMemo(() => [
        {
            name: 'Copy text',
            action: () => onCopy(),
        },
        {
            name: 'Delete',
            action: () => deleteCard(),
            enabled: belongsToUser
        },
    ], [deleteCard, onCopy]);

    return (
        <Menu isLazy placement="right-start" onOpen={onOpen} onClose={onClose} autoSelect={false}>
            <div className="card-options">
                <MenuButton style={{ backgroundColor: 'transparent', border: 'none' }}>
                    <Icon name="more-horizontal" />
                </MenuButton>
            </div>
            <Portal>
                <MenuList
                    onMouseEnter={e => e.stopPropagation()}
                    minWidth={200} 
                    backgroundColor="var(--tertiary-color)"
                    boxShadow="var(--default-box-shadow)"
                    borderRadius={8}
                    padding={4}
                    style={{
                        outline: 'none'
                    }}
                >
                    {items.map((item) => {
                        if (item.enabled === false) {
                            return null;
                        }
                        return (
                            <MenuItem 
                                onClick={() => item.action()}
                                border="none"
                                padding="8px 12px"
                                borderRadius={4}
                                fontFamily="Inter"
                                fontSize={14}
                                backgroundColor="var(--tertiary-color)"
                                cursor="pointer"
                                style={{
                                    outline: 'none'
                                }}
                                _hover={{
                                    backgroundColor: 'var(--secondary-color)'
                                }}
                            >
                                {item.name}
                            </MenuItem>
                        )
                    })}
                </MenuList>
            </Portal>
        </Menu>
    );
}
