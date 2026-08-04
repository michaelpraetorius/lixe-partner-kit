/**
 * lixe SSO-Demo (Variante B) – Node, ohne externe Abhängigkeiten.
 *
 * Start:  node server.js   →   http://localhost:3000
 *
 * Tut so, als wäre „anna@example.com“ bei dir angemeldet, holt serverseitig ein
 * lixe-Token und bettet den Player damit ein. Der geheime Schlüssel bleibt hier
 * auf dem Server; in den Browser geht nur das Token (im #-Fragment).
 */
"use strict";

const http = require("http");
const https = require("https");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

// --- Minimaler .env-Leser (nur fürs Beispiel) ---
function loadEnv() {
  const env = {};
  const file = path.join(__dirname, "..", "..", ".env");
  if (fs.existsSync(file)) {
    for (const line of fs.readFileSync(file, "utf8").split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#") || !t.includes("=")) continue;
      const i = t.indexOf("=");
      env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
    }
  }
  return env;
}
const ENV = loadEnv();
const APP_URL = (ENV.LIXE_APP_URL || "https://app.lixe.de").replace(/\/+$/, "");
const EMBED_KEY = ENV.LIXE_EMBED_KEY || "";
const SECRET_KEY = ENV.LIXE_SECRET_KEY || "";

function base64url(buf) {
  return Buffer.from(buf).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// Holt ein Player-Token für eine Person → fertige iframe-Adresse (mit #t=TOKEN).
function lixePlayerUrl(person) {
  return new Promise((resolve, reject) => {
    if (!EMBED_KEY || !SECRET_KEY) {
      return reject(new Error("LIXE_EMBED_KEY und LIXE_SECRET_KEY müssen in .env stehen."));
    }
    const payload = base64url(JSON.stringify({
      email: person.email,
      name: person.name || "",
      exp: Math.floor(Date.now() / 1000) + 120,
    }));
    const sig = crypto.createHmac("sha256", SECRET_KEY).update("sso:" + payload).digest("hex");
    const body = JSON.stringify({ k: EMBED_KEY, payload, sig });

    const url = new URL(APP_URL + "/api/partner/session");
    const req = https.request(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json", "Content-Length": Buffer.byteLength(body) },
      timeout: 10000,
    }, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        let json = {};
        try { json = JSON.parse(data); } catch (e) {}
        if (res.statusCode !== 200 || !json.token) {
          return reject(new Error("lixe-Anmeldung fehlgeschlagen (HTTP " + res.statusCode + "): " + data));
        }
        resolve(APP_URL + "/einbetten/app?k=" + encodeURIComponent(EMBED_KEY) + "#t=" + encodeURIComponent(json.token));
      });
    });
    req.on("error", reject);
    req.on("timeout", () => req.destroy(new Error("Zeitüberschreitung")));
    req.end(body);
  });
}

const server = http.createServer(async (req, res) => {
  if (req.url !== "/") { res.writeHead(404).end("Not found"); return; }

  // 👉 In echt: die bei DIR angemeldete Person aus deiner Session.
  const person = { email: "anna@example.com", name: "Anna Beispiel" };

  let playerUrl = null, fehler = null;
  try { playerUrl = await lixePlayerUrl(person); }
  catch (e) { fehler = e.message; }

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const inhalt = fehler
    ? `<p style="background:#fdecec;color:#a11;border-radius:12px;padding:14px 16px">
         <strong>Konnte lixe nicht laden:</strong> ${esc(fehler)}</p>`
    : `<div style="max-width:420px;margin:24px auto">
         <div style="position:relative;width:100%;padding-bottom:177.78%">
           <iframe src="${esc(playerUrl)}" style="position:absolute;inset:0;width:100%;height:100%;border:0"
                   allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowfullscreen title="lixe Player"></iframe>
         </div>
       </div>`;

  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(`<!DOCTYPE html><html lang="de"><head><meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Beispiel-Partnerseite · lixe nahtlos (Node)</title>
    <style>:root{color-scheme:light dark}body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;max-width:860px;margin:0 auto;padding:32px 20px;line-height:1.6}</style>
    </head><body>
    <h1>Hallo ${esc(person.name)} 👋</h1>
    <p>Du bist bei uns angemeldet – und damit auch bei lixe. Kein zweiter Login.</p>
    ${inhalt}
    <footer style="margin-top:48px;font-size:13px;opacity:.7">powered by lixe · hello@lixe.de</footer>
    </body></html>`);
});

server.listen(3000, () => console.log("lixe SSO-Demo läuft auf http://localhost:3000"));
