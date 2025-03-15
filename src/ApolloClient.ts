import {
    ApolloClient,
    InMemoryCache,
  } from '@apollo/client';

export const apolloClient = new ApolloClient({
    uri: import.meta.env.VITE_GRAPHQL_URI,
    cache: new InMemoryCache(),
});

export default apolloClient;
