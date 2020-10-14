import * as React from "react";
import moment from "moment";
import { useTimer } from "react-timer-hook";
import { Context } from "../Context";

type TimerProps = {
    shouldStart: boolean
    over: boolean
};

// Here, we display a timer during the REVEAL step
// of a meeting, _or_ the time before the room expires
// if the meeting is already over
const Timer = ({ shouldStart, over }: TimerProps) => {
    const time = new Date();
    const expiryTimestamp = time.setSeconds(time.getSeconds() + 480); // 8-minute timer

    const { seconds, minutes, resume, pause } = useTimer({ expiryTimestamp });

    const { room } = React.useContext(Context);

    React.useEffect(() => {
        if (shouldStart) {
            resume();
        } else {
            pause();
        }
    }, [shouldStart, pause, resume]);

    if (!room) {
        return null;
    }

    if (!room.done) {
        return (
            <div style={{ fontSize: 14}}>
                {over
                    ? "0:00"
                    : `${minutes < 0 ? 0 : minutes}:${seconds < 0 ? "00" : (seconds.toString().length === 1 ? `0${seconds}` : seconds)}`
                }
            </div>
        );
    }

    const daysBeforeExpiry = moment(room.createdAt, "x").add(7, "d").diff(moment(time), "days");
    const expiryText = daysBeforeExpiry === 0 ? 'less than a day' : `${daysBeforeExpiry} day${daysBeforeExpiry === 1 ? '' : 's'}`;

    return (
        <div style={{ fontSize: 14 }}>
            <span>The room expires in <b>{expiryText}</b></span>
        </div>
    );
}

export default Timer;
