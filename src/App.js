import { Outlet } from "react-router-dom";

const App = () => {
  return(
    <div className='App'>
      <h3>hello world</h3>
      <Outlet />
    </div>
  )
}

export default App
