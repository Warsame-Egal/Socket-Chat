import { Socket } from "socket.io-client";
import Chat from "../Chat";

interface Props {
  socket: Socket | null;
  username: string;
  room: string;
  setUsername: (name: string) => void;
  setRoom: (room: string) => void;
  showChat: boolean;
  joinRoom: () => void;
  leaveRoom: () => void;
}

const ChatWindow = ({
  socket,
  username,
  room,
  setUsername,
  setRoom,
  showChat,
  joinRoom,
  leaveRoom,
}: Props) => {
  return !showChat ? (
    <div className="w-full max-w-sm flex flex-col justify-center items-center text-center space-y-4 bg-white text-gray-800 rounded-xl py-8 px-6 shadow-lg">
      <h1 className="text-3xl font-bold mb-4">Welcome to Socket-Chat</h1>
      <input
        type="text"
        placeholder="Your nickname"
        onChange={(e) => setUsername(e.target.value)}
        value={username}
        className="outline-none text-black p-3 rounded-md w-full bg-gray-100 placeholder-gray-500"
      />
      <input
        type="text"
        placeholder="Room ID"
        onChange={(e) => setRoom(e.target.value)}
        value={room}
        className="outline-none text-black p-3 rounded-md w-full bg-gray-100 placeholder-gray-500"
      />
      <button
        onClick={joinRoom}
        className="p-3 bg-blue-500 hover:bg-blue-700 rounded-md font-medium w-full text-white transition"
      >
        Join a Room
      </button>
    </div>
  ) : (
    socket && (
      <Chat socket={socket} username={username} room={room} onLeave={leaveRoom} />
    )
  );
};

export default ChatWindow;