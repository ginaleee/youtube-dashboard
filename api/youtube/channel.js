import { google } from 'googleapis';

export default async function handler(req, res) {
  const token = req.headers.cookie?.split('yt_token=')[1];
  if (!token) return res.status(401).json({ error: 'No token' });

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: token });

  const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
  const resp = await youtube.channels.list({
    mine: true,
    part: 'id,snippet'
  });

  const items = resp.data.items.map(ch => ({
    id: ch.id,
    title: ch.snippet.title
  }));

  res.json({ items });
}
