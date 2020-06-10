import * as React from "react";
import { useSubscription, useLazyQuery } from "@apollo/react-hooks";
import { gql } from "apollo-boost";
import Steps from "./Steps";

type ContextType = {
    currentStep: Steps
    room: string | null
};

type ContextProviderProps = {
    hasUser: boolean
    room: string | null
};

const GET_STEP = gql`
    query {
        step
    }
`;

const STEP_CHANGED_SUBSCRIPTION = gql`
    subscription {
        stepChanged {
            step
        }
    }
`;

export const Context = React.createContext<ContextType>({ currentStep: 0, room: null });

export default function ContextProvider({ hasUser, room, children }: React.PropsWithChildren<ContextProviderProps>) {
    const [getStep, { data: getStepResult }] = useLazyQuery(GET_STEP);

    const { data: stepChangedEv } = useSubscription(STEP_CHANGED_SUBSCRIPTION);
    const currentStep = stepChangedEv?.stepChanged.step ?? getStepResult?.step ?? 0;

    React.useEffect(() => {
        if (hasUser) {
            getStep();
        }
    }, [hasUser, getStep]);

    React.useEffect(() => {
        if (room) {
            localStorage.setItem("roomId", room);
            window.history.pushState(null, "", `/${room}`);
        }
    }, [room]);

    return (
        <Context.Provider value={{ currentStep, room }}>
            {children}
        </Context.Provider>
    );
}