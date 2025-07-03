import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import Chat from "./components/Chat";
import Auth from "./components/Auth";


const VITE_SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

function App() {
  const [authenticated, setAuthenticated] = useState<boolean>(!!localStorage.getItem("token"));
  const [socket, setSocket] = useState<Socket | null>(null);
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);

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

  const joinRoom = () => {
    if (username !== "" && room !== "" && socket) {
      socket.emit("join_room", { room, username });
      setShowChat(true);
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
    <div className="px-8 flex items-center justify-center bg-[url('/src/assets/chat.jpg')] bg-no-repeat bg-cover w-full h-screen">
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
  );
}

export default App;
