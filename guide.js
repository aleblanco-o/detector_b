// Lernpfad: 4 Schritte vom Foto zum erkannten Brötchen. Brot ist immer brotfarben;
// Umrisse und Akzente über Flexoki-CSS-Variablen (hell/dunkel).
const CRUST = '#D49A4E', SCORE = '#9C5F25';
// A roll centred on (x, y), w wide; type: 'normal' (scores), 'koerner' (light seeds), 'sonnen' (dark seeds).
const roll = (x, y, w, type = 'normal') => {
  const s = w / 60, deco = {
    normal: `<path d="M-14-6q14-7 28 0" fill="none" stroke="${SCORE}" stroke-width="4" stroke-linecap="round"/>`,
    koerner: '<g fill="#F4E6C4"><ellipse cx="-12" cy="-6" rx="3" ry="2"/><ellipse cx="0" cy="-11" rx="3" ry="2"/><ellipse cx="12" cy="-6" rx="3" ry="2"/><ellipse cx="-5" cy="1" rx="3" ry="2"/><ellipse cx="7" cy="2" rx="3" ry="2"/></g>',
    sonnen: '<g fill="#4A3B2A"><ellipse cx="-12" cy="-5" rx="2.2" ry="4" transform="rotate(-30 -12 -5)"/><ellipse cx="0" cy="-10" rx="2.2" ry="4"/><ellipse cx="12" cy="-5" rx="2.2" ry="4" transform="rotate(30 12 -5)"/><ellipse cx="-4" cy="2" rx="2.2" ry="4" transform="rotate(-15 -4 2)"/><ellipse cx="7" cy="2" rx="2.2" ry="4" transform="rotate(20 7 2)"/></g>',
  }[type];
  return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-30 10C-30-10-15-20 0-20S30-10 30 10Q30 16 24 16H-24Q-30 16-30 10Z" fill="${CRUST}" stroke="var(--tx)" stroke-width="${4 / s}" stroke-linejoin="round"/>${deco}</g>`;
};
const svg = (label, body) => `<svg viewBox="0 0 120 120" role="img" aria-label="${label}" focusable="false" fill="none" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;

window.GUIDE_STEPS = [
  {
    id: 'aufnahme',
    title: 'Datenaufnahme',
    text: 'Fotografiere viele Brötchen auf dem Band oder Tisch. Nimm verschiedene Winkel, Abstände und Licht.',
    svg: svg('Kamera fotografiert Brötchen',
      '<path d="M14 38h16l6-9h22l6 9h16a6 6 0 0 1 6 6v34a6 6 0 0 1-6 6H14a6 6 0 0 1-6-6V44a6 6 0 0 1 6-6z" fill="var(--bg2)" stroke="var(--tx)" stroke-width="4"/>' +
      '<circle cx="47" cy="60" r="14" fill="var(--ui)" stroke="var(--tx)" stroke-width="4"/><circle cx="47" cy="60" r="6" fill="var(--bl)"/>' +
      roll(88, 98, 40) + '<path d="M96 30l8-8M100 44h10" stroke="var(--or)" stroke-width="4"/>'),
  },
  {
    id: 'labeling',
    title: 'Labeling',
    text: 'Zeichne in CVAT einen Umriss (Polygon) um jedes Brötchen. Wähle dann die Klasse: Normal, Körner oder Sonnenblumen.',
    svg: svg('Brötchen mit gezeichnetem Umriss',
      roll(56, 66, 64, 'koerner') +
      '<path d="M18 74L24 48L44 36L70 36L90 50L94 76Z" stroke="var(--bl)" stroke-width="4" stroke-dasharray="7 6"/>' +
      '<g fill="var(--bl)"><circle cx="18" cy="74" r="5"/><circle cx="24" cy="48" r="5"/><circle cx="44" cy="36" r="5"/><circle cx="70" cy="36" r="5"/><circle cx="90" cy="50" r="5"/><circle cx="94" cy="76" r="5"/></g>' +
      '<path d="M86 104l20-20 6 6-20 20h-6z" fill="var(--ye)" stroke="var(--tx)" stroke-width="4"/>'),
  },
  {
    id: 'training',
    title: 'Training',
    text: 'Der Computer lernt auf einer GPU aus deinen Bildern. Über viele Epochen wird er immer besser.',
    svg: svg('Lernkurve steigt mit jeder Epoche',
      '<path d="M16 16v88h92" stroke="var(--tx)" stroke-width="4"/>' +
      '<path d="M22 92C40 90 46 60 60 52S88 30 104 26" stroke="var(--gr)" stroke-width="6"/>' +
      '<g fill="var(--bg)" stroke="var(--gr)" stroke-width="4"><circle cx="40" cy="80" r="5"/><circle cx="64" cy="50" r="5"/><circle cx="90" cy="32" r="5"/></g>' +
      roll(84, 84, 34, 'sonnen')),
  },
  {
    id: 'inferenz',
    title: 'Inferenz',
    text: 'Das fertige Modell erkennt Brötchen live in der Kamera. Genau das macht diese App!',
    svg: svg('Handy erkennt ein Brötchen',
      '<rect x="28" y="6" width="64" height="108" rx="12" fill="var(--bg2)" stroke="var(--tx)" stroke-width="4"/><path d="M52 102h16" stroke="var(--tx)" stroke-width="4"/>' +
      roll(60, 58, 40, 'normal') +
      '<rect x="34" y="34" width="52" height="42" rx="4" stroke="var(--gr)" stroke-width="4"/><path d="M34 34h22v-10H38a4 4 0 0 0-4 4z" fill="var(--gr)"/>'),
  },
];
