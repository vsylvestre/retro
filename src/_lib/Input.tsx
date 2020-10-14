import * as React from "react";

import "./Input.css";

type InputProps = {
    handleChange: (ev: React.ChangeEvent<HTMLInputElement>) => void
    value: string
    submit?: () => void
    submitOnEnter?: boolean
    handleFocus?: (ev: React.ChangeEvent<HTMLInputElement>) => void
    header?: string
    placeholder?: string
    readonly?: boolean
};

const defaultProps = {
    readonly: false
};

/**
 * Note that this Input component is _fully controlled_, meaning
 * that we don't do any handling of the inserted data at this
 * level, and we expect that the parent takes care of it all
 */
function Input(props: InputProps) {
    const {
        handleChange, handleFocus, header, placeholder, readonly, submit, submitOnEnter = true, value
    } = props;

    const inputRef = React.useRef<HTMLInputElement | null>(null);

    const submitOrEscape = (ev: KeyboardEvent) => {
        if (inputRef.current && inputRef.current === document.activeElement) {
            if (ev.key === "Enter" && !ev.shiftKey && submitOnEnter) {
                inputRef.current.blur();
                submit && submit();
            }
            if (ev.key === "Escape" || ev.key === "Esc") {
                inputRef.current.blur();
            }
        }
    };

    React.useEffect(() => {
        document.addEventListener('keydown', submitOrEscape);
        return () => {
            document.removeEventListener('keydown', submitOrEscape);
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
                readOnly={readonly}
            />
        </div>
    );
}

Input.defaultProps = defaultProps;

export default Input;
