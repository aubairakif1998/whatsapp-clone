import axios from "../axios";
import Channel from "../models/Channel";
import User from "../models/User";
import Conversation from "../models/Conversation";

export const getallAppUsers = async () => {
  try {
    const response = await axios.get("/users/sync");
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const fetchCurrentUserConversations = async (currentUser) => {
  try {
    const listOfChannels = await Promise.all(
      currentUser.conversations.map(async (conversation) => {
        try {
          const response = await axios.post(
            `/conversations/fetch/${conversation.conversationId}`,
            {}
          );
          const conversationObj = new Conversation(response.data);

          const listOfParticipantsUser = await Promise.all(
            conversationObj.participants.map(async (participant) => {
              try {
                const userResponse = await axios.post(
                  `/users/find/${participant.participantId}`
                );
                const userObj = new User(userResponse.data);
                return userObj;
              } catch (error) {
                console.log("Failed to update user conversations:", error);
                return null;
              }
            })
          );

          const channel = new Channel({
            conversation: conversationObj,
            users: listOfParticipantsUser.filter(
              (user) => user !== null && user.uid !== currentUser.uid
            ),
          });
          return channel;
        } catch (error) {
          console.log(
            "Error creating/fetching conversation channel in MongoDB:",
            error
          );
          return null;
        }
      })
    );
    console.log(listOfChannels.filter((channel) => channel !== null));
    return listOfChannels.filter((channel) => channel !== null);
  } catch (error) {
    console.log(error);
    throw error;
  }
};
