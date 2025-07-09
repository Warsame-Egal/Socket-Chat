import ChatList from "../ChatList";

interface Props {
  onSelect: (room: string) => void;
  activeRoom: string;
  open: boolean;
}

const Sidebar = ({ onSelect, activeRoom, open }: Props) => {
  return <ChatList onSelect={onSelect} activeRoom={activeRoom} open={open} />;
};

export default Sidebar;