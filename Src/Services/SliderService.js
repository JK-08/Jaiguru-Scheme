import { API_BASE_URL } from "../Config/BaseUrl";

const SLIDER_API = `${API_BASE_URL}/schemeslider/all`;

export async function fetchSchemeSliders({ signal } = {}) {
  const response = await fetch(SLIDER_API, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    signal,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Failed to fetch scheme sliders (${response.status}): ${text}`
    );
  }

  const data = await response.json();

  // Expected response:
  // {
  //   sliders: [...]
  // }

  return data.sliders;
}
