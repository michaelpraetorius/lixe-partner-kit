# Variante B – Nahtlose Anmeldung (SSO)

Für Partner mit **eigenen Nutzerkonten**: Wer bei dir eingeloggt ist, soll bei
lixe kein zweites Mal anmelden. Dein Server unterschreibt die Person mit dem
**geheimen Schlüssel**, lixe gibt dafür ein Token zurück, mit dem sich der
Player von selbst anmeldet.

## Voraussetzung

`.env` im Wurzelverzeichnis des Repos (siehe `../.env.example`):

```
LIXE_APP_URL=https://app.lixe.de
LIXE_EMBED_KEY=emb_…        # öffentlich
LIXE_SECRET_KEY=…           # GEHEIM – bleibt auf deinem Server
```

## PHP

```
php -S localhost:8000 -t php
# → http://localhost:8000/beispiel.php
```

- `php/lixe-sso.php` – der Helfer (`lixe_player_url($person)`): unterschreibt,
  holt das Token, liefert die fertige iframe-Adresse.
- `php/beispiel.php` – Demo-Seite, die den Player nahtlos einbettet.

## Node

```
cd node && node server.js
# → http://localhost:3000
```

Kommt ohne externe Pakete aus (nur Node-Bordmittel).

## So funktioniert’s (kurz)

1. `payload = base64url({ email, name, exp })`
2. `sig = HMAC_SHA256(LIXE_SECRET_KEY, "sso:" + payload)` (hex)
3. `POST {LIXE_APP_URL}/api/partner/session` mit `{ k: LIXE_EMBED_KEY, payload, sig }`
   → Antwort `{ token }`
4. iframe: `{LIXE_APP_URL}/einbetten/app?k={LIXE_EMBED_KEY}#t={token}`

Das `#t=` steht im Fragment – es bleibt im Browser und geht nie an einen Server
zurück. Der geheime Schlüssel verlässt deinen Server nie.

## Wichtig: deine Domain eintragen

Trag die Domain deiner Seite im lixe-CMS ein (Plattform-Partner → Integration →
„Eingesetzt auf“). Ohne Eintrag läuft der Rahmen zum Testen überall; für den
Live-Betrieb macht die Liste den Rahmen auf deine Domains fest.
