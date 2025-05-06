import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import AppRouter from "../providers/RouterProvider";
import { Toaster } from "sonner";
import { QueryProvider } from "../providers/QueryProvider";

createRoot(document.getElementById("root")).render(
  // <StrictMode>
    <QueryProvider>
      <Theme accentColor="purple" grayColor="slate">
        <Toaster position="top-right" richColors />
        <AppRouter />
      </Theme>
    </QueryProvider>
  // </StrictMode>
);
