import * as React from "react";
import { useSubscription, useLazyQuery } from "@apollo/react-hooks";
import { gql } from "apollo-boost";
import Steps from "./Steps";

type ContextType = {
    currentStep: Steps
}

const GET_STEP = gql`
    query {
        step
    }
`;

const STEP_CHANGED_SUBSCRIPTION = gql`
    subscription {
        stepChanged
    }
`;

export const Context = React.createContext<ContextType>({ currentStep: 0 });

export default function ContextProvider({ hasUser, children }: React.PropsWithChildren<{ hasUser: boolean }>) {
    const [getStep, { data: getStepResult }] = useLazyQuery(GET_STEP);

    const { data: stepChangedEv } = useSubscription(STEP_CHANGED_SUBSCRIPTION);
    const currentStep = stepChangedEv?.stepChanged ?? getStepResult?.step ?? 0;

    React.useEffect(() => {
        if (hasUser) {
            getStep();
        }
    }, [hasUser, getStep]);

    return (
        <Context.Provider value={{ currentStep }}>
            {children}
        </Context.Provider>
    );
}