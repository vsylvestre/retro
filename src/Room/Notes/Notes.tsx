import * as React from "react";
import { gql } from "apollo-boost";
import { Context } from "../../Context";
import { UserRole } from "../../UserType";
import { useSubscription } from "@apollo/react-hooks";
import useCardMutations from "../useCardMutations";
import useCardsList from "../useCardsList";
import Card from "../../_lib/Card";
import Textarea from "../../_lib/Textarea";
import Steps from "../../Steps";

import "./Notes.css";

const NOTE_UPDATED_SUBSCRIPTION = gql`
    subscription onCardUpdated($id: String!) {
        cardUpdated(id: $id) {
            content
        }
    }
`;

export default function Notes() {
    const { currentStep, user, room, showNotes, setShowNotes } = React.useContext(Context);

    const [note, setNote] = React.useState<string | null>(null);

    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

    // This hook is used for all operations that relate to
    // the creation (and edition) of a new note. As soon
    // as the ADMIN starts typing in the "Notes" area, this
    // will generate a new card of type NOTE.
    const {
        newCard: newNote, createCard: createNote, editCard: editNote
    } = useCardMutations("NOTE");

    // Here, we fetch the notes for the PARTICIPANT users,
    // because they will not get the updates through the
    // card mutations, as only the ADMIN can write notes.
    // Once again, it uses the same logic as cards.
    const { cards: notes, loading } = useCardsList("NOTE");

    React.useEffect(() => {
        if (notes?.length) {
            setNote(notes[0].content ?? null);
        }
    }, [notes]);

    // Finally, we subscribe to updates to the notes. This
    // way, all participants will receive real-time updates
    // as the ADMIN types.
    const { data: cardUpdatedData } = useSubscription(NOTE_UPDATED_SUBSCRIPTION, { variables: { id: notes?.[0]?.id }, skip: !notes });

    React.useEffect(() => {
        if (cardUpdatedData?.cardUpdated) {
            // If this is the first note update, we'll open
            // the Notes section for all users to see.
            if (!note && !showNotes) {
                setShowNotes(true);
            }
            setNote(cardUpdatedData.cardUpdated.content);
        }
    }, [cardUpdatedData]);

    const handleChange = (ev: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { value } = ev.target;
        if (value.includes("*")) {
            // If we find a * character, we modify some instances
            // into bullet points, just like in markdown.
            editNote(value.split(/^[*][\s]/).join("• ").split(/[\n][*][\s]/).join("\n• "));
        } else {
            editNote(value);
        }
    };

    if (currentStep === Steps.WAIT) {
        return null;
    }

    return (
        <div className={`column notes ${showNotes ? "" : "hide"} ${showNotes === null ? "stale" : ""}`.trim()}>
            <Card lessPadding width="90%">
                <div className="card-title">
                    Notes
                </div>
                {user?.role === UserRole.ADMIN && (
                    <>
                        <Textarea
                            ref={textareaRef}
                            value={newNote?.content ?? ""}
                            handleChange={handleChange}
                            handleFocus={createNote}
                        />
                        {!newNote && (
                            <span style={{ color: "hsl(0, 0%, 82%, 52%)", fontSize: "13px" }}>
                                Only you can enter notes, but all participants will be
                                able to see what you type.
                            </span>
                        )}
                    </>
                )}
                {user?.role === UserRole.PARTICIPANT && (
                    loading || !notes ? null : (
                        note?.length
                            ? (
                                <span style={{ whiteSpace: "pre-line" }}>
                                    {note}
                                </span>
                            ) : (
                                <span style={{ color: "hsl(0, 0%, 82%, 62%)", fontSize: "15px" }}>
                                    {room?.done
                                        ? "No notes were taken during this session."
                                        : "There are no notes for now. This section will display notes as soon as the moderator starts typing."}
                                </span>
                            )
                    )
                )}
            </Card>
        </div>
    );
}
