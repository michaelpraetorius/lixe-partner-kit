<?php
/**
 * lixe SSO-Helfer (Variante B).
 *
 * Unterschreibt eine bei DIR schon angemeldete Person mit dem GEHEIMEN Schlüssel
 * und tauscht die Unterschrift bei lixe gegen ein kurzlebiges Player-Token.
 *
 * Der geheime Schlüssel verlässt niemals deinen Server. In den Browser geht nur
 * das fertige Token (im #-Fragment, das nie an einen Server zurückgeht).
 */

/** Minimaler .env-Leser – nur fürs Beispiel; in echt nutzt du dein Framework. */
function lixe_env(string $key, string $default = ''): string
{
    static $werte = null;
    if ($werte === null) {
        $werte = [];
        $pfad = __DIR__ . '/../../.env';
        if (is_file($pfad)) {
            foreach (file($pfad, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $zeile) {
                if ($zeile === '' || $zeile[0] === '#' || ! str_contains($zeile, '=')) {
                    continue;
                }
                [$k, $v] = explode('=', $zeile, 2);
                $werte[trim($k)] = trim($v);
            }
        }
    }
    return $werte[$key] ?? (getenv($key) ?: $default);
}

function lixe_base64url(string $raw): string
{
    return rtrim(strtr(base64_encode($raw), '+/', '-_'), '=');
}

/**
 * Holt ein Player-Token für eine Person und liefert die fertige iframe-Adresse.
 *
 * @param array{email:string, name?:string} $person  die bei DIR angemeldete Person
 * @return string  Adresse für den iframe (mit #t=TOKEN) – oder wirft bei Fehler.
 */
function lixe_player_url(array $person): string
{
    $appUrl   = rtrim(lixe_env('LIXE_APP_URL', 'https://app.lixe.de'), '/');
    $embedKey = lixe_env('LIXE_EMBED_KEY');
    $secret   = lixe_env('LIXE_SECRET_KEY');

    if ($embedKey === '' || $secret === '') {
        throw new RuntimeException('LIXE_EMBED_KEY und LIXE_SECRET_KEY müssen in .env stehen.');
    }

    // Steckbrief mit kurzem Ablauf – eine alte Unterschrift soll nicht ewig gelten.
    $payload = lixe_base64url(json_encode([
        'email' => $person['email'],
        'name'  => $person['name'] ?? '',
        'exp'   => time() + 120,
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));

    $sig = hash_hmac('sha256', 'sso:' . $payload, $secret);

    // Server-zu-Server: der geheime Schlüssel bleibt hier, lixe gibt ein Token.
    $ch = curl_init($appUrl . '/api/partner/session');
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER     => ['Content-Type: application/json', 'Accept: application/json'],
        CURLOPT_POSTFIELDS     => json_encode(['k' => $embedKey, 'payload' => $payload, 'sig' => $sig]),
        CURLOPT_TIMEOUT        => 10,
    ]);
    $antwort = curl_exec($ch);
    $status  = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $daten = json_decode((string) $antwort, true);
    if ($status !== 200 || empty($daten['token'])) {
        throw new RuntimeException('lixe-Anmeldung fehlgeschlagen (HTTP ' . $status . '): ' . $antwort);
    }

    // Token im #-Fragment: bleibt im Browser, geht nie an einen Server zurück.
    return $appUrl . '/einbetten/app?k=' . rawurlencode($embedKey) . '#t=' . rawurlencode($daten['token']);
}
