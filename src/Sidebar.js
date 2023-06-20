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
  const [searchTerm, setSearchTerm] = useState("");
  const [{ user }, dispatch] = useStateValue();
  const [currentUserChats, setcurrentUserChats] = useState([]);

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
  useEffect(() => {
    const list = [];

    if (user.conversations) {
      user.conversations.forEach((conversation) => {
        const chatWithUser = users.find(
          (user) => user.uid === conversation.chatWithUserId
        );

        if (chatWithUser) {
          const chattile = {
            chatWithUser: chatWithUser,
            lastMessage: conversation.lastMessage,
          };
          list.push(chattile);
        }
      });

      // Sort the list by the sentAt date of the last message
      list.sort((a, b) => {
        const sentAtA = new Date(a.lastMessage.sentAt);
        const sentAtB = new Date(b.lastMessage.sentAt);
        return sentAtB - sentAtA; // Sort in descending order
      });
    }

    setcurrentUserChats(list);
  }, [user, users]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !currentUserChats.some((chat) => chat.chatWithUser.uid === user.uid)
  );

  return (
    <div className="sidebar">
      <div className="sidebar__header">
        <Avatar src={user.photoURL} style={{ width: "55px", height: "55px" }} />
        <div className="sidebar__headerRight">
          {/* <IconButton>
            <DonutLargeIcon />
          </IconButton> */}
          <IconButton>
            <ChatIcon />
          </IconButton>
          <IconButton>
            <MoreVertIcon />
          </IconButton>
          <button
            className="login__registerButton"
            onClick={() => {
              auth.signOut().then(() => {
                try {
                  axios
                    .post(`/users/uid/${user.uid}/signout`, user)
                    .then((response) => {
                      dispatch({
                        type: "SET_USER",
                        user: null,
                      });
                      dispatch({
                        type: "SET_CHATTINGWITH_USER",
                        chattingWithUser: null,
                      });
                      dispatch({
                        type: "SET_CHANNEL",
                        conversationChannelId: null,
                      });
                      console.log(user, "logging out - reducer-active user");
                    })
                    .catch((error) => {
                      console.error(
                        "Error while updating user signout status in MongoDB:",
                        error
                      );
                    });
                } catch (error) {
                  return alert(error);
                }
              });
            }}
          >
            Sign out
          </button>
        </div>
      </div>
      <div className="sidebar__search">
        <div className="sidebar__searchContainer">
          <SearchOutlined />
          <input
            placeholder="Search for contacts & start chatting"
            type="text"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>
      <div className="sidebar__chats">
        {searchTerm === ""
          ? // Show chats of current users if search term is empty
            currentUserChats === null
            ? filteredUsers.map((userObj) =>
                user.uid === userObj.uid ? (
                  <div key={userObj.uid}></div>
                ) : (
                  <div key={userObj.uid}>
                    <SidebarChat userObj={userObj} />
                  </div>
                )
              )
            : currentUserChats.map((obj, index) => (
                <div key={index}>
                  <SidebarChat
                    userObj={obj.chatWithUser}
                    lastMessage={obj.lastMessage}
                  />
                </div>
              ))
          : // Show filtered users if search term is not empty
            filteredUsers.map((userObj) =>
              user.uid === userObj.uid ? (
                <div key={userObj.uid}></div>
              ) : (
                <div key={userObj.uid}>
                  <SidebarChat userObj={userObj} />
                </div>
              )
            )}
      </div>
    </div>
  );
}

export default Sidebar;
