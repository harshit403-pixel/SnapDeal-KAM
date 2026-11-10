import { API_BASE_URL } from "../../../app/config.js";

export async function getSeller() {
  const response = await fetch(`${API_BASE_URL}/seller`);
  if (!response.ok) throw new Error("Unable to load seller overview.");
  return response.json();
}
