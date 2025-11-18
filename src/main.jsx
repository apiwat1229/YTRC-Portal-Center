// src/main.jsx
import { MantineProvider } from "@mantine/core";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import "@mantine/core/styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <MantineProvider
      defaultColorScheme="light"
      theme={{
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        primaryColor: "blue",
        defaultRadius: "md",
      }}
    >
      <App />
    </MantineProvider>
  </React.StrictMode>
);