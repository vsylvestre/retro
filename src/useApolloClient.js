import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { split, concat } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import { setContext } from 'apollo-link-context';

export default function useApolloClient() {
    const cache = new InMemoryCache();

    const getURI = (protocol) => "production"
        ? `${protocol}s://${window.location.hostname}/graphql`
        : `${protocol}://${window.location.hostname}:${process.env.PORT || 4000}/graphql`;

    const httpLink = new HttpLink({
        uri: getURI('http')
    });

    const websocketLink = new WebSocketLink({
        uri: getURI('ws'),
        options: {
            reconnect: true
        }
    });

    const link = split(
        // Split based on operation type
        ({ query }) => {
            const definition = getMainDefinition(query);
            return (
                definition.kind === 'OperationDefinition' &&
                definition.operation === 'subscription'
            );
        },
        websocketLink,
        httpLink,
    );

    const authMiddleware = setContext((_, { headers }) => {
        // get the authentication token from local storage if it exists
        const token = localStorage.getItem('userId');
        // return the headers to the context so httpLink can read them
        return {
            headers: {
                ...headers,
                authorization: token || "",
            }
        }
    });

    const client = new ApolloClient({
        cache,
        link: authMiddleware.concat(link)
    });

    return client;
}
