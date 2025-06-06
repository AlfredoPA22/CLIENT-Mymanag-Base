const HeaderHomeSkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="rounded-2xl p-5 flex flex-col items-center justify-center text-center bg-gray-100 animate-pulse shadow-md"
        >
          <div className="h-4 w-24 bg-gray-300 rounded mb-2" />
          <div className="h-8 w-20 bg-gray-400 rounded mb-3" />
          <div className="h-10 w-10 bg-gray-300 rounded-full mt-2" />
        </div>
      ))}
    </div>
  );
};

export default HeaderHomeSkeleton;
