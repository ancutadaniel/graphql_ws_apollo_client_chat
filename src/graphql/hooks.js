import { useMutation, useQuery, useSubscription } from '@apollo/client';
import { getAccessToken } from '../auth';
import {
  ADD_MESSAGE_MUTATION,
  MESSAGES_QUERY,
  MESSAGE_ADDED_SUBSCRIPTION,
} from './queries';

export function useAddMessage() {
  const [mutate] = useMutation(ADD_MESSAGE_MUTATION);
  return {
    addMessage: async (text) => {
      const {
        data: { message },
      } = await mutate({
        variables: { input: { text } },
        context: {
          headers: { Authorization: 'Bearer ' + getAccessToken() },
        },
      });
      return message;
    },
  };
}

export function useMessages() {
  const { data } = useQuery(MESSAGES_QUERY, {
    context: {
      headers: { Authorization: 'Bearer ' + getAccessToken() },
    },
  });

  // This is the subscription hook that will be used to subscribe to the subscription
  useSubscription(MESSAGE_ADDED_SUBSCRIPTION, {
    // This is the update function that will be used to update the cache
    onData: ({ client, data }) => {
      //  This is the data that was sent from the server
      const { message } = data.data;
      // This is the update function that will be used to update the cache
      client.cache.updateQuery({ query: MESSAGES_QUERY }, ({ messages }) => ({
        messages: [...messages, message],
      }));
    },
  });

  return {
    messages: data?.messages ?? [],
  };
}
