import * as React from 'react';
import gql from 'graphql-tag';
import { Box, Flex } from '@chakra-ui/react';
import { useSubscription } from '@apollo/react-hooks';
import { Context } from '../Context';
import ColumnCardEmoji from './ColumnCardEmoji';
import { CardReaction } from './CardType';

export enum Reactions {
    LIKE = 'like',
    DISLIKE = 'dislike',
    LOVE = 'love',
    LAUGHING = 'laughing',
    SAD = 'sad'
}

type ReactionGroup = {
    key: string
    values: CardReaction[]
};

const REACTIONS_CHANGED = gql`
    subscription onReactionsChanged($id: String!) {
        reactionsChanged(cardId: $id) {
            reactions {
                userId
                type
            }
        }
    }
`; 

// This is responsible for taking the array of reactions
// obtained from the back end, and sorting them according
// to reaction. It will put everything in an array of objects,
// with each object having the reaction as its key, and all
// of the corresponding items as its value.
// Got that from StackOverflow, of course.
function groupByArray(xs: Array<any>, key: string) { 
    const reduced = xs.reduce(function (rv, x) { 
        let v = x[key];
        let el = rv.find((r: any) => r && r.key === v); 
        if (el) { 
            el.values.push(x); 
        } else { 
            rv.push({ key: v, values: [x] }); 
        } 
        return rv; 
    }, []);
    return reduced;
}

type ColumnCardReactionsProps = {
    cardId: string
    initialReactions?: CardReaction[]
}

export default function ColumnCardReactions({ cardId, initialReactions = [] }: ColumnCardReactionsProps) {
    // Here, we'll use the context to determine which of the
    // reactions is attributed to the current user. We'll highlight
    // the little number beside the emoji accordingly.
    const { user } = React.useContext(Context);

    const { data: reactionData } = useSubscription(REACTIONS_CHANGED, { variables: { id: cardId } });

    return (
        <Flex className="reactions">
            {groupByArray(reactionData?.reactionsChanged?.reactions as Array<any> || initialReactions, 'type')
                .sort((a: ReactionGroup, b: ReactionGroup) => b.values.length - a.values.length) // Sort by "most reactions"
                .map((reactionGroup: ReactionGroup) => {
                    const { key, values } = reactionGroup;
                    const hasCurrentUser = values.map((value: CardReaction) => value.userId).includes(user?.id || '')
                    return (
                        <Flex key={key} paddingRight={6} alignItems="center">
                            <Box
                                color={!hasCurrentUser ? "hsla(0, 0%, 100%, 0.42)" : undefined}
                                paddingTop={2} 
                                fontSize={12}
                                fontWeight={hasCurrentUser ? 600 : 400}
                            >
                                {values.length}
                            </Box>
                            <ColumnCardEmoji cardId={cardId} label={key} />
                        </Flex>
                    );
                })}
        </Flex>
    );
}
