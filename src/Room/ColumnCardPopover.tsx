import * as React from 'react';
import { PopoverContent, PopoverBody, Flex } from '@chakra-ui/react';
import ColumnCardEmoji from './ColumnCardEmoji';
import { Reactions } from './ColumnCardReactions';

const ColumnCardPopover = ({ cardId }: { cardId: string }) => (
    <PopoverContent
        width="auto"
        maxWidth="none"
        backgroundColor="var(--secondary-color)"
        boxShadow="var(--default-box-shadow)"
        padding="8px 16px"
        borderRadius={8}
    >
        <PopoverBody>
            <Flex style={{ alignItems: "center", justifyContent: "center" }}>
                {Object.keys(Reactions).map(reaction => (
                    <ColumnCardEmoji key={reaction} cardId={cardId} label={reaction} />
                ))}
            </Flex>
        </PopoverBody>
    </PopoverContent>
);

export default ColumnCardPopover;
