import { Outlet, ScrollRestoration } from "react-router"

function App() {
  return (
    <>
      <ScrollRestoration />
      <Outlet />
    </>
  )
}

export default App
