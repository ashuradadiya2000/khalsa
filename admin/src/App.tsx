import { useDispatch, useSelector } from "react-redux";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";


import AppLayout from "./layout/AppLayout";
import { RootState } from "./store/reducers";

import { ScrollToTop } from "./components/common/ScrollToTop";

import Blank from "./pages/Blank";
import SignIn from "./pages/AuthPages/SignIn";
// import SignUp from "./pages/AuthPages/SignUp";
import VideoPlaylist from "./pages/VideoPlaylist/VideoPlaylist";
import ManagePlaylist from "./pages/ManagePlaylist/ManagePlaylist";
import Audio from "./pages/Audio/Audio";

import { authStorage } from "./utils/login";
import { useEffect } from "react";
import { AuthActionTypes } from "./store/reducers/auth";
import ProfileAvtar from "./pages/ProfileAvtar/ProfileAvtar";
import Users from "./pages/Users/Users";
import Games from "./pages/Games/Games";

export default function App() {
  const dispatch = useDispatch()
  const { authenticated } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    if (!authStorage.authToken) {
      dispatch({
        type: AuthActionTypes.AUTH_FAILURE
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {authenticated && authStorage.authToken ?
            <Route element={<AppLayout />}>
              <Route path="/" element={<Blank />} />
              <Route index path="/dashboard" element={<Blank />} />
              <Route path="/video-playlist" element={<VideoPlaylist />} />
              <Route path="/video-playlist/:id" element={<ManagePlaylist />} />
              <Route path="/audio-playlist" element={<Audio />} />
              <Route path="/users" element={<Users />} />
              <Route path="/profile-picture" element={<ProfileAvtar />} />
              <Route path="/games" element={<Games />} />
              <Route path="*" element={<Navigate to='/dashboard' />} />
            </Route>
            :
            <Route path="/signin" element={<SignIn />} />}
          {/* Fallback Route */}
          <Route path="*" element={<Navigate to='/signin' />} />
        </Routes>
      </Router>
    </>
  );
}
