# lixe Partner-Kit

**lixe direkt auf deiner Website.** Deine Besucher:innen sehen Inhalte im
intelligenten lixe-Player – in derselben Anmutung wie die App – ohne deine Seite
zu verlassen, als wären sie auf lixe.de. Öffentliche Inhalte laufen sofort;
anmelden müssen sie sich nur, wenn du es verlangst.

Es gibt zwei Wege. Du brauchst **einen** davon.

| | **Variante A – Einbetten** | **Variante B – Nahtlos (SSO)** |
|---|---|---|
| Für wen | jede Website, ohne eigenen Server | Websites mit **eigenen Nutzerkonten** |
| Aufwand | eine Zeile HTML | ein kleiner Server-Endpunkt |
| Anmeldung | kurzes lixe-Popup | unsichtbar – wer bei dir eingeloggt ist, ist es auch bei lixe |
| Dein Schlüssel | **Einbett-Schlüssel** (öffentlich) | zusätzlich **geheimer Schlüssel** (nur auf deinem Server) |

Beide Schlüssel bekommst du von lixe (im CMS am Plattform-Partner unter
**Integration**). Nichts hier im Repo musst du kompilieren – Variante A ist reines
HTML, Variante B ein paar Zeilen PHP oder Node.

## 🔴 Live-Demo & Einrichtungsseite

Die Datei [`index.html`](index.html) ist **Vorschau und Einrichtung in einem**:
Schlüssel eintragen → Player-Vorschau sehen → fertigen Schnipsel kopieren.

Sie läuft direkt über **GitHub Pages**. Aktiviere Pages im Repo
(*Settings → Pages → Deploy from branch → `main` / root*); danach ist die Demo
öffentlich erreichbar, z. B.:

```
https://<dein-github-name>.github.io/lixe-partner-kit/
```

Das ist zugleich ein **echter Cross-Origin-Test**: Die Pages-Domain ist eine andere
als `app.lixe.de` – genau die Situation, die auch auf einer Partner-Website
herrscht. Voreingestellt ist der Schlüssel des Demo-Partners „GitHub (Demo)“, dessen
Domain-Liste die `github.io`-Adresse schon enthält. Für deinen Einsatz trägst du in
[`config.js`](config.js) deinen eigenen Schlüssel ein.

> Auf GitHub Pages läuft nur **Variante A** (statisch). **Variante B (SSO)** braucht
> einen Server, der PHP oder Node ausführt – Pages kann das nicht.

---

## Einblendungen (Overlays) über dem Player gestalten

Du kannst eigene Inhalte **über** dem laufenden Programm einblenden – Bauchbinden,
Abzeichen, Hinweise oder ein **Mitspiel-Quiz per iFrame** – frei positioniert von
oben links bis unten rechts. Die vollständige Anleitung (Koordinatensystem,
Positionieren, Platzhalter, eingebettete Partnerseiten mit Zuschauer-Kennung) liegt
als eigene Seite bei:

**[→ Einblendungen-Dokumentation](einblendungen/)**  ·  auf GitHub Pages unter
`https://<dein-github-name>.github.io/lixe-partner-kit/einblendungen/`

Kurzfassung: Du gestaltest gegen eine Bühne **1080 breit × `var(--ov-hoehe)`** hoch
(unten links verankert, skaliert auf jedes Gerät, gleich auf Web/iOS/Android). Für
freie Positionen legst du deinen Inhalt in eine Bühne voller Höhe und verankerst mit
`position:absolute`. `{uid}`/`{sig}` versorgen ein eingebettetes Quiz mit einer
pseudonymen, signierten Zuschauer-Kennung.

---

## Zwei Schlüssel – nicht verwechseln

lixe arbeitet mit zwei Schlüsseln. Der Unterschied ist wichtig:

- **Einbett-Schlüssel** (`emb_…`) – **öffentlich.** Darf offen im HTML/Browser
  stehen. Er sagt nur „dieser Rahmen gehört zu Partner X“. Wer ihn kennt, kann
  damit nichts, außer den Player anzuzeigen – und auch das nur von einer Domain,
  die bei lixe in deiner **Domain-Liste** steht.
- **Geheimer Schlüssel** – **niemals** in den Browser, niemals ins Repo, niemals
  in Client-Code. Er lebt ausschließlich in einer `.env` auf deinem Server und
  wird nur für Variante B (SSO) gebraucht.

> Merksatz wie bei Zahlungsanbietern: der Einbett-Schlüssel ist der *publishable
> key*, der geheime Schlüssel der *secret key*.

## Der eigentliche Sicherheits-Schritt: deine Domain

Egal welche Variante: sag lixe, **auf welchen Domains** dein Player laufen soll.
Diese Liste (im CMS am Plattform-Partner, Feld **„Eingesetzt auf“**) entscheidet,
wer den eingeloggten Rahmen einbetten darf. Ohne Eintrag läuft er zum Testen
überall; für den Live-Betrieb trag deine echten Domains ein.

