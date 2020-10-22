import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { split } from "apollo-link";
import { HttpLink } from "apollo-link-http";
import { WebSocketLink } from "apollo-link-ws";
import { getMainDefinition } from "apollo-utilities";
import { setContext } from "apollo-link-context";

export default function useApolloClient(
  user: string | null,
  room: string | null
) {
  const cache = new InMemoryCache();

  const getURI = (protocol: string) =>
    process.env.NODE_ENV === "production"
      ? `${protocol}s://${window.location.hostname}/graphql`
      : `${protocol}://${window.location.hostname}:${
          process.env.PORT || 4000
        }/graphql`;

  const httpLink = new HttpLink({
    uri: getURI("http"),
  });

  const websocketLink = new WebSocketLink({
    uri: getURI("ws"),
    options: {
      reconnect: true,
      connectionParams: { room, user },
    },
  });

  const link = split(
    // Split based on operation type
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === "OperationDefinition" &&
        definition.operation === "subscription"
      );
    },
    websocketLink,
    httpLink
  );

  const authMiddleware = setContext((_, { headers }) => {
    return {
      headers: {
        ...headers,
        room,
        user,
      },
    };
  });

  const client = new ApolloClient({
    cache,
    link: authMiddleware.concat(link),
  });

  return client;
}
