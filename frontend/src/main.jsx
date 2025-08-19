import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from "next-themes";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "./Context/AuthContext";
import "./index.css";
import { QueryProvider } from "./providers/QueryProvider";
import AppRouter from "./providers/RouterProvider";

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
