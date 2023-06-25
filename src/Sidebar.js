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
import UsersList from "./UsersList";
import { auth } from "./firebase";
import * as conversationController from "../src/controllers/conversationController.js";
function Sidebar() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [{ user }, dispatch] = useStateValue();
  const [currentUserChats, setcurrentUserChats] = useState([]);
  const [isChatListVisible, setIsChatListVisible] = useState(false); // New state variable
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await conversationController.getallAppUsers();
        setUsers(res);
      } catch (error) {
        console.log(error);
      }
    };
    fetchUsers();
  }, []);
  useEffect(() => {
    const fetchCurrentUserConversations = async () => {
      try {
        const res = await conversationController.fetchCurrentUserConversations(
          user
        );
        if (res.length > 0) {
          const sortedChannels = res;
          sortedChannels.sort((a, b) => {
            const sentAtA = new Date(
              a.conversation.messages[a.conversation.messages.length - 1].sentAt
            ).getTime();
            const sentAtB = new Date(
              b.conversation.messages[b.conversation.messages.length - 1].sentAt
            ).getTime();
            return sentAtB - sentAtA; // Sort in descending order
          });
          setcurrentUserChats(sortedChannels);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchCurrentUserConversations();
  }, []);
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };
  const filteredUsers = users.filter(
    (user) => user.firstName.toLowerCase().includes(searchTerm.toLowerCase())
    // &&
    // !currentUserChats.some((chat) => chat.chatWithUser.uid === user.uid)
  );
  const toggleChatList = () => {
    setIsChatListVisible(!isChatListVisible);
    dispatch({
      type: "SET_CHANNEL",
      selectedChannel: null,
    });
  };
  return (
    <div className="sidebar">
      <div className="sidebar__header">
        <Avatar src={user.photoURL} style={{ width: "55px", height: "55px" }} />
        <div className="sidebar__headerRight">
          <IconButton onClick={toggleChatList}>
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
                        type: "SET_CHANNEL",
                        selectedChannel: null,
                      });

                      window.location.reload(false);
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
        {
          isChatListVisible
            ? users.map((userobj) =>
                userobj.uid == user.uid ? (
                  <div key={userobj.uid}></div>
                ) : (
                  <div key={userobj.uid}>
                    <UsersList userObj={userobj} />
                  </div>
                )
              )
            : searchTerm === ""
            ? currentUserChats.map((channel) => (
                <div key={channel.conversation.conversationId}>
                  <SidebarChat channel={channel} />
                </div>
              ))
            : filteredUsers.map((userObj) =>
                user.uid === userObj.uid ? (
                  <div key={userObj.uid}></div>
                ) : (
                  <div key={userObj.uid}>
                    <UsersList userObj={userObj} />
                  </div>
                )
              )
          // isChatListVisible
          // ? filteredUsers.map((userObj) =>
          //     user.uid === userObj.uid ? (
          //       <div key={userObj.uid}></div>
          //     ) : (
          //       <div key={userObj.uid}>
          //         <SidebarChat userObj={userObj} />
          //       </div>
          //     )
          //   )
          //   : searchTerm === ""
          //   ? currentUserChats === null
          //     ? filteredUsers.map((userObj) =>
          //         user.uid === userObj.uid ? (
          //           <div key={userObj.uid}></div>
          //         ) : (
          //           <div key={userObj.uid}>
          //             <SidebarChat userObj={userObj} />
          //           </div>
          //         )
          //       )
          //     : currentUserChats.map((obj, index) => (
          //         <div key={index}>
          //           <SidebarChat
          //             userObj={obj.chatWithUser}
          //             lastMessage={obj.lastMessage}
          //           />
          //         </div>
          //       ))
          //   : filteredUsers.map((userObj) =>
          //       user.uid === userObj.uid ? (
          //         <div key={userObj.uid}></div>
          //       ) : (
          //         <div key={userObj.uid}>
          //           <SidebarChat userObj={userObj} />
          //         </div>
          //       )
          //     )
        }
      </div>
    </div>
  );
}

export default Sidebar;
