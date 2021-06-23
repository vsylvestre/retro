import * as React from "react";
import { Tooltip as ChakraTooltip } from "@chakra-ui/react";

type TooltipProps = {
    children: React.ReactNode
    label: string
    placement?: "top" | "left" | "right" | "bottom"
};

const Tooltip = ({ children, label, placement = "top" }: TooltipProps) => (
    <ChakraTooltip
        label={label}
        aria-label={label}
        placement={placement}
        backgroundColor="black"
        borderRadius="4px"
        fontSize="13px"
        color="var(--text-default-color)"
        padding="4px 8px"
    >
        {children}
    </ChakraTooltip>
);

export default Tooltip;
