import React from "react";
import "./SidebarChat.css";
import { Avatar, IconButton } from "@mui/material";

function SidebarChat() {
  return (
    <div className="sidebarChat">
      <Avatar />
      <div className="sidebarChat__info">
        <h2>Room Name</h2>
        <p>Last message sent</p>
      </div>
    </div>
  );
}

export default SidebarChat;
