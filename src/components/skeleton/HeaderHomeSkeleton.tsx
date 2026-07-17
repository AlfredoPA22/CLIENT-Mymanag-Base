const HeaderHomeSkeleton = () => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-slate-100 border-t-4 border-t-slate-200 p-4 flex flex-col gap-3 bg-white shadow-sm animate-pulse"
        >
          <div className="w-11 h-11 rounded-xl bg-gray-200" />
          <div>
            <div className="h-6 w-16 bg-gray-300 rounded mb-2" />
            <div className="h-2.5 w-20 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default HeaderHomeSkeleton;
