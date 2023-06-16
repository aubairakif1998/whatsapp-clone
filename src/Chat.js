import React, { useState, useRef, useEffect } from "react";
import "./Chat.css";
import axios from "./axios";
import { Avatar, IconButton, Button } from "@mui/material";
import { AttachFile, MoreVert, SearchOutlined } from "@mui/icons-material";
import InsertEmoticonIcon from "@mui/icons-material/InsertEmoticon";
import MicIcon from "@mui/icons-material/Mic";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import DoneIcon from "@mui/icons-material/Done";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import { useStateValue } from "./StateProvider";
import sound from "./assets/sent.wav";
import moment from "moment";
function Chat(props) {
  const [messageInput, setMessageInput] = useState("");
  const chatContainerRef = useRef(null);
  const [showScrollDownButton, setShowScrollDownButton] = useState(false);

  const [{ user, conversationChannelId, chattingWithUser }, dispatch] =
    useStateValue();
  function play() {
    new Audio(sound).play();
  }
  const sendMessage = (e) => {
    e.preventDefault();
    if (messageInput !== "") {
      const newMessage = {
        conversationId: conversationChannelId,
        content: messageInput,
        senderId: user.uid,
        receiverId: chattingWithUser.uid,
        sentAt: new Date().toUTCString(),
        seen: false,
        received: false,
        updatedAt: new Date().toUTCString(),
      };
      console.log(conversationChannelId);
      axios
        .post(
          `/conversations/${conversationChannelId}/messages/new`,
          newMessage
        )
        .then((response) => {
          console.log("Message sent successfully in mongo db", response.data);
        })
        .catch((error) => {
          alert("Error sending message:", error);
          console.error("Error sending message:", error);
        });
      axios
        .post(`/chatstream/${conversationChannelId}/message/new`, newMessage)
        .then((response) => {
          console.log(
            "Message sent successfully in chat stream:",
            response.data
          );
          scrollToBottom();
          setMessageInput("");
          play();
        })
        .catch((error) => {
          alert("Error sending message in chat stream:", error);
          console.error("Error sending message in chat stream:", error);
        });

      axios
        .put(
          `/users/${user.uid}/conversations/${conversationChannelId}/update/lastMessage`,
          newMessage
        )
        .then((response) => {
          console.log(
            "Message saved successfull in the last message field in user doc"
          );
        })
        .catch((error) => {
          console.error(
            "Error Message not saved successfull in the last message field in user doc:",
            error
          );
        });
    }
  };

  const scrollToBottom = () => {
    chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
  };

  const scrollDown = () => {
    scrollToBottom();
  };

  const handleScroll = () => {
    const { scrollTop, clientHeight, scrollHeight } = chatContainerRef.current;
    setShowScrollDownButton(scrollTop + clientHeight < scrollHeight - 220);
  };

  useEffect(() => {
    scrollToBottom();
  }, [props.messages]);
  const formatLastSeen = (timestamp) => {
    const lastSeen = moment(timestamp);
    const currentTime = moment();
    const minutesDiff = currentTime.diff(lastSeen, "minutes");

    if (minutesDiff < 1) {
      return "Online";
    } else if (minutesDiff < 60) {
      return `Last seen: ${minutesDiff} minute${
        minutesDiff !== 1 ? "s" : ""
      } ago`;
    } else if (minutesDiff < 1440) {
      const hoursDiff = Math.floor(minutesDiff / 60);
      return `Last seen: ${hoursDiff} hour${hoursDiff !== 1 ? "s" : ""} ago`;
    } else {
      const daysDiff = Math.floor(minutesDiff / 1440);
      return `Last seen: ${daysDiff} day${daysDiff !== 1 ? "s" : ""} ago`;
    }
  };
  return (
    <div className="chat">
      <div className="chat__header">
        <Avatar
          src={chattingWithUser.photoURL}
          style={{ width: "55px", height: "55px" }}
        />
        <div className="chat__headerInfo" style={{ marginLeft: "15px" }}>
          <h3
            style={{
              marginBottom: "5px",
              fontSize: "18px",
              fontWeight: "bold",
            }}
          >
            {chattingWithUser.firstName}
          </h3>
          <p style={{ fontSize: "14px", color: "#999999" }}>
            {formatLastSeen(chattingWithUser.lastSeen)}
          </p>
        </div>
        <div className="chat__headerRight">
          <IconButton>
            <SearchOutlined />
          </IconButton>
          <IconButton>
            <AttachFile />
          </IconButton>
          <IconButton>
            <MoreVert />
          </IconButton>
        </div>
      </div>
      <div
        className="chat__body"
        ref={chatContainerRef}
        onScroll={handleScroll}
      >
        {props.messages.map((message, index) =>
          message.senderId === user.uid ? (
            <div key={index} className="chat__messageContainer">
              <p className="chat__message chat__receiver">
                <span className="chat__name">{message.name}</span>
                {message.content}
                <span className="chat__timestamp">
                  {moment(message.sentAt).format("MMM DD, YYYY hh:mm A")}
                </span>
                {/* {message.sent ? (
                  message.seen ? (
                    <DoneAllIcon
                      className="chat__tick"
                      style={{ color: "blue", fontSize: "14px" }}
                    />
                  ) : message.received ? (
                    <DoneAllIcon
                      className="chat__tick"
                      style={{ color: "grey", fontSize: "14px" }}
                    />
                  ) : (
                    <DoneAllIcon
                      className="chat__tick"
                      style={{ color: "grey", fontSize: "14px" }}
                    />
                  )
                ) : (
                  <DoneIcon
                    className="chat__tick"
                    style={{ color: "grey", fontSize: "14px" }}
                  />
                )} */}
              </p>
            </div>
          ) : (
            <div key={index} className="chat__messageContainer">
              <p className="chat__message">
                <span className="chat__name">{message.name}</span>
                {message.content}
                <span className="chat__timestamp">
                  {" "}
                  {moment(message.sentAt).format("MMM DD, YYYY hh:mm A")}
                </span>
              </p>
            </div>
          )
        )}
      </div>
      <div className="chat__footer">
        {showScrollDownButton && (
          <div className="scrollDownButton" onClick={scrollDown}>
            <IconButton>
              <KeyboardArrowDownIcon />
            </IconButton>
          </div>
        )}
        <InsertEmoticonIcon />
        <form onSubmit={sendMessage}>
          <input
            placeholder="Type a message"
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
          />
        </form>
        <Button
          variant="contained"
          color="primary"
          onClick={sendMessage}
          style={{
            marginLeft: 10,
            backgroundColor: "#128C7E",
            color: "white",
            fontWeight: "bold",
          }}
        >
          Send
        </Button>
        <MicIcon />
      </div>
    </div>
  );
}

export default Chat;
