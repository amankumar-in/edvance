import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import AppRouter from "../providers/RouterProvider";
import { Toaster } from "sonner";
import { QueryProvider } from "../providers/QueryProvider";
import { AuthProvider } from "./Context/AuthContext";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

createRoot(document.getElementById("root")).render(
  // <StrictMode>
  <QueryProvider>
    <AuthProvider>     
        <Theme accentColor="cyan" grayColor="slate">
          <Toaster position="top-right" richColors />
          <ReactQueryDevtools initialIsOpen={false} />
          <AppRouter />
        </Theme>
    </AuthProvider>
  </QueryProvider>
  // </StrictMode>
);
