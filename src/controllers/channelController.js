import axios from "../axios";
import Conversation from "../models/Conversation";
import Channel from "../models/Channel";
import * as firebase from "../firebase.js";
import User from "../models/User";

const generateConversationId = (currentUserId, otherUserId) => {
  const sortedUserIds = [currentUserId, otherUserId].sort();
  return sortedUserIds.join("_");
};
export const fetchChannel = async (currentUser, otheruser) => {
  try {
    const conversationId = generateConversationId(
      currentUser.uid,
      otheruser.uid
    );
    const obj = new Conversation({
      participants: [
        { participantId: currentUser.uid },
        { participantId: otheruser.uid },
      ],
      conversationId: conversationId,
      channelName: "",
      messages: [
        {
          content: "Welcome to the app, Enjoy our chatting feature. Thank you!",
          senderId: currentUser.uid,
          receiverId: otheruser.uid,
          sentAt: new Date(),
          mediaURL: "",
          isMediaAttached: false,
          seen: false,
          received: false,
          updatedAt: new Date(),
        },
      ],
      lastMessage: {
        content: "",
        senderId: currentUser.uid,
        receiverId: otheruser.uid,
        sentAt: new Date(),
        mediaURL: "",
        isMediaAttached: false,
        seen: false,
        received: false,
        updatedAt: new Date(),
      },
      createdAt: new Date(),
    });
    const con_obj = await axios
      .post(`/conversations/create/${conversationId}`, obj)
      .then((response) => {
        const conversationObj = new Conversation(response.data);
        return conversationObj;
      })
      .catch((error) => {
        console.log(
          "Error creating/fetching conversation channel in MongoDB:",
          error
        );
      });
    console.log(con_obj);
    await axios
      .put(`/users/${currentUser.uid}/update/conversations`, {
        conversationId: conversationId,
        receiverId: otheruser.uid,
        senderId: currentUser.uid,
      })
      .then((response) => {
        console.log(response.data, "update user conversations:");
      })
      .catch((error) => {
        console.log("Failed to update user conversations:", error);
      });
    const user_Obj = await axios
      .post(`/users/find/${otheruser.uid}`)
      .then((response) => {
        const userObj = new User(response.data);
        return userObj;
      })
      .catch((error) => {
        console.log("Failed to fetch user:", error);
      });
    console.log("USER", user_Obj);
    // Channel setting
    const channel = new Channel({
      conversation: con_obj,
      users: [user_Obj],
    });
    console.log("CHANNEL", channel);
    return channel;
  } catch (error) {
    console.log("Error updating ", error);
  }
};

export const sendMessageToMongoDB = async (selectedChannel, message) => {
  try {
    await axios.post(
      `/conversations/${selectedChannel.conversation.conversationId}/messages/new`,
      message
    );
    console.log("Message sent successfully in MongoDB");
  } catch (error) {
    console.error("Error sending message to MongoDB:", error);
    throw error;
  }
};
export const sendMessageToChatStream = async (selectedChannel, message) => {
  try {
    await axios.post(
      `/chatstream/${selectedChannel.conversation.conversationId}/message/new`,
      message
    );
    console.log("Message sent successfully in chat stream", message);
  } catch (error) {
    console.error("Error sending message in chat stream:", error);
    throw error;
  }
};
