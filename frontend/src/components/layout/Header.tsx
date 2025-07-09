import { FiMenu } from "react-icons/fi";

interface Props {
  onLogout: () => void;
  onToggleSidebar: () => void;
}

const Header = ({ onLogout, onToggleSidebar }: Props) => {
  return (
    <header className="absolute top-4 right-4 right-4 flex items-center justify-between z-20">
      <button onClick={onToggleSidebar} className="md:hidden p-2 text-black">
        <FiMenu className="w-6 h-6" />
      </button>
      <button
        onClick={onLogout}
        className="p-2 bg-red-500 hover:bg-red-700 rounded-md text-white"
      >
        Logout
      </button>
    </header>
  );
};

export default Header;