import { google } from 'googleapis';

export default async function handler(req, res) {
  const { channelIds, range } = req.body;
  const token = req.headers.cookie?.split('yt_token=')[1];
  if (!token) return res.status(401).json({ error: 'No token' });

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: token });

  const ytAnalytics = google.youtubeAnalytics({ version: 'v2', auth: oauth2Client });

  const channels = [];

  for (const channelId of channelIds) {
    const { data } = await ytAnalytics.reports.query({
      ids: `channel==${channelId}`,
      startDate: range.start,
      endDate: range.end,
      metrics: 'views,watchTime,averageViewDuration,subscribersGained,impressions,impressionsCtr',
    });

    channels.push({
      id: channelId,
      metrics: data.rows?.[0] || []
    });
  }

  res.json({ channels });
}
