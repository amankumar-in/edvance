import { useTheme } from "next-themes";
import { Outlet, ScrollRestoration, useNavigation } from "react-router";
import { Toaster } from "sonner";
import { TopLoadingBar } from "./components";

function App() {
  const { resolvedTheme } = useTheme();
  const navigation = useNavigation();

  return (
    <>
      <TopLoadingBar />
      <Toaster
        position="top-center"
        richColors
        theme={resolvedTheme}
      />
      <ScrollRestoration />
      <Outlet />
    </>
  )
}

export default App
