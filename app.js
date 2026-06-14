import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { callOpenAI } from "./lib/flip-core.mjs";

const root = new URL(".", import.meta.url).pathname;

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8",
};

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

function getStaticPath(url) {
  const { pathname } = new URL(url, "https://fanmian.local");
  const requested = pathname === "/" ? "/index.html" : pathname;
  const safePath = normalize(decodeURIComponent(requested)).replace(/^(\.\.[/\\])+/, "");
  return join(root, safePath);
}

async function serveStatic(req, res) {
  const filePath = getStaticPath(req.url || "/");
  try {
    const file = await readFile(filePath);
    res.statusCode = 200;
    res.setHeader("content-type", mimeTypes[extname(filePath)] || "application/octet-stream");
    res.setHeader("cache-control", "no-store");
    res.end(file);
  } catch {
    res.statusCode = 404;
    res.setHeader("content-type", "text/plain; charset=utf-8");
    res.end("Not found");
  }
}

export default async function handler(req, res) {
  try {
    if (req.method === "POST" && req.url === "/api/flip") {
      const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
      const worry = String(body.worry || "").trim();
      if (!worry) return sendJson(res, 400, { error: "请输入烦心事。" });
      if (worry.length > 800) return sendJson(res, 400, { error: "先控制在 800 字以内。" });
      return sendJson(res, 200, await callOpenAI(worry));
    }

    if (req.method !== "GET" && req.method !== "HEAD") {
      res.setHeader("allow", "GET, HEAD, POST");
      return sendJson(res, 405, { error: "不支持这个请求。" });
    }

    return serveStatic(req, res);
  } catch (error) {
    console.error(error);
    return sendJson(res, 500, {
      error: "翻面失败了。请稍后再试，或检查 OPENAI_API_KEY / OPENAI_MODEL。",
      detail: error.message,
    });
  }
}
