import React, { useState, useRef, useEffect } from "react";
import "./Chat.css";
import axios from "./axios";
import { firebaseApp } from "./firebase";
import { Avatar, IconButton, Button, DialogTitle, Dialog } from "@mui/material";
import {
  AttachFile,
  MoreVert,
  SearchOutlined,
  Camera,
} from "@mui/icons-material";
import InsertEmoticonIcon from "@mui/icons-material/InsertEmoticon";
import MicIcon from "@mui/icons-material/Mic";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import DoneIcon from "@mui/icons-material/Done";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import { useStateValue } from "./StateProvider";
import sound from "./assets/sent.wav";
import moment from "moment";
import * as channelController from "./controllers/channelController.js";

function Chat(props) {
  const [messageInput, setMessageInput] = useState("");
  const [mediaURL, setMediaURL] = useState("");
  const chatContainerRef = useRef(null);
  const [showScrollDownButton, setShowScrollDownButton] = useState(false);
  const [{ user, selectedChannel }, dispatch] = useStateValue();
  const [media, setMedia] = useState({ file: null, type: "" });
  const [isSending, setIsSending] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  function play() {
    new Audio(sound).play();
  }
  useEffect(() => {
    setMediaURL("");
    setMedia({ file: null, type: "" });
  }, [selectedChannel.conversation.conversationId]);

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

  const handleOpenDialog = () => {
    console.log(media);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const generateAndSetMediaURLs = async (e) => {
    e.preventDefault();
    try {
      const storageRef = firebaseApp.storage().ref();
      const fileRef =
        media.type === "video"
          ? storageRef.child(`media/${user.uid}/${user.uid}.mp4`)
          : media.type === "image"
          ? storageRef.child(`media/${user.uid}/${user.uid}.png`)
          : storageRef.child(`media/${user.uid}/${user.uid}.${media.type}`);
      await fileRef.put(media.file);
      const downloadURL = await fileRef.getDownloadURL();
      console.log(downloadURL);
      setMedia({ file: null, type: "" });
      setMediaURL(downloadURL);
      return downloadURL; // Return the downloadURL
    } catch (error) {
      console.log("Error uploading media to Firebase Storage:", error);
      throw error;
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    const fileType = selectedFile.type.split("/")[0]; // Get the file type (image or video)
    setMedia({ file: selectedFile, type: fileType });
  };
  const sendMessage = async (e) => {
    setIsSending(true);
    e.preventDefault();
    try {
      if (messageInput !== "" || media.file !== null) {
        if (media.file !== null) {
          const downloadURL = await generateAndSetMediaURLs(e);
          const message = {
            conversationId: selectedChannel.conversation.conversationId,
            content: messageInput ?? "",
            senderId: user.uid,
            receiverId: selectedChannel.users[0].uid,
            sentAt: new Date().toUTCString(),
            seen: false,
            received: false,
            mediaURL: downloadURL ?? "",
            isMediaAttached: downloadURL === "" ? false : true,
            updatedAt: new Date().toUTCString(),
          };
          await Promise.all([
            channelController.sendMessageToMongoDB(selectedChannel, message),
            channelController.sendMessageToChatStream(selectedChannel, message),
          ]);
          play();
          setMessageInput("");
        } else {
          const message = {
            conversationId: selectedChannel.conversation.conversationId,
            content: messageInput ?? "",
            senderId: user.uid,
            receiverId: selectedChannel.users[0].uid,
            sentAt: new Date().toUTCString(),
            seen: false,
            received: false,
            mediaURL: mediaURL ?? "",
            isMediaAttached: mediaURL === "" ? false : true,
            updatedAt: new Date().toUTCString(),
          };
          await Promise.all([
            channelController.sendMessageToMongoDB(selectedChannel, message),
            channelController.sendMessageToChatStream(selectedChannel, message),
          ]);
          play();
          setMessageInput("");
        }
      }
      setIsSending(false);
      setMediaURL("");
      setMedia({ file: null, type: "" });
    } catch (error) {
      setIsSending(false);
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="chat">
      <div className="chat__header">
        <Avatar
          src={selectedChannel.users[0].photoURL}
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
            {selectedChannel.users[0].firstName}
          </h3>
          <p style={{ fontSize: "14px", color: "#999999" }}>
            {formatLastSeen(selectedChannel.users[0].lastSeen)}
          </p>
        </div>
        <div className="chat__headerRight">
          {/* <IconButton>
            <SearchOutlined />
          </IconButton>
          <IconButton>
            <AttachFile />
          </IconButton> */}
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
              <p
                className={
                  message.content ===
                  "Welcome to the app, Enjoy our chatting feature. Thank you!"
                    ? "chat__message centered"
                    : "chat__message chat__receiver"
                }
              >
                {/* <span className="chat__name">{message.name}</span> */}
                {message.isMediaAttached ? (
                  <p className="chat__message chat__receiver">
                    <div className="chat__media-container">
                      <a
                        href={message.mediaURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={
                          message.mediaURL.endsWith(".mp4")
                            ? "video.mp4"
                            : "image.png"
                        }
                      >
                        {message.mediaURL.endsWith(".mp4") ||
                        message.mediaURL.includes(".mp4?") ? (
                          <video className="chat__media" controls>
                            <source src={message.mediaURL} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        ) : (
                          <img
                            src={message.mediaURL}
                            alt="Attached Media"
                            style={{ maxWidth: "300px", maxHeight: "250px" }}
                          />
                        )}
                      </a>
                    </div>
                  </p>
                ) : (
                  <></>
                )}

                {message.content}

                <span className="chat__timestamp">
                  {message.content ===
                  "Welcome to the app, Enjoy our chatting feature. Thank you!"
                    ? ""
                    : moment(message.sentAt).format("MMM DD, YYYY hh:mm A")}
                </span>
              </p>
            </div>
          ) : (
            <div key={index} className="chat__messageContainer">
              <p
                className={
                  message.content ===
                  "Welcome to the app, Enjoy our chatting feature. Thank you!"
                    ? "chat__message centered"
                    : "chat__message "
                }
              >
                {message.isMediaAttached ? (
                  <p className="chat__message  ">
                    <div className="chat__media-container">
                      <a
                        href={message.mediaURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={
                          message.mediaURL.endsWith(".mp4")
                            ? "video.mp4"
                            : "image.png"
                        }
                      >
                        {message.mediaURL.endsWith(".mp4") ||
                        message.mediaURL.includes(".mp4?") ? (
                          <video className="chat__media" controls>
                            <source src={message.mediaURL} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        ) : (
                          <img
                            src={message.mediaURL}
                            alt="Attached Media"
                            style={{ maxWidth: "300px", maxHeight: "250px" }}
                          />
                        )}
                      </a>
                    </div>
                  </p>
                ) : (
                  <></>
                )}

                {message.content}
                <span className="chat__timestamp">
                  {message.content ===
                  "Welcome to the app, Enjoy our chatting feature. Thank you!"
                    ? ""
                    : moment(message.sentAt).format("MMM DD, YYYY hh:mm A")}
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
        </form>{" "}
        {media.type === "" ? (
          <div>
            <IconButton onClick={handleOpenDialog}>
              <Camera />
            </IconButton>
            <Dialog open={isDialogOpen} onClose={handleCloseDialog}>
              <DialogTitle>Select Media</DialogTitle>
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
              />
              {media.file && (
                <div className="preview-container">
                  {media.type === "image" ? (
                    <img
                      style={{ padding: "20px" }}
                      src={URL.createObjectURL(media.file)}
                      alt="Selected Image"
                      className="preview-image"
                    />
                  ) : (
                    <video
                      style={{ padding: "20px" }}
                      src={URL.createObjectURL(media.file)}
                      controls
                      className="preview-video"
                    />
                  )}
                  <p
                    style={{
                      color: "black",
                      fontWeight: "600",
                      padding: "20px",
                    }}
                  >
                    File Name: {media.file.name}
                  </p>
                  <Button
                    variant="contained"
                    color="primary"
                    className="upload-button" // Apply custom CSS class
                    onClick={handleCloseDialog}
                  >
                    Save
                  </Button>
                </div>
              )}
            </Dialog>
          </div>
        ) : (
          <>
            <div>
              <IconButton onClick={handleOpenDialog}>
                <p style={{ fontSize: "18px", color: "grey" }}>File Attached</p>
              </IconButton>
              <Dialog open={isDialogOpen} onClose={handleCloseDialog}>
                <DialogTitle>Select Media</DialogTitle>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                />
                {media.file && (
                  <div className="preview-container">
                    {media.type === "image" ? (
                      <img
                        style={{ padding: "20px" }}
                        src={URL.createObjectURL(media.file)}
                        alt="Selected Image"
                        className="preview-image"
                      />
                    ) : (
                      <video
                        style={{ padding: "20px" }}
                        src={URL.createObjectURL(media.file)}
                        controls
                        className="preview-video"
                      />
                    )}
                    <p
                      style={{
                        color: "black",
                        fontWeight: "600",
                        padding: "20px",
                      }}
                    >
                      File Name: {media.file.name}
                    </p>
                    <Button
                      variant="contained"
                      color="primary"
                      className="upload-button" // Apply custom CSS class
                      onClick={handleCloseDialog}
                    >
                      Save
                    </Button>
                  </div>
                )}
              </Dialog>
            </div>
          </>
        )}
        <Button
          variant="contained"
          color="primary"
          onClick={sendMessage}
          disabled={isSending} // Disable the button while sending
          style={{
            marginLeft: 10,
            marginRight: 10,
            backgroundColor: "#128C7E",
            color: "white",
            fontWeight: "bold",
          }}
        >
          {isSending ? "Sending..." : "Send"}{" "}
          {/* Show "Sending..." or "Send" based on isSending */}
        </Button>
        {/* <MicIcon /> */}
      </div>
    </div>
  );
}

export default Chat;
