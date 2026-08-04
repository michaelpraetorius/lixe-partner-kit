<?php
/**
 * Demo-Partnerseite mit NAHTLOSER Anmeldung (Variante B).
 *
 * In echt kommt die Person aus deiner eigenen Anmeldung/Session. Hier tun wir
 * so, als wäre „anna@example.com“ bereits eingeloggt. Der Server holt ein
 * lixe-Token und bettet den Player damit ein – die Person sieht KEIN lixe-Login.
 */

require __DIR__ . '/lixe-sso.php';

// 👉 In echt: die bei DIR angemeldete Person (aus deiner Session/DB).
$angemeldetePerson = [
    'email' => 'anna@example.com',
    'name'  => 'Anna Beispiel',
];

$fehler = null;
$playerUrl = null;
try {
    $playerUrl = lixe_player_url($angemeldetePerson);
} catch (Throwable $e) {
    $fehler = $e->getMessage();
}
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Beispiel-Partnerseite · lixe nahtlos (Variante B)</title>
    <style>
        :root { color-scheme: light dark; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
               max-width: 860px; margin: 0 auto; padding: 32px 20px 64px; line-height: 1.6; }
        h1 { font-size: 24px; }
        .fehler { background: #fdecec; color: #a11; border-radius: 12px; padding: 14px 16px; font-size: 14px; }
        .rahmen { max-width: 420px; margin: 24px auto; }
        .rahmen .verhaeltnis { position: relative; width: 100%; padding-bottom: 177.78%; }
        .rahmen iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
        footer { margin-top: 48px; font-size: 13px; opacity: .7; }
    </style>
</head>
<body>
    <h1>Hallo <?= htmlspecialchars($angemeldetePerson['name']) ?> 👋</h1>
    <p>Du bist bei uns angemeldet – und damit auch bei lixe. Kein zweiter Login.</p>

    <?php if ($fehler): ?>
        <p class="fehler"><strong>Konnte lixe nicht laden:</strong> <?= htmlspecialchars($fehler) ?></p>
    <?php else: ?>
        <div class="rahmen">
            <div class="verhaeltnis">
                <!-- Der Player öffnet mit dem serverseitig geholten Token (#t=…). -->
                <iframe src="<?= htmlspecialchars($playerUrl) ?>"
                        allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                        allowfullscreen
                        title="lixe Player"></iframe>
            </div>
        </div>
    <?php endif; ?>

    <footer>powered by lixe · Fragen an hello@lixe.de</footer>
</body>
</html>
