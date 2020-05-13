import * as React from "react";
import autosize from "autosize";

import "./Textarea.css";

type TextareaProps = {
    handleChange: (ev: React.ChangeEvent<HTMLTextAreaElement>) => void
    value: string
    submit?: () => void
    handleFocus?: (ev: React.ChangeEvent<HTMLTextAreaElement>) => void
    header?: string
    placeholder?: string
};

/**
 * Note that this Textarea component is _fully controlled_, meaning
 * that we don't do any handling of the inserted data at this
 * level, and we expect that the parent takes care of it all
 */
function Textarea(props: TextareaProps) {
    const {
        handleChange, handleFocus, header, placeholder, submit, value
    } = props;

    const textareaRef = React.useRef(null);

    const submitOnEnter = (ev: KeyboardEvent) => {
        if (textareaRef.current && textareaRef.current === document.activeElement) {
            if (ev.key === "Enter" && !ev.shiftKey) {
                (textareaRef.current as any).blur();
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

    React.useLayoutEffect(() => {
        if (textareaRef.current) {
            autosize(textareaRef.current as any);
        }
    }, [textareaRef.current]);

    React.useEffect(() => {
        if (!value || value.length === 0) {
            autosize.update(textareaRef.current as any);
        }
    }, [value]);

    return (
        <div className="input textarea">
            {header && (
                <div className="input-header">
                    {header}
                </div>
            )}
            <textarea
                ref={textareaRef}
                onChange={handleChange}
                onFocus={handleFocus}
                placeholder={placeholder}
                value={value}
                rows={1}
            />
        </div>
    );
}

export default Textarea;
