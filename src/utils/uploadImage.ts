export const uploadImage = async (file: File) => {
  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", "MyManag");
  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${
        import.meta.env.VITE_CLOUDNAME
      }/image/upload`,
      {
        method: "POST",
        body: data,
      }
    );
    if (res.ok) {
      const file = await res.json();
      return file.secure_url;
    } else {
      return "";
    }
  } catch (error) {
    alert(error);
  }
};
