import * as React from "react";
import Icon from "../_lib/Icon";
import {
    Popover, PopoverTrigger, PopoverContent, PopoverArrow, PopoverCloseButton, PopoverHeader, PopoverBody, useClipboard
} from "@chakra-ui/core";
import Button, { ButtonType } from "../_lib/Button";
import Tooltip from "../_lib/Tooltip";

export default function ShareLink() {
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const { onCopy, hasCopied } = useClipboard(window.location);

    React.useEffect(() => {
        if (hasCopied && inputRef.current) {
            inputRef.current.select();
        }
    }, [hasCopied]);

    return (
        <Popover placement="top-end">
            <PopoverTrigger>
                <div className="button circle large">
                    <Tooltip label="Share">
                        <button onClick={onCopy}>
                            <Icon name="link" size={17} />
                        </button>
                    </Tooltip>
                </div>
            </PopoverTrigger>
            <PopoverContent
                width="auto"
                maxWidth="none"
                backgroundColor="var(--secondary-color)"
                boxShadow="var(--default-box-shadow)"
                padding="8px"
            >
                <PopoverArrow />
                <PopoverCloseButton
                    border="none"
                    background="transparent"
                    color="var(--accent-color)"
                />
                <PopoverHeader fontSize={13}>
                    <div style={{ paddingRight: 30 }}>
                        The link to the room was copied to your clipboard.
                    </div>
                </PopoverHeader>
                <PopoverBody paddingTop={0}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <div className="input" style={{ padding: 0 }}>
                            <input
                                ref={inputRef}
                                value={window.location.toString()}
                                style={{ fontSize: 13, color: 'hsla(0, 0%, 100%, 0.5)' }}
                                readOnly
                            />
                        </div>
                        <Button type={ButtonType.Circular} tooltip="Copy to clipboard" handleClick={() => onCopy && onCopy()}>
                            <Icon name="clipboard" size={14} />
                        </Button>
                    </div>
                </PopoverBody>
            </PopoverContent>
        </Popover>
    );
};
