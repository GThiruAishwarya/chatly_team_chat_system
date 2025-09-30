import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./redux/store.js";

// ✅ Auto-switch between local and deployed backend
export const serverUrl =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://chatly-team-chat-system-backend.onrender.com";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Provider store={store}>
      <App />
    </Provider>
  </BrowserRouter>
);
