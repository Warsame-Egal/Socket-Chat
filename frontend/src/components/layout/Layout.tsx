import Header from "./Header";
import Sidebar from "./Sidebar";
import { useState } from "react";

interface Props {
  children: React.ReactNode;
  onLogout: () => void;
  onSelectRoom: (room: string) => void;
  activeRoom: string;
}

const Layout = ({ children, onLogout, onSelectRoom, activeRoom }: Props) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="relative flex flex-col md:flex-row bg-gradient-to-br from-sky-50 to-blue-100 w-full h-screen">
      <Header onLogout={onLogout} onToggleSidebar={() => setSidebarOpen((o) => !o)} />
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-10 md:hidden"
        />
      )}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar onSelect={onSelectRoom} activeRoom={activeRoom} open={sidebarOpen} />
        <div className="flex-1 flex items-center justify-center overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;