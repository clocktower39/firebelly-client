import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import socketIOClient from "socket.io-client";
import { Provider } from "react-redux";
import { store } from "./Redux/store";
import { serverURL } from "./Redux/actions";

const socket = socketIOClient(serverURL, { transports: ["websocket"], upgrade: false });

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <App socket={socket} />
    </Provider>
    ,
  </React.StrictMode>
);
