import { callOpenAI } from "../lib/flip-core.mjs";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      res.setHeader("allow", "POST");
      return res.status(405).json({ error: "只支持 POST。" });
    }

    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const worry = String(body.worry || "").trim();
    if (!worry) return res.status(400).json({ error: "请输入烦心事。" });
    if (worry.length > 800) return res.status(400).json({ error: "先控制在 800 字以内。" });

    return res.status(200).json(await callOpenAI(worry));
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "翻面失败了。请稍后再试，或检查 OPENAI_API_KEY / OPENAI_MODEL。",
      detail: error.message,
    });
  }
}
