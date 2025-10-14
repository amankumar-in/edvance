import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from "next-themes";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "./Context/AuthContext";
import "./index.css";
import { QueryProvider } from "./providers/QueryProvider";
import AppRouter from "./providers/RouterProvider";
import { BRAND_COLOR } from "./utils/constants";

createRoot(document.getElementById("root")).render(
  // <StrictMode>
  <QueryProvider>
    <ThemeProvider
      attribute='class'
      defaultTheme='light'
      enableSystem
      disableTransitionOnChange
    >
      <Theme
        accentColor={BRAND_COLOR}
        grayColor="slate"
        panelBackground="solid"
        radius="large"
      >
        <AuthProvider>
          <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right"/>
          <AppRouter />
        </AuthProvider>
      </Theme>
    </ThemeProvider>
  </QueryProvider>
  // </StrictMode>
);
