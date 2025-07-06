import Header from "./Header";
import Sidebar from "./Sidebar";

interface Props {
  children: React.ReactNode;
  onLogout: () => void;
  onSelectRoom: (room: string) => void;
  activeRoom: string;
}

const Layout = ({ children, onLogout, onSelectRoom, activeRoom }: Props) => {
  return (
    <div className="relative flex bg-[url('/src/assets/chat.jpg')] bg-no-repeat bg-cover w-full h-screen">
      <Header onLogout={onLogout} />
      <div className="flex w-full">
        <Sidebar onSelect={onSelectRoom} activeRoom={activeRoom} />
        <div className="flex-1 flex items-center justify-center">{children}</div>
      </div>
    </div>
  );
};

export default Layout;