import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { callOpenAI } from "./lib/flip-core.mjs";

const root = new URL(".", import.meta.url).pathname;
const port = Number(process.env.PORT || 4188);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8",
};

function sendJson(res, status, body) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

async function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname === "/" ? "/index.html" : url.pathname;
  const safePath = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, "");
  const filePath = join(root, safePath);
  try {
    const file = await readFile(filePath);
    res.writeHead(200, {
      "content-type": mimeTypes[extname(filePath)] || "application/octet-stream",
      "cache-control": "no-store",
    });
    res.end(file);
  } catch {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
}

const server = createServer(async (req, res) => {
  try {
    if (req.method === "POST" && req.url === "/api/flip") {
      const body = JSON.parse(await readBody(req));
      const worry = String(body.worry || "").trim();
      if (!worry) return sendJson(res, 400, { error: "请输入烦心事。" });
      if (worry.length > 800) return sendJson(res, 400, { error: "先控制在 800 字以内。" });
      return sendJson(res, 200, await callOpenAI(worry));
    }

    return serveStatic(req, res);
  } catch (error) {
    console.error(error);
    return sendJson(res, 500, {
      error: "翻面失败了。请稍后再试，或检查 OPENAI_API_KEY / OPENAI_MODEL。",
      detail: error.message,
    });
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log(`翻面已启动：http://localhost:${port}`);
  console.log(`同一 Wi-Fi 手机访问：用本机局域网 IP + :${port}`);
});
