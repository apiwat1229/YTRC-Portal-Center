// src/main.jsx
import { MantineProvider } from "@mantine/core";
import { DatesProvider } from "@mantine/dates";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import ReactDOM from "react-dom/client";

import dayjs from "dayjs";
import "dayjs/locale/th";
dayjs.locale("th");

import App from "./App";

import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
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
      defaultGradient: {
        from: "blue",
        to: "indigo",
        deg: 45,
      },
    }}
  >
    <DatesProvider
      settings={{
        locale: "en",
        firstDayOfWeek: 1,
      }}
    >
      <ModalsProvider>
        <Notifications position="top-right" />
        <App />
      </ModalsProvider>
    </DatesProvider>
  </MantineProvider>
);