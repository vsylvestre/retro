import * as React from "react";

import "./Input.css";

type InputProps = {
    handleChange: (ev: React.ChangeEvent<HTMLInputElement>) => void
    value: string
    submit?: () => void
    handleFocus?: (ev: React.ChangeEvent<HTMLInputElement>) => void
    header?: string
    placeholder?: string
};

/**
 * Note that this Input component is _fully controlled_, meaning
 * that we don't do any handling of the inserted data at this
 * level, and we expect that the parent takes care of it all
 */
function Input(props: InputProps) {
    const {
        handleChange, handleFocus, header, placeholder, submit, value
    } = props;

    const inputRef = React.useRef(null);

    const submitOnEnter = (ev: KeyboardEvent) => {
        if (inputRef.current && inputRef.current === document.activeElement) {
            if (ev.key === "Enter" && !ev.shiftKey) {
                (inputRef.current as any).blur();
                submit && submit();
            }
        }
    };

    React.useEffect(() => {
        document.addEventListener('keydown', submitOnEnter);
        return () => {
            document.removeEventListener('keydown', submitOnEnter);
        };
    });

    return (
        <div className="input">
            {header && (
                <div className="input-header">
                    {header}
                </div>
            )}
            <input
                ref={inputRef}
                onChange={handleChange}
                onFocus={handleFocus}
                placeholder={placeholder}
                value={value}
            />
        </div>
    );
}

export default Input;
