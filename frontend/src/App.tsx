import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Auth from "./components/Auth";
import ChatRoute from "./routes/ChatRoute";
import { getTokenExpiration } from "./token";

const VITE_SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

function App() {
  const [authenticated, setAuthenticated] = useState<boolean>(() => {
    const token = localStorage.getItem("token");
    if (!token) return false;
    const exp = getTokenExpiration(token);
    if (!exp || Date.now() >= exp) {
      localStorage.removeItem("token");
      return false;
    }
    return true;
  });
  const [socket, setSocket] = useState<Socket | null>(null);
  const [logoutTimer, setLogoutTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);
  
  const leaveRoom = async () => {
    if (socket && room) {
      socket.emit("leave_room", { room, username });
      await fetch(`${VITE_SERVER_URL}/rooms/${room}/leave`, {
        method: "POST",
        credentials: "include",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }).catch(() => {});
      setShowChat(false);
      setRoom("");
    }
  };

  const logout = async () => {
    await fetch(`${VITE_SERVER_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    localStorage.removeItem("token");
    setAuthenticated(false);
    setShowChat(false);
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
  };

  useEffect(() => {
    if (!authenticated) {
      if (logoutTimer) {
        clearTimeout(logoutTimer);
        setLogoutTimer(null);
      }
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      logout();
      return;
    }

    const exp = getTokenExpiration(token);
    if (!exp || Date.now() >= exp) {
      logout();
      return;
    }

    const timer = setTimeout(logout, exp - Date.now());
    setLogoutTimer(timer);
    return () => clearTimeout(timer);
  }, [authenticated]);

  useEffect(() => {
    if (authenticated) {
      const token = localStorage.getItem("token") || "";
      const newSocket = io(VITE_SERVER_URL, { auth: { token } });
      setSocket(newSocket);
      return () => {
        newSocket.disconnect();
      };
    }
  }, [authenticated]);

  const handleSelectRoom = (name: string, navigate?: (path: string) => void) => {
    setRoom(name);
    if (username && socket) {
      socket.emit("join_room", { room: name, username });
      setShowChat(true);
    }
    if (navigate) navigate(`/chat/${name}`);
  };

  const joinRoom = (navigate?: (path: string) => void) => {
    if (username !== "" && room !== "" && socket) {
      handleSelectRoom(room, navigate);
    }
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            authenticated ? (
              <Navigate to="/chat" replace />
            ) : (
              <div className="px-8 flex items-center justify-center bg-gradient-to-br from-sky-50 to-blue-100 w-full h-screen">                <Auth onAuthSuccess={() => setAuthenticated(true)} />
              </div>
            )
          }
        />
        <Route
          path="/chat/:roomId"
          element={
            authenticated ? (
              <ChatRoute
                socket={socket}
                username={username}
                room={room}
                setUsername={setUsername}
                setRoom={setRoom}
                showChat={showChat}
                joinRoom={joinRoom}
                logout={logout}
                handleSelectRoom={handleSelectRoom}
                leaveRoom={leaveRoom}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }        />
        <Route
          path="/chat"
          element={
            authenticated ? (
              <ChatRoute
                socket={socket}
                username={username}
                room={room}
                setUsername={setUsername}
                setRoom={setRoom}
                showChat={showChat}
                joinRoom={joinRoom}
                logout={logout}
                handleSelectRoom={handleSelectRoom}
                leaveRoom={leaveRoom}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }        />
        <Route
          path="*"
          element={<Navigate to={authenticated ? "/chat" : "/login"} replace />}
        />
      </Routes>
    </Router>
  );
}

export default App;