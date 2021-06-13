type CardType = {
    id: string
    content?: string
    userId?: string
    type?: string
    reactions?: CardReaction[]
};

export type CardReaction = {
    type: string
    userId: string
};

export default CardType;