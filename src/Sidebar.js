import React, { useEffect, useState } from "react";
import "./Sidebar.css";
import axios from "./axios";
import { useStateValue } from "./StateProvider";
import DonutLargeIcon from "@mui/icons-material/DonutLarge";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ChatIcon from "@mui/icons-material/Chat";
import { Avatar, IconButton } from "@mui/material";
import { SearchOutlined } from "@mui/icons-material";
import SidebarChat from "./SidebarChat";
import { auth } from "./firebase";
import User from "./models/User";

function Sidebar() {
  const [users, setUsers] = useState([]);
  const [{ user }, dispatch] = useStateValue();

  useEffect(() => {
    axios
      .get("/users/sync")
      .then((response) => {
        console.log(response.data);
        setUsers(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);
  return (
    <div className="sidebar">
      <div className="sidebar__header">
        <Avatar src={user.photoURL} />
        <div className="sidebar__headerRight">
          <IconButton>
            <DonutLargeIcon />
          </IconButton>
          <IconButton>
            <ChatIcon />
          </IconButton>
          <IconButton>
            <MoreVertIcon />
          </IconButton>
          <button
            className="login__registerButton"
            onClick={async () => {
              await auth.signOut().then(() => {
                dispatch({
                  type: "SET_USER",
                  user: null,
                });
              });
              console.log(user, "logging out - active user");
            }}
          >
            Sign out
          </button>
        </div>
      </div>
      <div className="sidebar__search">
        <div className="sidebar__searchContainer">
          <SearchOutlined />
          <input placeholder="Search or start new chat" type="text" />
        </div>
      </div>

      {users && (
        <div className="sidebar__chats">
          {users.map((obj, index) => {
            const otherUser = new User(obj);
            return user.uid === otherUser.uid ? (
              <div key={index}></div>
            ) : (
              <div key={index}>
                <SidebarChat userObj={otherUser} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Sidebar;
