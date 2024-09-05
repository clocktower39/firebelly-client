import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { Provider } from "react-redux";
import { store } from "./Redux/store";

// Temporary remove <React.StrictMode> parent container for react-beautiful-dnd, will replace with @dnd-kit/core
/*
  The double invocation of effects in React.StrictMode is likely the cause of the issues with react-beautiful-dnd.
  Since React intentionally invokes lifecycle methods (like useEffect and useLayoutEffect) twice in development mode, libraries like react-beautiful-dnd can experience problems because they might not expect the extra invocation, leading to issues like duplicate rendering or missing IDs.
*/

ReactDOM.createRoot(document.getElementById("root")).render(
    <Provider store={store}>
      <App />
    </Provider>
);
