import * as React from "react";
import { gql } from "apollo-boost";
import { useSubscription } from "@apollo/react-hooks";
import { Popover, PopoverTrigger, Portal } from "@chakra-ui/react";
import { Context } from "../Context";
import { CardReaction } from "./CardType";
import ColumnCardPopover from "./ColumnCardPopover";
import ColumnCardReactions from "./ColumnCardReactions";
import ColumnCardOptions from "./ColumnCardOptions";

import "./ColumnCard.css";

type CardProps = {
    id: string
    type: string
    userId?: string
    initialText?: string
    initialReactions?: CardReaction[]
};

const CARD_UPDATED_SUBSCRIPTION = gql`
    subscription onCardUpdated($id: String!) {
        cardUpdated(id: $id) {
            content
        }
    }
`;

export default function ColumnCard({ id, userId, type, initialReactions, initialText = '' }: CardProps) {
    // We get the current user ID from our context. We will use that
    // to blur cards that don't belong to the current user
    const { user, currentStep } = React.useContext(Context);
    const belongsToUser = React.useMemo(() => !userId || userId === user?.id, [userId, user]);

    // We also need the current step, in order to know whether
    // we're ready to reveal the cards to all users
    const blurred = currentStep < 2;

    // Everytime we get an update for this card in particular, we
    // will update this state. Note from the subscription that we're
    // sending the ID of the card as a variable; that is because we
    // will filter on the server to make sure that we're only notified
    // for updates on _this_ card
    const [text, setText] = React.useState(initialText);

    // We're using the popover in fully-controlled mode. This is to
    // better manage whether it should be open when the "options"
    // dropdown is also open.
    const [isPopoverOpen, setIsPopoverOpen] = React.useState<boolean | undefined>(undefined);
    const [isMenuOpen, setIsMenuOpen] = React.useState<boolean>(false);

    const onMenuOpen = () =>{
        setIsMenuOpen(true);
        setIsPopoverOpen(false);
    };

    const onMenuClose = () => {
        setIsMenuOpen(false);
        setIsPopoverOpen(false);
    };

    // Here we subscribe to updates on the card
    const { data } = useSubscription(CARD_UPDATED_SUBSCRIPTION, { variables: { id } });

    React.useEffect(() => {
        if (data) {
            setText(data.cardUpdated.content);
        }
    }, [data]);

    if (initialText.length === 0 && (!data || (data && !data.cardUpdated.content?.length))) {
        return null;
    }

    const shuffledText = belongsToUser
        ? text
        : (
            Array.from(text).map(char => (
                [' ', '.', '!'].includes(char) ? char : String.fromCharCode(char.charCodeAt(0) + 2)
            )).join('')
        );

    return (
        <Popover 
            isOpen={isPopoverOpen && !isMenuOpen && !blurred}
            placement="bottom" 
            trigger="hover" 
            gutter={-24} 
        >
            <div onMouseEnter={() => setIsPopoverOpen(true)} onMouseLeave={() => setIsPopoverOpen(false)}>
                <PopoverTrigger>
                    <div
                        key={id} 
                        className={`card${!belongsToUser && blurred ? ' blurry' : ''}`} 
                        style={{ width: "95%" }} 
                        tabIndex={0}
                    >
                        {blurred && !belongsToUser ? null : (
                            <ColumnCardOptions
                                cardId={id}
                                cardText={text}
                                belongsToUser={belongsToUser}
                                onOpen={onMenuOpen} 
                                onClose={onMenuClose} 
                            />
                        )}
                        <ColumnCardReactions cardId={id} initialReactions={initialReactions} />
                        <div className="tag">
                            {type}
                        </div>
                        <div style={{ paddingTop: 10, wordBreak: "break-word" }}>
                            {blurred ? shuffledText : text}
                        </div>
                    </div>
                </PopoverTrigger>
                <Portal>
                    <ColumnCardPopover cardId={id} />
                </Portal>
            </div>
        </Popover>
    );
}
