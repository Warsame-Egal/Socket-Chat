import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Socket } from "socket.io-client";
import Layout from "../components/layout/Layout";
import ChatWindow from "../components/layout/ChatWindow";

interface Props {
  socket: Socket | null;
  username: string;
  room: string;
  setUsername: (name: string) => void;
  setRoom: (room: string) => void;
  showChat: boolean;
  joinRoom: (navigate?: (path: string) => void) => void;
  logout: () => void;
  handleSelectRoom: (name: string, navigate?: (path: string) => void) => void;
  leaveRoom: () => void;
}

const ChatRoute = ({
  socket,
  username,
  room,
  setUsername,
  setRoom,
  showChat,
  joinRoom,
  logout,
  handleSelectRoom,
  leaveRoom,
}: Props) => {
  const { roomId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (roomId) {
      setRoom(roomId);
    }
  }, [roomId, setRoom]);

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
        leaveRoom={leaveRoom}
      />
    </Layout>
  );
};

export default ChatRoute;