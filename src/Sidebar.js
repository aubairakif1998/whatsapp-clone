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
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredUsers = users.filter((user) =>
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="sidebar">
      <div className="sidebar__header">
        <Avatar src={user.photoURL} style={{ width: "55px", height: "55px" }} />

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
            onClick={() => {
              auth.signOut().then(() => {
                try {
                  axios
                    .post(`/users/uid/${user.uid}/signout`, user)
                    .then((response) => {
                      dispatch(
                        {
                          type: "SET_USER",
                          user: null,
                        },
                        {
                          type: "SET_CHATTINGWITH_USER",
                          chattingWithUser: null,
                        },
                        {
                          type: "SET_CHANNEL",
                          conversationChannelId: null,
                        }
                      );
                      console.log(user, "logging out - reducer-active user");
                    })
                    .catch((error) => {
                      console.error(
                        "Error while updaing user signout status in MongoDB:",
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
            placeholder="Search or start new chat"
            type="text"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      <div className="sidebar__chats">
        {filteredUsers.map((obj, index) => {
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
    </div>
  );
}

export default Sidebar;
