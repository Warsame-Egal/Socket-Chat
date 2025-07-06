import ChatList from "../ChatList";

interface Props {
  onSelect: (room: string) => void;
  activeRoom: string;
}

const Sidebar = ({ onSelect, activeRoom }: Props) => {
  return <ChatList onSelect={onSelect} activeRoom={activeRoom} />;
};

export default Sidebar;