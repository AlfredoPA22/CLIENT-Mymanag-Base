import SearchAndNotifications from "./SearchAndNotifications";

const getFormattedDate = () => {
  const raw = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return raw.charAt(0).toUpperCase() + raw.slice(1);
};

const TopBar = () => (
  <div className="hidden md:flex items-center justify-between gap-2 px-4 py-2 border-b border-gray-100 bg-white">
    <span className="text-sm text-gray-500">{getFormattedDate()}</span>
    <div className="flex items-center gap-2">
      <SearchAndNotifications />
    </div>
  </div>
);

export default TopBar;
