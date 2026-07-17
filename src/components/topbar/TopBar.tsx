import SearchAndNotifications from "./SearchAndNotifications";

const TopBar = () => (
  <div className="hidden md:flex items-center justify-end gap-2 px-4 py-2 border-b border-gray-100 bg-white">
    <SearchAndNotifications />
  </div>
);

export default TopBar;
