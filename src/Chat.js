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
          <h3>{chattingWithUser.name}</h3>
          <p>Online</p>
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
                <span className="chat__timestamp">{message.sentAt}</span>
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
                <span className="chat__timestamp">{message.sentAt}</span>
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
