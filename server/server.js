const { ApolloServer, gql, PubSub, withFilter } = require("apollo-server-express");
const { ObjectId } = require("mongodb");

function startApollo(db) {
    const pubsub = new PubSub();

    const USER_JOINED = "USER_JOINED";
    const USER_LEFT = "USER_LEFT";
    const CARD_ADDED = "CARD_ADDED";
    const CARD_UPDATED = "CARD_UPDATED";
    const CARD_DELETED = "CARD_DELETED";
    const STEP_CHANGED = "STEP_CHANGED";

    const typeDefs = gql`
        type Query {
            users: [User]
            cards: [Card]
            step: Int
        }

        type Mutation {
            login(username: String!): User
            addCard(type: String!): Card
            updateCard(id: String!, content: String!): Card
            deleteCard(id: String!): String
            switchSteps: Boolean
            leaveRoom: Boolean
            clearRoom: Boolean
        }

        type Subscription {
            userJoined: String
            userLeft: String
            cardAdded(userId: String!, type: String!): Card
            cardUpdated(type: String!, id: String!): Card
            cardDeleted(type: String!): Card
            stepChanged: Int
        }

        type User {
            id: String!
            name: String!
            role: String
        }

        type Room {
            id: String!
            step: Int
        }

        type Card {
            id: String!
            type: String!
            userId: String
            content: String
        }
    `;

    const resolvers = {
        Subscription: {
            userJoined: {
                subscribe: () => pubsub.asyncIterator([USER_JOINED])
            },
            userLeft : {
                subscribe: () => pubsub.asyncIterator([USER_LEFT])
            },
            cardAdded: {
                subscribe: withFilter(
                    () => pubsub.asyncIterator([CARD_ADDED]),
                    (payload, variables) => {
                        const { type, userId } = payload.cardAdded;
                        return type === variables.type && userId !== variables.userId;
                    }
                )
            },
            cardUpdated: {
                subscribe: withFilter(
                    () => pubsub.asyncIterator([CARD_UPDATED]),
                    (payload, variables) => {
                        const { type, id } = payload.cardUpdated;
                        return type === variables.type && id === variables.id;
                    }
                )
            },
            cardDeleted: {
                subscribe: withFilter(
                    () => pubsub.asyncIterator([CARD_DELETED]),
                    (payload, variables) => payload.cardDeleted.type === variables.type
                )
            },
            stepChanged: {
                subscribe: () => pubsub.asyncIterator([STEP_CHANGED])
            }
        },
        Query: {
            users: async () => await db.collection("users").find({}).toArray(),
            cards: async () => await db.collection("cards").find({}).toArray(),
            step: async () => (await db.collection("rooms").findOne({})).step
        },
        Mutation: {
            login: async (_, args) => {
                // First, if it's the first user that's logging into
                // the app, we create the new room
                const findRoomRes = await db.collection("rooms").findOne({});
                if (!findRoomRes) {
                    const room = { id: ObjectId(), step: 0 };
                    const { result: insertRoomRes } = await db.collection("rooms").insertOne(room);
                    if (!insertRoomRes) {
                        return new Error("Couldn't create a new room");
                    }
                }
                // Then, we insert the user into the DB
                const user = { id: ObjectId(), name: args.username, role: findRoomRes ? "PARTICIPANT" : "ADMIN" };
                const { result: insertUserRes } = await db.collection("users").insertOne(user);
                if (!insertUserRes.ok) {
                    return new Error("Couldn't join the room");
                }
                // We publish a USER_JOINED event so that other users that
                // are already in the room can be notified
                await pubsub.publish(USER_JOINED, { userJoined: user.name });
                return user;
            },
            addCard: async (_, args, context) => {
                const card = { id: ObjectId(), type: args.type, userId: context.userId };
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
                    content: args.content
                };
                // We publish a CARD_UPDATED event so that other users see
                // the card be updated on their side
                await pubsub.publish(CARD_UPDATED, { cardUpdated: card });
                return card;
            },
            deleteCard: async (_, args) => {
                const card = await db.collection("cards").findOne( { id: ObjectId(args.id )});
                const { result, ops } = await db.collection("cards").deleteOne({ id: ObjectId(args.id) });
                if (!result.ok) {
                    return new Error("Couldn't delete the card");
                }
                // We publish a CARD_DELETED event so that other users see
                // the card disappear on their side
                await pubsub.publish(CARD_DELETED, { cardDeleted: card });
                return args.id;
            },
            switchSteps: async () => {
                const result = await db.collection("rooms").findOneAndUpdate({}, { $inc: { step: 1 }});
                if (!result.ok) {
                    return new Error("Couldn't increment step value");
                }
                // We publish a STEP_CHANGED event so that all users have
                // their screen updated with the new step
                await pubsub.publish(STEP_CHANGED, { stepChanged: result.value.step + 1 });
                return true;
            },
            leaveRoom: async (_, args, context) => {
                const user = await db.collection("users").findOne({ id: ObjectId(context.userId) });
                if (user.role === "ADMIN") {
                    await db.collection("users").deleteMany({});
                    await db.collection("cards").deleteMany({});
                    await db.collection("rooms").deleteMany({});
                } else {
                    await db.collection("users").deleteOne({ id: ObjectId(context.userId) });
                }
                await pubsub.publish(USER_LEFT, { userLeft: user.name });
                return true;
            },
            clearRoom: async () => {
                const { result: resultForUsers } = await db.collection("users").deleteMany({});
                const { result: resultForCards } = await db.collection("cards").deleteMany({});
                const { result: resultForRooms } = await db.collection("rooms").deleteMany({});
                return resultForUsers.ok && resultForCards.ok && resultForRooms.ok;
            }
        }
    };

    return new ApolloServer({
        typeDefs,
        resolvers,
        context: ({ req, connection }) => (connection ? null : ({ userId: req.headers.authorization })),
        introspection: true,
        playground: true
    });
}

module.exports = { startApollo };