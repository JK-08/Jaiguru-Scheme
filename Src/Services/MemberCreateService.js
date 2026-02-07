// services/MemberService.js

export const createMember = async (payload) => {
  try {
    const response = await fetch("https://scheme.jaigurujewellers.com/api/v1/member/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      // handle HTTP errors
      const errorText = await response.text();
      throw new Error(errorText || "Failed to create member");
    }

    const data = await response.json();
    return data; // the response JSON you shared
  } catch (error) {
    console.error("Error creating member:", error);
    throw error;
  }
};
