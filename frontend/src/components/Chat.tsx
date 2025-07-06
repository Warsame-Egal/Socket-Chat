// Component that renders the chat UI and handles messages
import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import ScrollToBottom from "react-scroll-to-bottom";
import IconSendFill from "./IconSendFill";

// Props expected by the Chat component
interface Props {
  socket: Socket;
  username: string;
  room: string;
  onLeave: () => void;
}

// Shape of a message exchanged over the socket
interface Message {
  room: string;
  id: string | undefined;
  author: string;
  message: string;
  time: string;
}

interface HistoryMessage {
  author: string;
  message: string;
  time: string | Date;
}

const Chat = ({ socket, username, room, onLeave }: Props) => {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState<Message[]>([]);
  const [userList, setUserList] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  // Emit the current message to the server
  const sendMessage = async () => {
    if (currentMessage.trim() !== "") {
      const now = new Date();
      const timeString = `${now.getHours().toString().padStart(2, "0")}:${now
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
      const message: Message = {
        room,
        id: socket.id,
        author: username,
        message: currentMessage,
        time: timeString,
      };
      setMessageList((prev) => [...prev, message]);
      await socket.emit("send_message", message);
      setCurrentMessage("");
    }
  };

  // Listen for incoming messages
  useEffect(() => {
    socket.on("receive_message", (data: Message) => {
      setMessageList((prev) => [...prev, data]);
    });
    const historyHandler = (history: HistoryMessage[]) => {
      const formatted = history.map((m) => ({
        room,
        id: undefined,
        author: m.author,
        message: m.message,
        time: new Date(m.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }));
      setMessageList(formatted);
    };
    const userListHandler = (list: string[]) => {
      setUserList(list);
    };
    const typingHandler = (name: string) => {
      setTypingUsers((prev) => {
        if (prev.includes(name)) return prev;
        return [...prev, name];
      });
      setTimeout(() => {
        setTypingUsers((prev) => prev.filter((u) => u !== name));
      }, 3000);
    };
    socket.on("chat_history", historyHandler);
    socket.on("user_list", userListHandler);
    socket.on("typing", typingHandler);
    return () => {
      socket.off("receive_message");
      socket.off("chat_history", historyHandler);
      socket.off("user_list", userListHandler);
      socket.off("typing", typingHandler);
    };
  }, [socket, room]);

  return (
    <div className="w-full h-screen flex items-center justify-center px-4 sm:px-8">
      <div className="w-full max-w-3xl h-[90vh] bg-white text-black rounded-xl shadow-lg flex flex-col p-4 sm:p-6">
        {/* Header */}
        <div className="text-center font-bold text-xl border-b border-gray-300 pb-3 mb-3">
          Room: <span className="text-blue-600">{room}</span>
                    <button
            onClick={onLeave}
            className="ml-2 text-sm text-red-600 underline"
          >
            Leave
          </button>
          <div className="text-sm font-normal text-gray-500 mt-1">
            Users: {userList.join(', ')}
          </div>
        </div>

        {/* Messages */}
        <ScrollToBottom className="flex-1 overflow-y-auto pr-1">
          <div className="flex flex-col space-y-3">
            {messageList.map((message, index) => {
              if (message.author === "System") {
                return (
                  <div key={index} className="flex justify-center w-full">
                    <div className="bg-gray-200 text-gray-700 text-sm px-4 py-2 rounded-md shadow max-w-[80%] text-center">
                      <div>{message.message}</div>
                      <div className="text-xs mt-1 text-gray-500">{message.time}</div>
                    </div>
                  </div>
                );
              }

              const isOwnMessage = message.id === socket.id;
              return (
                <div
                  key={index}
                  className={`flex ${
                    isOwnMessage ? "justify-end" : "justify-start"
                  } w-full`}
                >
                  <div
                    className={`px-4 py-2 rounded-xl shadow max-w-[80%] min-w-[100px] whitespace-pre-wrap break-words ${
                      isOwnMessage
                        ? "bg-blue-600 text-white rounded-br-sm self-end"
                        : "bg-gray-200 text-black rounded-bl-sm self-start"
                    }`}
                  >
                    <div className="font-semibold text-sm mb-1">
                      {message.author}
                    </div>
                    <div className="text-base">{message.message}</div>
                    <div
                      className={`text-xs text-right mt-1 ${
                        isOwnMessage ? "text-gray-200" : "text-gray-500"
                      }`}
                    >
                      {message.time}
                    </div>
                  </div>
                </div>
              );
            })}

          </div>
        </ScrollToBottom>
        {typingUsers.length > 0 && (
          <div className="text-xs text-gray-500 mb-1 h-4">
            {typingUsers.join(', ')} {typingUsers.length > 1 ? 'are' : 'is'} typing...
          </div>
        )}

        {/* Input */}
        <div className="flex items-center mt-4 bg-gray-100 p-3 rounded-md space-x-2 border border-gray-300">
          <input
            type="text"
            placeholder="Type your message..."
            value={currentMessage}
            onChange={(e) => {
              setCurrentMessage(e.target.value);
              socket.emit("typing", { room, username });
            }}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1 bg-transparent outline-none text-black placeholder-gray-500"
          />
          <IconSendFill
            onClick={sendMessage}
            className="w-7 h-7 cursor-pointer text-blue-600 hover:text-blue-800 transition"
          />
        </div>
      </div>
    </div>
  );
};

export default Chat;