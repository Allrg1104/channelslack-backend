import axios from "axios";

export const createChannel = async (token, name, is_private) => {
  const res = await axios.post(
    "https://slack.com/api/conversations.create",
    { name, is_private },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!res.data.ok) {
    throw new Error(`Slack error: ${res.data.error}`);
  }

  return res.data.channel;
};
