import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import AppRouter from "../providers/RouterProvider";
import { QueryProvider } from "../providers/QueryProvider";
import { AuthProvider } from "./Context/AuthContext";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from "next-themes";

createRoot(document.getElementById("root")).render(
  // <StrictMode>
  <QueryProvider>
    <AuthProvider>
      <ThemeProvider
        attribute='class'
        defaultTheme='light'
        enableSystem
        disableTransitionOnChange
      >
        <Theme accentColor="cyan" grayColor="slate">
          <ReactQueryDevtools initialIsOpen={false} />
          <AppRouter />
        </Theme>
      </ThemeProvider>
    </AuthProvider>
  </QueryProvider>
  // </StrictMode>
);
