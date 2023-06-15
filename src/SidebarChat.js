import React from "react";
import "./SidebarChat.css";
import { Avatar } from "@mui/material";
import { useStateValue } from "./StateProvider";
import axios from "./axios";

function SidebarChat(props) {
  const [{ user, conversationChannelId, chattingWithUser }, dispatch] =
    useStateValue();
  const initiateChat = () => {
    let generateConversationId = (currentUserId, otherUserId) => {
      const sortedUserIds = [currentUserId, otherUserId].sort(); // Sort userIds alphabetically
      return sortedUserIds.join("_"); // Concatenate userIds with an underscore
    };
    let currentUserId = user.uid;
    let otherUserId = props.userObj.uid;
    let conversationId = generateConversationId(currentUserId, otherUserId);
    let conversationObj = {
      participants: [
        { participantId: user.uid },
        { participantId: props.userObj.uid },
      ],
      _id: conversationId,
      conversationId: conversationId,
      channelName: "",
      messages: [],
      createdAt: new Date().toUTCString(),
    };

    axios
      .post(`/conversations/create/${conversationId}`, conversationObj)
      .then((response) => {
        console.log(response);
        dispatch({
          type: "SET_CHANNEL",
          conversationChannelId: conversationId,
        });
        dispatch({
          type: "SET_CHATTINGWITH_USER",
          chattingWithUser: props.userObj,
        });
      })
      .catch((error) => {
        if (error.response.status === 409) {
          dispatch({
            type: "SET_CHANNEL",
            conversationChannelId: conversationId,
          });
          dispatch({
            type: "SET_CHATTINGWITH_USER",
            chattingWithUser: props.userObj,
          });
        }

        console.error("Error creating conversation channel in MongoDB:", error);
      });
    axios
      .put(`/users/${currentUserId}/conversations`, {
        conversationId: conversationId,
        receiverId: otherUserId,
        senderId: currentUserId,
      })
      .then((response) => {
        console.log(response.data, "update user conversations:");
      })
      .catch((error) => {
        console.log("Failed to update user conversations:", error);
      });
  };
  return (
    <div className="sidebarChat" onClick={initiateChat}>
      <Avatar />
      <div className="sidebarChat__info">
        <h2>{props.userObj.email}</h2>
        <p>{props.userObj.firstName}</p>
      </div>
    </div>
  );
}

export default SidebarChat;
