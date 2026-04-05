import axios from "axios";

const TEMPLATE_SERVICE_URL =
  process.env.TEMPLATE_SERVICE_URL || "http://template-service:5006";

export async function renderTemplate({ name, channel, variables }) {
  try {
    const response = await axios.post(`${TEMPLATE_SERVICE_URL}/templates/render`, {
      name,
      channel,
      variables,
    });

    return response.data;
  } catch (err) {
    const errorMessage =
      err.response?.data?.error || err.message || "template render failed";

    throw new Error(`template render failed for ${channel}: ${errorMessage}`);
  }
}