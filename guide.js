// Lernpfad-Vignetten: 4 Schritte vom Foto zum erkannten Brötchen. Farben nur über CSS-Variablen (hell/dunkel).
window.GUIDE_STEPS = [
  {
    id: 'aufnahme',
    title: 'Datenaufnahme',
    text: 'Fotografiere viele Brötchen auf dem Band oder Tisch. Nimm verschiedene Winkel, Abstände und Licht.',
    svg: '<svg viewBox="0 0 120 120" role="img" aria-label="Kamera fotografiert ein Brötchen" focusable="false"><rect x="10" y="30" width="70" height="50" rx="8" fill="var(--ui)" stroke="var(--tx)" stroke-width="5"/><rect x="26" y="20" width="20" height="12" rx="3" fill="var(--ui)" stroke="var(--tx)" stroke-width="5"/><circle cx="45" cy="55" r="14" fill="var(--bl)" stroke="var(--tx)" stroke-width="5"/><ellipse cx="95" cy="92" rx="18" ry="12" fill="var(--or)" stroke="var(--tx)" stroke-width="5"/><path d="M88 88q7-5 14 0" fill="none" stroke="var(--tx)" stroke-width="4" stroke-linecap="round"/><path d="M84 40l10-8M88 52l14-2M84 64l12 6" stroke="var(--ye)" stroke-width="5" stroke-linecap="round"/></svg>'
  },
  {
    id: 'labeling',
    title: 'Labeling',
    text: 'Zeichne in CVAT einen Umriss (Polygon) um jedes Brötchen. Wähle dann die Klasse: Normal, Körner oder Sonnenblumen.',
    svg: '<svg viewBox="0 0 120 120" role="img" aria-label="Brötchen mit gestricheltem Umriss und Etikett" focusable="false"><ellipse cx="52" cy="70" rx="32" ry="22" fill="var(--gr)" stroke="var(--tx)" stroke-width="5"/><circle cx="42" cy="66" r="3" fill="var(--tx)"/><circle cx="56" cy="62" r="3" fill="var(--tx)"/><circle cx="62" cy="76" r="3" fill="var(--tx)"/><path d="M14 70L26 42L52 38L84 46L94 72L80 96L40 98Z" fill="none" stroke="var(--bl)" stroke-width="4" stroke-dasharray="8 6" stroke-linejoin="round"/><path d="M84 14h24v18l-12 10-12-10z" fill="var(--ye)" stroke="var(--tx)" stroke-width="5" stroke-linejoin="round"/><circle cx="96" cy="24" r="3" fill="var(--tx)"/></svg>'
  },
  {
    id: 'training',
    title: 'Training',
    text: 'Der Computer lernt auf einer GPU aus deinen Bildern. Über viele Epochen wird er immer besser.',
    svg: '<svg viewBox="0 0 120 120" role="img" aria-label="Grafikchip mit steigender Lernkurve" focusable="false"><rect x="14" y="40" width="50" height="50" rx="6" fill="var(--ui)" stroke="var(--tx)" stroke-width="5"/><rect x="28" y="54" width="22" height="22" rx="3" fill="var(--bl)"/><path d="M24 40v-8M39 40v-8M54 40v-8M24 98v-8M39 98v-8M54 98v-8M14 52H6M14 78H6M72 52h-8M72 78h-8" stroke="var(--tx)" stroke-width="4" stroke-linecap="round"/><path d="M76 100V20M76 100h38" stroke="var(--tx)" stroke-width="4" stroke-linecap="round"/><path d="M80 92q10-4 14-20t16-44" fill="none" stroke="var(--gr)" stroke-width="5" stroke-linecap="round"/></svg>'
  },
  {
    id: 'inferenz',
    title: 'Inferenz',
    text: 'Das fertige Modell erkennt Brötchen live in der Kamera. Genau das macht diese App!',
    svg: '<svg viewBox="0 0 120 120" role="img" aria-label="Handy erkennt ein Brötchen mit Rahmen" focusable="false"><rect x="30" y="8" width="60" height="104" rx="10" fill="var(--bg2)" stroke="var(--tx)" stroke-width="5"/><path d="M52 100h16" stroke="var(--tx)" stroke-width="5" stroke-linecap="round"/><ellipse cx="60" cy="56" rx="18" ry="13" fill="var(--ye)" stroke="var(--tx)" stroke-width="5"/><path d="M52 52l3 3M62 50l3 3M58 60l3 3" stroke="var(--tx)" stroke-width="3" stroke-linecap="round"/><rect x="36" y="36" width="48" height="40" rx="3" fill="none" stroke="var(--gr)" stroke-width="5"/><rect x="36" y="26" width="20" height="10" fill="var(--gr)"/></svg>'
  }
];
