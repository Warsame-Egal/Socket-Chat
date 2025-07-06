import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useNavigate } from "react-router-dom";
import Auth from "./components/Auth";
import Layout from "./components/layout/Layout";
import ChatWindow from "./components/layout/ChatWindow";

const VITE_SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

function App() {
  const [authenticated, setAuthenticated] = useState<boolean>(!!localStorage.getItem("token"));
  const [socket, setSocket] = useState<Socket | null>(null);
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);

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

  const ChatRoute = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
      if (roomId) {
        setRoom(roomId);
      }
    }, [roomId]);

    return (
      <Layout onLogout={logout} onSelectRoom={(name) => handleSelectRoom(name, navigate)} activeRoom={room}>
        <ChatWindow
          socket={socket}
          username={username}
          room={room}
          setUsername={setUsername}
          setRoom={setRoom}
          showChat={showChat}
          joinRoom={() => joinRoom(navigate)}
        />
      </Layout>
    );
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
              <div className="px-8 flex items-center justify-center bg-[url('/src/assets/chat.jpg')] bg-no-repeat bg-cover w-full h-screen">
                <Auth onAuthSuccess={() => setAuthenticated(true)} />
              </div>
            )
          }
        />
        <Route
          path="/chat/:roomId"
          element={authenticated ? <ChatRoute /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/chat"
          element={authenticated ? <ChatRoute /> : <Navigate to="/login" replace />}
        />
        <Route
          path="*"
          element={<Navigate to={authenticated ? "/chat" : "/login"} replace />}
        />
      </Routes>
    </Router>
  );
}

export default App;