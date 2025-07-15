import { useTheme } from "next-themes"
import { Outlet, ScrollRestoration } from "react-router"
import { Toaster } from "sonner"

function App() {
  const { resolvedTheme } = useTheme();

  return (
    <>
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
