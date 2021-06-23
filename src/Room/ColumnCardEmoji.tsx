import * as React from 'react';
import gql from 'graphql-tag';
import { Box } from '@chakra-ui/react';
import { useMutation } from '@apollo/react-hooks';
import { Reactions } from './ColumnCardReactions';
import Emoji from '../_lib/Emoji';

const REACT_MUTATION = gql`
    mutation React($cardId: String!, $type: String!) {
        react(cardId: $cardId, type: $type)
    }
`;

const getEmoji = (type: string) => {
    switch (type.toLowerCase()) {
        case Reactions.SAD:
            return '😢';
        case Reactions.LAUGHING:
            return '😂';
        case Reactions.LOVE:
            return '💖';
        case Reactions.DISLIKE:
            return '👎';
        case Reactions.LIKE:
            return '👍';
    }
};

type ColumnCardEmojiProps = {
    cardId: string
    label: string
};

export default function ColumnCardEmoji({ cardId, label }: ColumnCardEmojiProps) {
    const [react] = useMutation(REACT_MUTATION);

    return (
        <Box
            as="button"
            backgroundColor="transparent"
            border="none"
            cursor="pointer"
            paddingX={2}
            fontSize={15}
            _hover={{
                transform: 'scale(1.2)'
            }}
            onClick={() => react({ variables: { cardId, type: label } })}
        >
            <Emoji symbol={getEmoji(label) || '👍'} label={label} />
        </Box>
    );
}
