/*
 * lixe Partner-Kit – Konfiguration (Variante A, Einbetten)
 *
 * DAS IST DER EINZIGE ORT, den du anfassen musst: trage deinen ÖFFENTLICHEN
 * Einbett-Schlüssel ein (beginnt mit "emb_"), speichere, fertig.
 *
 * Der Schlüssel darf offen hier stehen – er ist kein Geheimnis. Der Schutz sitzt
 * in der Domain-Liste im lixe-CMS ("Eingesetzt auf"), nicht in der Geheimhaltung.
 *
 * BEWUSST LEER: Es ist KEIN Schlüssel voreingestellt. Damit zeigt die
 * öffentliche Demo-Seite von sich aus KEINE lixe-Inhalte – die Live-Vorschau
 * läuft erst, wenn du hier (oder im Feld auf der Seite) deinen eigenen
 * emb_-Schlüssel einträgst. So werden über die Demo keine Inhalte ungewollt frei.
 */
window.LIXE = {
    appUrl:   'https://app.lixe.de',
    embedKey: '',   // dein öffentlicher Einbett-Schlüssel (emb_…) aus dem lixe-CMS
    format:   '9:16'   // '9:16' (Hochkant) oder '16:9' (Quer)
};
