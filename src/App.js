import Sidebar from "./Sidebar";
import Chat from "./Chat";
import "./App.css";
import { useEffect, useState } from "react";
import Pusher from "pusher-js";
import axios from "./axios";

function App() {
  const [messages, setMessages] = useState([]);
  useEffect(() => {
    axios
      .get("/messages/sync")
      .then((response) => {
        setMessages(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);
  useEffect(() => {
    var pusher = new Pusher("9be80fad10efd4fded17", {
      cluster: "ap2",
    });
    var channel = pusher.subscribe("messages");
    channel.bind("insert", function (data) {
      // alert(JSON.stringify(data));
      setMessages((prevMessages) => [...prevMessages, data]);
      console.log(messages);
    });
    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [messages]);

  return (
    <>
      <div className="appheader"></div>
      <div className="app">
        <div className="app__body">
          <Sidebar />
          <Chat messages={messages} />
        </div>
      </div>
    </>
  );
}

export default App;
