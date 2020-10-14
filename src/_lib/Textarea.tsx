import * as React from "react";
import autosize from "autosize";

import "./Textarea.css";
import { subscribe } from "graphql";

type TextareaProps = {
    handleChange: (ev: React.ChangeEvent<HTMLTextAreaElement>) => void
    value: string
    submit?: () => void
    submitOnEnter?: boolean
    handleBlur?: (ev: React.FocusEvent<HTMLTextAreaElement>) => void
    handleFocus?: (ev: React.FocusEvent<HTMLTextAreaElement>) => void
    hasFocus?: boolean
    header?: string
    placeholder?: string
};

/**
 * Note that this Textarea component is _fully controlled_, meaning
 * that we don't do any handling of the inserted data at this
 * level, and we expect that the parent takes care of it all
 */
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>((props: TextareaProps, ref) => {
    const {
        handleBlur, handleChange, handleFocus, header, placeholder, submit, submitOnEnter = true, value
    } = props;

    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

    React.useEffect(() => {
        if (typeof ref === "function") {
            ref(textareaRef.current);
        } else if (ref) {
            ref.current = textareaRef.current;
        }
    }, [textareaRef]);

    const submitOrEscape = (ev: KeyboardEvent) => {
        if (textareaRef.current && textareaRef.current === document.activeElement) {
            if (ev.key === "Enter" && !ev.shiftKey && submitOnEnter) {
                textareaRef.current.blur();
                submit && submit();
            }
            if (ev.key === "Escape" || ev.key === "Esc") {
                textareaRef.current.blur();
            }
        }
    };

    React.useEffect(() => {
        document.addEventListener('keydown', submitOrEscape);
        return () => {
            document.removeEventListener('keydown', submitOrEscape);
        };
    });

    React.useLayoutEffect(() => {
        if (textareaRef.current) {
            autosize(textareaRef.current as any);
        }
    }, []);

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
                onBlur={handleBlur}
                onFocus={handleFocus}
                placeholder={placeholder}
                value={value}
                rows={1}
            />
        </div>
    );
});

export default Textarea;
