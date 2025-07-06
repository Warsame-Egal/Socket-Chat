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
    <div className="relative flex flex-col md:flex-row bg-gradient-to-br from-sky-50 to-blue-100 w-full h-screen">
      <Header onLogout={onLogout} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar onSelect={onSelectRoom} activeRoom={activeRoom} />
        <div className="flex-1 flex items-center justify-center overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;