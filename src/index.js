import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import socketIOClient from "socket.io-client";
import { Provider } from 'react-redux';
import { store } from './Redux/store';
import { serverURL } from "./Redux/actions";

const socket = socketIOClient(serverURL,{transports: ['websocket'], upgrade: false});

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App socket={socket} />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