---

## Variante A – Einbetten (ohne eigenen Server)

Eine Zeile, an die Stelle deiner Seite, wo der Player erscheinen soll:

```html
<script src="https://app.lixe.de/einbetten/loader.js"
        data-key="DEIN_EINBETT_SCHLUESSEL"></script>
```

Das war’s. Der Loader baut den Player-Rahmen, die Anmeldung läuft über ein kurzes
lixe-Popup, danach sehen deine Besucher:innen Inhalte und können Codes einlösen.

- `data-target` – optional die `id` eines Elements, in das der Player soll
  (sonst erscheint er direkt hinter dem Script-Tag).
- `data-content` – **was** der Player zeigt. Leer = die lixe-Startseite. Sonst
  ein festes Ziel:
  - `playlist:123` – eine Sammlung (lixe-ID)
  - `video:ABCDEF` – ein einzelnes Video (spielt direkt)
  - `live` – der Livestream
  - `programm` – das lineare Programm
- `data-login` – `required` erzwingt eine Anmeldung vor den Inhalten, `optional`
  zeigt sie sofort. Leer = die Vorgabe des Partners aus dem CMS.

👉 Vollständiges Beispiel: [`variante-a-embed/index.html`](variante-a-embed/index.html)

---

## Variante B – Nahtlos / SSO (mit eigenem Server)

Wenn deine Besucher:innen bei **dir** schon eingeloggt sind, sollen sie bei lixe
nicht noch einmal anmelden. Dein Server unterschreibt die schon angemeldete
Person mit dem **geheimen Schlüssel**; lixe gibt dafür ein Token zurück, mit dem
sich der Player-Rahmen von selbst anmeldet.

Ablauf:

1. Dein Server baut `payload = base64url({email, name, exp})` und
   `sig = HMAC_SHA256(geheimer_schlüssel, "sso:" + payload)`.
2. Dein Server ruft `POST https://app.lixe.de/api/partner/session` mit
   `{ k: einbett_schlüssel, payload, sig }` auf und erhält ein `token`.
3. Deine Seite bettet den Player mit dem Token ein:
   `https://app.lixe.de/einbetten/app?k=EINBETT_SCHLUESSEL#t=TOKEN`
   (Das `#t=` bleibt im Browser – das Token geht nie an einen Server zurück.)

Fertige Beispiele:

- **PHP:** [`variante-b-sso/php/`](variante-b-sso/php/) – Helfer + Demo-Seite
- **Node:** [`variante-b-sso/node/`](variante-b-sso/node/) – gleicher Ablauf

---

## Mitspiel-Quiz & Einblendungen (dibidam) im eingebetteten Player

Einblendungen über dem Programm – auch das eingebettete Mitspiel-Quiz von
dibidam – laufen im Partner-Player automatisch mit. Du musst dafür nichts
einbauen: Die Einblendung kommt aus dem lixe-CMS, der Player reicht die
Zuschauer-Kennung selbst weiter.

Wer **im Player angemeldet** ist (Popup oder SSO), spielt mit signierter
Kennung mit – Punkte, Name und Gewinncode hängen am lixe-Konto, auch auf
deiner Domain. Wer **nicht angemeldet** ist, spielt als Gast mit einer
Kennung, die nur in seinem Browser liegt; sie ist nicht signiert.

Verlangt das Quiz eine Signatur (in dibidam: „Signatur erforderlich“ bzw.
Partner ohne Gast-Zulassung), werden unsignierte Gäste dort abgewiesen. Dann
hast du zwei Möglichkeiten:

- **Anmeldung erzwingen:** `data-login="required"` im Einbett-Schnipsel (oder
  die Partner-Vorgabe im lixe-CMS) – so ist jede:r Mitspielende angemeldet und
  signiert.
- **Gäste zulassen:** In dibidam „Gäste ohne Signatur“ erlauben – dann spielen
  auch Unangemeldete mit, nur eben ohne Konto-Bindung.

---

## Schnellstart

1. **Nur ausprobieren:** [`index.html`](index.html) öffnen (oder über GitHub Pages)
   – Schlüssel eintragen, Vorschau ansehen, Schnipsel kopieren.
2. **Variante A dauerhaft:** deinen Schlüssel in [`config.js`](config.js) eintragen,
   oder die eine Zeile aus dem Schnipsel in deine eigene Seite kopieren
   (siehe auch `variante-a-embed/index.html`).
3. **Variante B (SSO):** `.env.example` → `.env`, Schlüssel eintragen, dann
   `variante-b-sso/…` (PHP oder Node) auf deinem Server starten.
4. **In jedem Fall:** deine Domain im lixe-CMS eintragen
   (Plattform-Partner → Integration → „Eingesetzt auf“).

Fragen? → hello@lixe.de
