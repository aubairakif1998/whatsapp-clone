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

function Chat(props) {
  const [messageInput, setMessageInput] = useState("");
  const chatContainerRef = useRef(null);
  const [showScrollDownButton, setShowScrollDownButton] = useState(false);

  const sendMessage = (e) => {
    e.preventDefault();
    if (messageInput !== "") {
      const newMessage = {
        message: messageInput,
        name: "Aubair.Akif",
        timestamp: new Date().toUTCString(),
        received: false,
        sent: true,
        seen: false,
        read: false,
      };

      axios
        .post("/messages/new", newMessage)
        .then((response) => {
          console.log("Message sent successfully:", response.data);
          scrollToBottom();
        })
        .catch((error) => {
          console.error("Error sending message:", error);
        });

      setMessageInput("");
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

  return (
    <div className="chat">
      <div className="chat__header">
        <Avatar />
        <div className="chat__headerInfo">
          <h3>Room name</h3>
          <p>last seen at...</p>
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
          message.name === "Aubair.Akif" ? (
            <div key={index} className="chat__messageContainer">
              <p className="chat__message chat__receiver">
                <span className="chat__name">{message.name}</span>
                {message.message}
                <span className="chat__timestamp">{message.timestamp}</span>
                {message.sent ? (
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
                )}
              </p>
            </div>
          ) : (
            <div key={index} className="chat__messageContainer">
              <p className="chat__message">
                <span className="chat__name">{message.name}</span>
                {message.message}
                <span className="chat__timestamp">{message.timestamp}</span>
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
