import {API_BASE_URL} from "../Config/BaseUrl";

export async function fetchTodayRate({ signal } = {}) {
  const response = await fetch(`${API_BASE_URL}/account/todayrate`, {
    method: "GET",
    headers: {
      "Accept": "application/json",
    },
    signal,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Failed to fetch today rate (${response.status}): ${text}`
    );
  }

  const data = await response.json();

  // Expected:
  // {
  //   SILVERRATE: number,
  //   GOLDRATE: number
  // }

  return data;
}
