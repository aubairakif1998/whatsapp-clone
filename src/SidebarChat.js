import React from "react";
import "./SidebarChat.css";
import { Avatar } from "@mui/material";
import Conversation from "./models/Conversation";
import { useStateValue } from "./StateProvider";
import * as channelController from "./controllers/channelController.js";
import moment from "moment";
function SidebarChat(props) {
  const [{ user }, dispatch] = useStateValue();
  const openChat = async () => {
    const fetchedChannel = await channelController.fetchChannel(
      user,
      props.channel.users[0]
    );
    dispatch({
      type: "SET_CHANNEL",
      selectedChannel: fetchedChannel,
    });
    console.log(fetchedChannel.channel);
  };
  return (
    <div className="sidebarChat" onClick={openChat}>
      <Avatar
        src={props.channel.users[0].photoURL}
        style={{
          width: "55px",
          height: "55px",
          position: "relative",
        }}
        className={`sidebarChat__avatar`}
      />
      <div
        className={`sidebarChat__avatar ${
          props.channel.users[0].isOnline
            ? "sidebarChat__avatar--online"
            : "sidebarChat__avatar--offline"
        }`}
      ></div>

      <div className="sidebarChat__details">
        <div className="sidebarChat__info">
          <span className="sidebarChat__name">
            {props.channel.users[0].firstName}
          </span>

          <span className="sidebarChat__timestamp">
            {moment(
              props.channel.conversation.messages[
                props.channel.conversation.messages.length - 1
              ].sentAt
            ).format("MMM DD, YYYY hh:mm A")}
          </span>
        </div>
        {props.channel.conversation.messages[
          props.channel.conversation.messages.length - 1
        ] && (
          <p className="sidebarChat__message">
            {props.channel.conversation.messages[
              props.channel.conversation.messages.length - 1
            ].content ===
            "Welcome to the app, Enjoy our chatting feature. Thank you!"
              ? ""
              : props.channel.conversation.lastMessage.senderId === user.uid
              ? "You: "
              : ""}

            {props.channel.conversation.messages[
              props.channel.conversation.messages.length - 1
            ].isMediaAttached
              ? " 📸 Media file sent"
              : props.channel.conversation.messages[
                  props.channel.conversation.messages.length - 1
                ].content ===
                "Welcome to the app, Enjoy our chatting feature. Thank you!"
              ? ""
              : props.channel.conversation.messages[
                  props.channel.conversation.messages.length - 1
                ].content}
          </p>
        )}
      </div>
    </div>
  );
}

export default SidebarChat;
