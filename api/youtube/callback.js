import { google } from "googleapis";

export default async function handler(req, res) {
  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).send("❌ Missing authorization code");
    }

    console.log("Received auth code:", code.slice(0, 15) + "...");

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.OAUTH_REDIRECT_URI
    );

    // ✅ Exchange authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    if (!tokens || !tokens.access_token) {
      throw new Error("Failed to retrieve access token");
    }

    oauth2Client.setCredentials(tokens);

    // ✅ Verify token with a quick YouTube call
    const youtube = google.youtube({ version: "v3", auth: oauth2Client });
    const response = await youtube.channels.list({
      mine: true,
      part: "snippet,contentDetails,statistics",
    });

    const channels = response.data.items?.map((ch) => ({
      id: ch.id,
      title: ch.snippet.title,
      subs: ch.statistics.subscriberCount,
    }));

    console.log("OAuth success. Channels:", channels);

    // ✅ Respond nicely in browser
    res.status(200).send(`
      <h2>✅ YouTube OAuth Success!</h2>
      <p>Authorized ${channels.length} channel(s):</p>
      <ul>${channels.map((c) => `<li>${c.title}</li>`).join("")}</ul>
      <p>You can now close this tab and return to the dashboard.</p>
    `);
  } catch (err) {
    console.error("OAuth callback error:", err);
    res
      .status(500)
      .send(`❌ OAuth callback failed: ${err.message || "Unknown error"}`);
  }
}
