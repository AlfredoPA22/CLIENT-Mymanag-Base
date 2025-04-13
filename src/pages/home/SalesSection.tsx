import ReportByCategory from "./ReportByCategory";
import ReportByMonth from "./ReportByMonth";

const SalesSection = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
      <ReportByMonth />
      <ReportByCategory />
    </div>
  );
};

export default SalesSection;
