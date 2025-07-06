import { useEffect, useState } from "react";

const VITE_SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

interface LatestMessage {
  message: string;
  author: string;
  time: string;
}

interface Room {
  id: number;
  name: string;
  created_at: string;
  latestMessage?: LatestMessage | null;
}

interface Props {
  onSelect: (room: string) => void;
  activeRoom: string;
}

const ChatList = ({ onSelect, activeRoom }: Props) => {
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${VITE_SERVER_URL}/rooms/latest`, {
      credentials: "include",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(res.statusText);
        }
        return res.json();
      })
      .then((data) => setRooms(data))
      .catch((err) => console.error("Failed to load rooms", err));
  }, []);

  return (
    <div className="w-full md:w-64 bg-gray-800 text-white md:h-screen p-4 overflow-y-auto flex-shrink-0">
      <h2 className="text-lg font-bold mb-4">Rooms</h2>
      <ul className="space-y-2">
        {rooms.map((room) => (
          <li
            key={room.id}
            onClick={() => onSelect(room.name)}
            className={`cursor-pointer p-2 rounded transition-colors ${
              activeRoom === room.name ? 'bg-blue-600' : 'hover:bg-gray-700'
            }`}
          >
            <div className="font-semibold">{room.name}</div>
            <div className="text-sm text-gray-300 truncate">
              {room.latestMessage
                ? `${room.latestMessage.author}: ${room.latestMessage.message}`
                : "No messages yet"}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatList;