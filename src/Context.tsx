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

export const Context = React.createContext<ContextType>({ currentStep: 0, user: null, room: null });

export default function ContextProvider({ room, user, children }: React.PropsWithChildren<ContextProviderProps>) {
    const { data: stepChangedEv } = useSubscription(STEP_CHANGED_SUBSCRIPTION);
    const currentStep = stepChangedEv?.stepChanged.step ?? room?.step ?? 0;

    return (
        <Context.Provider value={{ currentStep, user, room }}>
            {children}
        </Context.Provider>
    );
}