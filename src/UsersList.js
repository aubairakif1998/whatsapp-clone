import React from "react";
import "./SidebarChat.css";
import { Avatar } from "@mui/material";
import { useStateValue } from "./StateProvider";
import * as channelController from "./controllers/channelController.js";
function UsersList(props) {
  const [{ user }, dispatch] = useStateValue();
  const startConversation = async () => {
    const fetchedChannel = await channelController.fetchChannel(
      user,
      props.userObj
    );
    window.location.reload(false);
  };
  return (
    <div className="sidebarChat">
      <Avatar
        src={props.userObj.photoURL}
        style={{
          width: "55px",
          height: "55px",
          position: "relative",
        }}
        className={`sidebarChat__avatar`}
      />
      <div className="sidebarChat__details">
        <div className="sidebarChat__info">
          <span className="sidebarChat__name">{props.userObj.firstName}</span>

          <button
            className="sidebarChat__startChatButton"
            onClick={startConversation}
          >
            Start Chat
          </button>
        </div>
      </div>
    </div>
  );
}
export default UsersList;
