interface Props {
  onLogout: () => void;
}

const Header = ({ onLogout }: Props) => {
  return (
    <header className="absolute top-4 right-4">
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