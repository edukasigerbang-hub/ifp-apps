import { createServer } from "node:http";

const port = Number(process.env.MOCK_SYNC_PORT ?? 8787);
const token = process.env.MOCK_SYNC_TOKEN ?? "dev-token";

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, { "content-type": "application/json" });
  response.end(JSON.stringify(body));
}

const server = createServer(async (request, response) => {
  response.setHeader("access-control-allow-origin", "*");
  response.setHeader("access-control-allow-headers", "authorization,content-type");
  response.setHeader("access-control-allow-methods", "GET,POST,OPTIONS");

  if (request.method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }

  if (request.method === "GET" && request.url === "/health") {
    sendJson(response, 200, { ok: true });
    return;
  }

  if (request.method !== "POST" || request.url !== "/v1/sync/events") {
    sendJson(response, 404, { error: { code: "NOT_FOUND" } });
    return;
  }

  if (request.headers.authorization !== `Bearer ${token}`) {
    sendJson(response, 401, { error: { code: "SYNC_UNAUTHORIZED" } });
    return;
  }

  let raw = "";
  for await (const chunk of request) {
    raw += chunk;
  }

  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    sendJson(response, 400, { error: { code: "SYNC_INVALID_BODY" } });
    return;
  }

  if (
    !body ||
    typeof body.deviceId !== "string" ||
    body.schemaVersion !== "1.0.0" ||
    !Array.isArray(body.events) ||
    body.events.length === 0 ||
    body.events.length > 100
  ) {
    sendJson(response, 400, { error: { code: "SYNC_INVALID_BATCH" } });
    return;
  }

  const acknowledgements = body.events.map((event) => {
    if (!event || typeof event.eventId !== "string" || typeof event.eventType !== "string") {
      return { eventId: String(event?.eventId ?? "unknown"), status: "rejected", errorCode: "SYNC_INVALID_EVENT" };
    }
    return { eventId: event.eventId, status: "accepted" };
  });

  console.log(`ack ${acknowledgements.length} event(s) from ${body.deviceId}`);
  sendJson(response, 200, { acknowledgements });
});

server.listen(port, () => {
  console.log(`mock sync server listening on http://localhost:${port}`);
});
