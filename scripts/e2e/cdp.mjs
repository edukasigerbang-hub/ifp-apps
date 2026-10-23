const DEFAULT_TIMEOUT_MS = 15_000;

export async function connect(webSocketUrl) {
  const socket = new WebSocket(webSocketUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", () => reject(new Error("Koneksi CDP gagal.")), {
      once: true
    });
  });

  let nextId = 0;
  const pending = new Map();

  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) {
        reject(new Error(`${message.error.message} (${message.error.code})`));
      } else {
        resolve(message.result);
      }
    }
  });

  socket.addEventListener("close", () => {
    for (const { reject } of pending.values()) {
      reject(new Error("Koneksi CDP ditutup."));
    }
    pending.clear();
  });

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++nextId;
      pending.set(id, { resolve, reject });
      socket.send(JSON.stringify({ id, method, params }));
    });
  }

  await send("Runtime.enable");
  await send("Page.enable");

  async function evaluate(expression, { timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
    const result = await send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
      userGesture: true
    });
    if (result.exceptionDetails) {
      const detail =
        result.exceptionDetails.exception?.description ??
        result.exceptionDetails.text ??
        "Evaluasi gagal.";
      throw new Error(detail);
    }
    if (result.result?.subtype === "error") {
      throw new Error(result.result.description ?? "Evaluasi mengembalikan error.");
    }
    return result.result?.value;
  }

  async function waitFor(expression, { timeoutMs = DEFAULT_TIMEOUT_MS, label } = {}) {
    const startedAt = Date.now();
    let lastError;
    while (Date.now() - startedAt < timeoutMs) {
      try {
        if (await evaluate(expression)) {
          return;
        }
      } catch (error) {
        lastError = error;
      }
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
    const suffix = lastError ? ` (error terakhir: ${lastError.message})` : "";
    throw new Error(`Timeout menunggu ${label ?? expression}${suffix}`);
  }

  async function screenshot(filePath) {
    const { data } = await send("Page.captureScreenshot", { format: "png" });
    const { writeFile } = await import("node:fs/promises");
    await writeFile(filePath, Buffer.from(data, "base64"));
  }

  return { send, evaluate, waitFor, screenshot, close: () => socket.close() };
}

export async function fetchTargets(port) {
  const response = await fetch(`http://127.0.0.1:${port}/json/list`);
  if (!response.ok) {
    throw new Error(`CDP /json/list mengembalikan ${response.status}.`);
  }
  return response.json();
}
