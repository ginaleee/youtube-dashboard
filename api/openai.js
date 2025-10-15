import OpenAI from "openai";
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  const { system, user } = req.body;
  const completion = await client.chat.completions.create({
    model: "gpt-5",
    messages: [
      { role: "system", content: system },
      { role: "user", content: user }
    ],
  });
  const html = completion.choices?.[0]?.message?.content || '';
  res.json({ html });
}
