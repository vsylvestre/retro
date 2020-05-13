import * as React from "react";
import { useTimer } from 'react-timer-hook';

type TimerProps = {
    shouldStart: boolean
}

const Timer = ({ shouldStart }: TimerProps) => {
    const time = new Date();
    const expiryTimestamp = time.setSeconds(time.getSeconds() + 480); // 10 minutes timer

    const { seconds, minutes, resume, pause } = useTimer({ expiryTimestamp });

    React.useEffect(() => {
        if (shouldStart) {
            resume();
        } else {
            pause();
        }
    }, [shouldStart]);

    return (
        <div style={{ fontSize: 14 }}>
            {`${minutes}:${seconds.toString().length === 1 ? `0${seconds}` : seconds}`}
        </div>
    );
}

export default Timer;
