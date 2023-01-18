import { ApolloClient, InMemoryCache, HttpLink, split } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { Kind, OperationTypeNode } from 'graphql';
import { createClient as createWsClient } from 'graphql-ws';
import { getAccessToken } from '../auth';

const GRAPHQL_URL = 'http://localhost:9000/graphql';
const GRAPHQL_WS = 'ws://localhost:9000/graphql';

// httpLink is used to connect to the graphql server
const httpLink = new HttpLink({
  uri: GRAPHQL_URL,
});

// wsLink is used to connect to the graphql server
const wsLink = new GraphQLWsLink(
  createWsClient({
    url: GRAPHQL_WS,
    // This is the connectionParams function that will be used to pass the token to the server
    connectionParams: () => ({
      accessToken: getAccessToken(),
    }),
  })
);

// This function is used to determine if the operation is a subscription
const isSubscriptionOperation = ({ query }) => {
  const definition = getMainDefinition(query);
  return (
    // Kind is a property of the graphql package that is used to identify the type of operation
    // OperationTypeNode is a property of the graphql package that is used to identify the type of operation
    definition.kind === Kind.OPERATION_DEFINITION &&
    definition.operation === OperationTypeNode.SUBSCRIPTION
  );
};

// split means that if the operation is a subscription, use the wsLink, otherwise use the httpLink
const link = split(isSubscriptionOperation, wsLink, httpLink);

export const client = new ApolloClient({
  // link means the connection between the client and the server
  link,
  cache: new InMemoryCache(),
});

export default client;
