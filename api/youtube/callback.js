import { google } from "googleapis";

export default async function handler(req, res) {
  try {
    const code = req.query.code;

    if (!code) {
      return res.status(400).send("Missing authorization code");
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.OAUTH_REDIRECT_URI
    );

    // ✅ Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // ✅ Fetch the user’s YouTube channel list
    const youtube = google.youtube({ version: "v3", auth: oauth2Client });
    const response = await youtube.channels.list({
      mine: true,
      part: "snippet,contentDetails,statistics",
    });

    // ✅ Respond with success + channel summary
    res.status(200).json({
      message: "OAuth success",
      tokens,
      channels: response.data.items.map((ch) => ({
        id: ch.id,
        title: ch.snippet.title,
      })),
    });
  } catch (error) {
    console.error("OAuth callback error:", error.response?.data || error.message);
    res.status(500).send(`OAuth callback failed: ${error.message}`);
  }
}
