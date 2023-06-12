import React from "react";
import "./SidebarChat.css";
import { Avatar } from "@mui/material";
import { useStateValue } from "./StateProvider";
import axios from "./axios";

function SidebarChat(props) {
  const [{ user, conversationChannelId }, dispatch] = useStateValue();
  const initiateChat = () => {
    const conversationId = user.uid + props.userObj.uid;
    const conversationObj = {
      participants: [
        { participantId: user.uid },
        { participantId: props.userObj.uid },
      ],
      _id: conversationId,
      conversationId: conversationId,
      channelName: props.userObj.name,
      messages: [
        {
          content: "",
          senderId: user.uid,
          receiverId: props.userObj.uid,
          sentAt: new Date().toUTCString(),
          seen: false,
          received: false,
          updatedAt: new Date().toUTCString(),
        },
      ],
      createdAt: new Date().toUTCString(),
    };

    axios
      .post(`/conversations/${conversationId}`, conversationObj)
      .then((response) => {
        console.log(response);
        dispatch({
          type: "SET_CHANNEL",
          conversationChannelId: conversationId,
        });
      })
      .catch((error) => {
        if (error.response.status === 409) {
          dispatch({
            type: "SET_CHANNEL",
            conversationChannelId: conversationId,
          });
          console.log(conversationChannelId);
        }
        console.error("Error creating conversation channel in MongoDB:", error);
      });
  };
  return (
    <div className="sidebarChat" onClick={initiateChat}>
      <Avatar />
      <div className="sidebarChat__info">
        <h2>{props.userObj.email}</h2>
        <p>{props.userObj.name}</p>
      </div>
    </div>
  );
}

export default SidebarChat;
