import * as React from "react";
import { useSubscription } from "@apollo/react-hooks";
import { gql } from "apollo-boost";
import Steps from "./Steps";
import RoomType from "./Room/RoomType";
import UserType from "./UserType";

type ContextType = {
    currentStep: Steps
    room: RoomType | null
    user: UserType | null
    showNotes: boolean | null
    setShowNotes: (value: boolean) => void
};

type ContextProviderProps = {
    room: RoomType | null
    user: UserType | null
};

const STEP_CHANGED_SUBSCRIPTION = gql`
    subscription {
        stepChanged {
            step
        }
    }
`;

const defaultContext: ContextType = {
    currentStep: 0,
    user: null,
    room: null,
    showNotes: null,
    setShowNotes: () => null
};

export const Context = React.createContext<ContextType>(defaultContext);

export default function ContextProvider({ room, user, children }: React.PropsWithChildren<ContextProviderProps>) {
    const { data: stepChangedEv } = useSubscription(STEP_CHANGED_SUBSCRIPTION);
    const currentStep = stepChangedEv?.stepChanged.step ?? room?.step ?? 0;

    const [showNotes, setShowNotes] = React.useState<boolean | null>(null);

    return (
        <Context.Provider value={{ currentStep, user, room, showNotes, setShowNotes }}>
            {children}
        </Context.Provider>
    );
}