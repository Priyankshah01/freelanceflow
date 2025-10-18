import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { HashRouter } from 'react-router-dom'
import "./styles/index.css";   // 👈 import Tailwind styles

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
    <AuthProvider />
    <HashRouter />
  </React.StrictMode>
);
