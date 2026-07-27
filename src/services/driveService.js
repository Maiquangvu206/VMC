/**
 * Tải ảnh lên Google Drive qua Apps Script Web App
 * @param {File} file - File ảnh từ input
 * @param {Object} user - Thông tin người dùng { userCode, userName }
 * @returns {Promise<Object>} Trả về { status, fileUrl, fileId, folderName, fileName }
 */
export const uploadSubmissionImage = async (file, user = {}) => {
  const scriptUrl = "https://script.google.com/macros/s/AKfycbypy0d7FJQX3i1uEpSR1MhavE_4IzZUyQdduzXX_7Y-mw3his8ah10WLOjY25U_XK2_dg/exec";

  // Chuyển File sang Base64
  const base64Data = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result.split(",")[1];
      resolve(result);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });

  const payload = {
    userCode: user.userCode || "VMC",
    userName: user.userName || "ThanhVien",
    fileName: file.name,
    mimeType: file.type,
    base64: base64Data,
  };

  try {
    const response = await fetch(scriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (data.status === "success") {
      return data;
    } else {
      throw new Error(data.message || "Lỗi khi upload ảnh lên Drive");
    }
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};
