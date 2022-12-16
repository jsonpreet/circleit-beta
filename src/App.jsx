import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/protected";
import { Circle } from "./pages/Circle";
import { CircleSettings } from "./pages/CircleSettings";
import { CreatePost } from "./pages/Create";
import { Home } from "./pages/Home";
import { Following } from "./pages/Following";
import { Post } from "./pages/Post";
import { Profile } from "./pages/Profile";
import RedirectRoute from "./pages/RedirectRoute";
import { SignUp } from "./pages/SignUp";
import MemPoolState from "../src/MemoryPool/MemPoolState"
import GlobalState from "./utils/GlobalContext/GlobalState";
function App() {
  return (
    <>
    <MemPoolState>
      <GlobalState>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/following' element={<Following/>} />
          <Route path='/' element={<Home/>} />
          <Route path='/sign-up' element={<SignUp/>} />
       
          <Route path='/hot' element={<Home />} />
          <Route path='/circle' element={<RedirectRoute />} />
          <Route path='/u' element={<RedirectRoute />} />
          <Route path='circle/:circle' element={<Circle />} />
          <Route path='/u/:username' element={<Profile />} />
          <Route path='/circle/:circle/:postID' element={<Post />} />
          <Route path='/u/:circle/:postID' element={<Post />} />
          <Route path='/circle/:circle/settings' element={<ProtectedRoute><CircleSettings /></ProtectedRoute>} />
          <Route path='/circle/:circle/create/:type' element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
          <Route path='/u/:username/settings' element={<ProtectedRoute><CircleSettings /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
      </GlobalState>
      </MemPoolState>
    </>
  );
}

export default App;
