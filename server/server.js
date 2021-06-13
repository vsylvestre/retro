const { ApolloServer, gql, PubSub, withFilter } = require("apollo-server-express");
const { ObjectId } = require("mongodb");

function startApollo(db) {
    const pubsub = new PubSub();

    const USER_JOINED = "USER_JOINED";
    const USER_LEFT = "USER_LEFT";
    const CARD_ADDED = "CARD_ADDED";
    const CARD_UPDATED = "CARD_UPDATED";
    const CARD_DELETED = "CARD_DELETED";
    const REACTIONS_CHANGED = "REACTIONS_CHANGED";
    const STEP_CHANGED = "STEP_CHANGED";

    const typeDefs = gql`
        type Query {
            room(id: String!): Room
            users: [User]
            cards: [Card]
        }

        type Mutation {
            createRoom: Room
            login(username: String!): User
            addCard(type: String!): Card
            updateCard(id: String!, content: String!): Card
            deleteCard(id: String!): String
            react(cardId: String!, type: String!): Boolean
            switchSteps: Boolean
            leaveRoom: Boolean
            clearRoom: Boolean
        }

        type Subscription {
            userJoined: User
            userLeft: User
            cardAdded(userId: String!, type: String!): Card
            cardUpdated(id: String!): Card
            cardDeleted(type: String!): Card
            reactionsChanged(cardId: String!): PartialCard
            stepChanged: Room
        }

        type User {
            id: String!
            name: String!
            roomId: String!
            role: String
        }

        type Room {
            id: String!
            createdAt: String!
            step: Int
            hasAdmin: Boolean
            done: Boolean
        }

        type Reaction {
            userId: String!
            type: String!
        }

        type Card {
            id: String!
            type: String!
            roomId: String!
            userId: String
            content: String
            reactions: [Reaction]
        }

        type PartialCard {
            id: String!
            reactions: [Reaction]
        }
    `;

    const resolvers = {
        Subscription: {
            userJoined: {
                subscribe: withFilter(
                    () => pubsub.asyncIterator([USER_JOINED]),
                    (payload, _, context) => payload.userJoined.roomId == context.roomId
                )
            },
            userLeft: {
                subscribe: withFilter(
                    () => pubsub.asyncIterator([USER_LEFT]),
                    (payload, _, context) => payload.userLeft.roomId == context.roomId
                )
            },
            cardAdded: {
                subscribe: withFilter(
                    () => pubsub.asyncIterator([CARD_ADDED]),
                    (payload, variables, context) => {
                        const { roomId, type, userId } = payload.cardAdded;
                        return type === variables.type && roomId == context.roomId && userId !== variables.userId;
                    }
                )
            },
            cardUpdated: {
                subscribe: withFilter(
                    () => pubsub.asyncIterator([CARD_UPDATED]),
                    (payload, variables) => payload.cardUpdated.id === variables.id
                )
            },
            cardDeleted: {
                subscribe: withFilter(
                    () => pubsub.asyncIterator([CARD_DELETED]),
                    (payload, variables, context) => {
                        const { roomId, type } = payload.cardDeleted;
                        return type === variables.type && roomId == context.roomId;
                    }
                )
            },
            reactionsChanged: {
                subscribe: withFilter(
                    () => pubsub.asyncIterator([REACTIONS_CHANGED]),
                    (payload, variables) => payload.reactionsChanged.id === variables.cardId
                )
            },
            stepChanged: {
                subscribe: withFilter(
                    () => pubsub.asyncIterator([STEP_CHANGED]),
                    (payload, _, context) => {
                        // Here, stepChanged.id refers to the room's ID
                        return payload.stepChanged.id == context.roomId;
                    }
                )
            }
        },
        Query: {
            room: async (_, args) => {
                try {
                    const roomId = ObjectId(args.id);
                    return await db.collection("rooms").findOne({ id: roomId });
                } catch {
                    return null;
                }
            },
            users: async (_, args, context) => await db.collection("users").find({ roomId: context.roomId }).toArray(),
            cards: async (_, args, context) => await db.collection("cards").find({ roomId: context.roomId }).toArray(),
        },
        Mutation: {
            createRoom: async () => {
                const room = {
                    id: ObjectId(),
                    step: 0,
                    createdAt: new Date(),
                    done: false
                };
                const { result } = await db.collection("rooms").insertOne(room);
                if (!result.ok) {
                    return new Error("Couldn't create a new room");
                }
                return room;
            },
            login: async (_, args, context) => {
                // First, we find the room that the user is joining in.
                // At this point, the room verification process should
                // already be done - but we still send back an error just
                // in case
                const findRoomRes = await db.collection("rooms").findOne({ id: ObjectId(context.roomId) });
                if (!findRoomRes) {
                    return new Error("Couldn't find the room");
                }
                // Then, we insert the user into the DB. If they're
                // the first user to join the room, we set the room as
                // having an administrator, and we assign the ADMIN
                // room to that user
                const user = {
                    id: ObjectId(),
                    name: args.username,
                    roomId: context.roomId,
                    role: findRoomRes.hasAdmin ? "PARTICIPANT" : "ADMIN",
                    createdAt: new Date()
                };
                if (!findRoomRes.hasAdmin) {
                    await db.collection("rooms").findOneAndUpdate({ id: ObjectId(context.roomId) }, { $set: { hasAdmin: true } })
                }
                const { result: insertUserRes } = await db.collection("users").insertOne(user);
                if (!insertUserRes.ok) {
                    return new Error("Couldn't create new user");
                }
                // We publish a USER_JOINED event so that other users that
                // are already in the room can be notified
                await pubsub.publish(USER_JOINED, { userJoined: user });
                return user;
            },
            addCard: async (_, args, context) => {
                const card = {
                    id: ObjectId(),
                    type: args.type,
                    roomId: context.roomId,
                    userId: context.userId,
                    createdAt: new Date(),
                    reactions: [],
                };
                const { result, ops } = await db.collection("cards").insertOne(card);
                if (!result.ok) {
                    return new Error("Couldn't create the card");
                }
                // We publish a CARD_ADDED event so that other users see
                // the card appear on their side
                await pubsub.publish(CARD_ADDED, { cardAdded: card });
                return card;
            },
            updateCard: async (_, args) => {
                const result = await db.collection("cards").findOneAndUpdate({ id: ObjectId(args.id) }, { $set: { content: args.content } }, { returnNewDocument: true });
                if (!result.ok) {
                    return new Error("Couldn't update the card");
                }
                const card = {
                    id: args.id,
                    type: result.value.type,
                    userId: result.value.userId,
                    roomId: result.value.roomId,
                    content: args.content,
                    reactions: result.value.reactions,
                };
                // We publish a CARD_UPDATED event so that other users see
                // the card be updated on their side
                await pubsub.publish(CARD_UPDATED, { cardUpdated: card });
                return card;
            },
            deleteCard: async (_, args) => {
                const card = await db.collection("cards").findOne({ id: ObjectId(args.id) });
                const { result, ops } = await db.collection("cards").deleteOne({ id: ObjectId(args.id) });
                if (!result.ok) {
                    return new Error("Couldn't delete the card");
                }
                // We publish a CARD_DELETED event so that other users see
                // the card disappear on their side
                await pubsub.publish(CARD_DELETED, { cardDeleted: card });
                return args.id;
            },
            react: async (_, args, context) => {
                const currentCard = await db.collection("cards").findOne({ id: ObjectId(args.cardId) });
                const userHasReaction = currentCard.reactions.find(reaction => reaction.userId === context.userId);
                const removeReaction = userHasReaction && userHasReaction.type === args.type;
                const reactions = [
                    ...currentCard.reactions.filter(reaction => reaction.userId !== context.userId), 
                    !removeReaction && { userId: context.userId, type: args.type }
                ].filter(Boolean);
                const result = await db.collection("cards").findOneAndUpdate({ id: ObjectId(args.cardId) }, { $set: { reactions } }, { returnNewDocument: true });
                if (!result.ok) {
                    return new Error("Couldn't react");
                }
                const card = {
                    id: result.value.id.toString(),
                    reactions,
                };
                await pubsub.publish(REACTIONS_CHANGED, { reactionsChanged: card });
                return true;
            },
            switchSteps: async (_, args, context) => {
                const result = await db.collection("rooms").findOneAndUpdate({ id: ObjectId(context.roomId) }, { $inc: { step: 1 }});
                if (!result.ok) {
                    return new Error("Couldn't increment step value");
                }
                const updatedRoom = result.value;
                // We publish a STEP_CHANGED event so that all users have
                // their screen updated with the new step
                await pubsub.publish(STEP_CHANGED, { stepChanged: { ...updatedRoom, step: updatedRoom.step + 1 } });
                return true;
            },
            leaveRoom: async (_, args, context) => {
                const user = await db.collection("users").findOne({ id: ObjectId(context.userId) });
                if (user.role === "ADMIN") {
                    await db.collection("rooms").findOneAndUpdate({ id: ObjectId(user.roomId) }, { $set: { done: true } });
                }
                await db.collection("users").deleteOne({ id: ObjectId(context.userId) });
                await pubsub.publish(USER_LEFT, { userLeft: user });
                return true;
            }
        }
    };

    return new ApolloServer({
        typeDefs,
        resolvers,
        context: ({ req, connection }) => {
            if (connection) {
                const { room: roomId, user: userId } = connection.context;
                return { roomId, userId };
            }
            return {
                userId: req.headers.user,
                roomId: req.headers.room
            };
        },
        introspection: true,
        playground: true
    });
}

module.exports = { startApollo };