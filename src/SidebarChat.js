import React from "react";
import "./SidebarChat.css";
import { Avatar } from "@mui/material";
import { useStateValue } from "./StateProvider";
import axios from "./axios";

function SidebarChat(props) {
  const [{ user, conversationChannelId, chattingWithUser }, dispatch] =
    useStateValue();
  const generateConversationId = (currentUserId, otherUserId) => {
    const sortedUserIds = [currentUserId, otherUserId].sort(); // Sort userIds alphabetically
    return sortedUserIds.join("_"); // Concatenate userIds with an underscore
  };
  const initiateChat = () => {
    let conversationId = generateConversationId(user.uid, props.userObj.uid);
    let conversationObj = {
      participants: [
        { participantId: user.uid },
        { participantId: props.userObj.uid },
      ],
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
      .put(`/users/${user.uid}/conversations`, {
        conversationId: conversationId,
        receiverId: props.userObj.uid,
        senderId: user.uid,
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
      <Avatar
        src={props.userObj.photoURL}
        style={{ width: "55px", height: "55px" }}
      />

      <div>
        <div className="sidebarChat__info">{props.userObj.firstName}</div>
        <p className="sidebarChat__info_p">Im comming</p>
      </div>
    </div>
  );
}

export default SidebarChat;
