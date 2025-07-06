// Main application component containing authentication logic
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import Chat from "./components/Chat";
import Auth from "./components/Auth";
import ChatList from "./components/ChatList";

// Base URL for the backend API
const VITE_SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

function App() {
  const [authenticated, setAuthenticated] = useState<boolean>(!!localStorage.getItem("token"));
  const [socket, setSocket] = useState<Socket | null>(null);
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);

  // Join a room helper used by sidebar
  const handleSelectRoom = (name: string) => {
    setRoom(name);
    if (username && socket) {
      socket.emit("join_room", { room: name, username });
      setShowChat(true);
    }
  };
    // Log the user out and reset state
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

    // Connect to the WebSocket server when authenticated
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

  // Join the specified chat room
  const joinRoom = () => {
    if (username !== "" && room !== "" && socket) {
      handleSelectRoom(room);
    }
  };

    if (!authenticated) {
    return (
      <div className="px-8 flex items-center justify-center bg-[url('/src/assets/chat.jpg')] bg-no-repeat bg-cover w-full h-screen">
        <Auth onAuthSuccess={() => setAuthenticated(true)} />
      </div>
    );
  }


  return (
    <div className="relative flex bg-[url('/src/assets/chat.jpg')] bg-no-repeat bg-cover w-full h-screen">
      <button
        onClick={logout}
        className="absolute top-4 right-4 p-2 bg-red-500 hover:bg-red-700 rounded-md text-white"
      >
        Logout
      </button>
      <div className="flex w-full">
        <ChatList onSelect={handleSelectRoom} activeRoom={room} />
        <div className="flex-1 flex items-center justify-center">
          {!showChat ? (
            <div className="w-fit flex flex-col justify-center items-center text-center space-y-4 bg-white text-black rounded-xl py-8 px-6 shadow-lg">
              <h1 className="text-3xl font-bold mb-4">Welcome to Socket-Chat</h1>
              <input
                type="text"
                placeholder="Your nickname"
                onChange={(e) => setUsername(e.target.value)}
                value={username}
                className="outline-none text-black p-3 rounded-md w-[300px] bg-gray-100 placeholder-gray-500"
              />
              <input
                type="text"
                placeholder="Room ID"
                onChange={(e) => setRoom(e.target.value)}
                value={room}
                className="outline-none text-black p-3 rounded-md w-[300px] bg-gray-100 placeholder-gray-500"
              />
              <button
                onClick={joinRoom}
                className="p-3 bg-blue-500 hover:bg-blue-700 rounded-md font-medium w-[300px] text-white transition"
              >
                Join a Room
              </button>
            </div>
          ) : (
            socket && <Chat socket={socket} username={username} room={room} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
