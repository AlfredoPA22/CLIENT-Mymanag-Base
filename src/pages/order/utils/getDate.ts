export const getDate = (date_of_order: Date | string | number) => {
    if (date_of_order) {
      const date = new Date(Number(date_of_order));
      const newDate = `${date.getDate()}/${date.toLocaleString("default", {
        month: "long",
      })}/${date.getFullYear()}`;
      return newDate;
    }
    return null;
  };