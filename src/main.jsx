// src/main.jsx (หรือ src/main.tsx ถ้าใช้ TS)
import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import ReactDOM from "react-dom/client";

import App from "./App";

import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "./global.css";

ReactDOM.createRoot(document.getElementById("root")).render(

  <MantineProvider
    defaultColorScheme="light"
    theme={{
      fontFamily:
        "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      primaryColor: "blue",
      defaultRadius: "md",
    }}
  >
    <ModalsProvider>
      <Notifications position="top-right" />
      <App />
    </ModalsProvider>
  </MantineProvider>

);