/*
 * VARYTHM ORIGINALS 01–04
 * Géométrie originale dessinée pour le générateur Varythm.
 * Aucun contour de police externe n'est utilisé, incorporé ou converti ici.
 * Copyright © 2026 SAS LHOMME DEVELOPMENT AND INNOVATION.
 */

(() => {
  const point = (x, y) => ({ x, y });
  const path = (...coordinates) =>
    coordinates.map(([x, y]) => point(x, y));

  function curve(start, control1, control2, end, steps = 9) {
    const points = [];
    for (let index = 0; index <= steps; index += 1) {
      const t = index / steps;
      const inverse = 1 - t;
      points.push(
        point(
          inverse ** 3 * start[0] +
            3 * inverse ** 2 * t * control1[0] +
            3 * inverse * t ** 2 * control2[0] +
            t ** 3 * end[0],
          inverse ** 3 * start[1] +
            3 * inverse ** 2 * t * control1[1] +
            3 * inverse * t ** 2 * control2[1] +
            t ** 3 * end[1],
        ),
      );
    }
    return points;
  }

  function join(...parts) {
    return parts.flatMap((part, index) => (index ? part.slice(1) : part));
  }

  function ellipse(centerX, centerY, radiusX, radiusY, steps = 26) {
    const points = [];
    for (let index = 0; index <= steps; index += 1) {
      const angle = (index / steps) * Math.PI * 2;
      points.push(
        point(
          centerX + Math.cos(angle) * radiusX,
          centerY + Math.sin(angle) * radiusY,
        ),
      );
    }
    return points;
  }

  const glyph = (width, strokes) => Object.freeze({ width, strokes });
  const vertical = (x, top = 0.14, bottom = 0.92) => path([x, top], [x, bottom]);
  const horizontal = (left, y, right) => path([left, y], [right, y]);

  const GLYPHS = Object.freeze({
    A: glyph(0.72, [
      path([0.12, 0.92], [0.5, 0.14], [0.88, 0.92]),
      horizontal(0.28, 0.62, 0.72),
    ]),
    B: glyph(0.7, [
      vertical(0.17),
      join(
        curve([0.17, 0.14], [0.56, 0.12], [0.82, 0.17], [0.82, 0.36]),
        curve([0.82, 0.36], [0.82, 0.5], [0.62, 0.53], [0.17, 0.52]),
      ),
      join(
        curve([0.17, 0.52], [0.62, 0.5], [0.86, 0.56], [0.86, 0.74]),
        curve([0.86, 0.74], [0.86, 0.9], [0.58, 0.94], [0.17, 0.92]),
      ),
    ]),
    C: glyph(0.72, [
      join(
        curve([0.86, 0.24], [0.73, 0.11], [0.55, 0.11], [0.38, 0.14]),
        curve([0.38, 0.14], [0.15, 0.18], [0.1, 0.36], [0.1, 0.54]),
        curve([0.1, 0.54], [0.1, 0.75], [0.19, 0.9], [0.4, 0.93]),
        curve([0.4, 0.93], [0.58, 0.95], [0.76, 0.89], [0.87, 0.79]),
      ),
    ]),
    D: glyph(0.74, [
      vertical(0.16),
      join(
        curve([0.16, 0.14], [0.53, 0.12], [0.86, 0.2], [0.88, 0.49]),
        curve([0.88, 0.49], [0.9, 0.79], [0.57, 0.94], [0.16, 0.92]),
      ),
    ]),
    E: glyph(0.62, [
      vertical(0.17),
      horizontal(0.17, 0.14, 0.88),
      horizontal(0.17, 0.52, 0.72),
      horizontal(0.17, 0.92, 0.9),
    ]),
    F: glyph(0.6, [
      vertical(0.17),
      horizontal(0.17, 0.14, 0.9),
      horizontal(0.17, 0.52, 0.73),
    ]),
    G: glyph(0.76, [
      join(
        curve([0.86, 0.24], [0.73, 0.11], [0.55, 0.11], [0.38, 0.14]),
        curve([0.38, 0.14], [0.15, 0.18], [0.1, 0.36], [0.1, 0.54]),
        curve([0.1, 0.54], [0.1, 0.76], [0.2, 0.9], [0.41, 0.93]),
        curve([0.41, 0.93], [0.63, 0.96], [0.79, 0.87], [0.86, 0.77]),
      ),
      path([0.57, 0.58], [0.88, 0.58], [0.88, 0.84]),
    ]),
    H: glyph(0.72, [
      vertical(0.15),
      vertical(0.85),
      horizontal(0.15, 0.55, 0.85),
    ]),
    I: glyph(0.3, [vertical(0.5)]),
    J: glyph(0.58, [
      horizontal(0.12, 0.14, 0.86),
      join(
        path([0.76, 0.14], [0.76, 0.73]),
        curve([0.76, 0.73], [0.75, 0.9], [0.57, 0.96], [0.39, 0.91]),
        curve([0.39, 0.91], [0.24, 0.88], [0.17, 0.79], [0.16, 0.68]),
      ),
    ]),
    K: glyph(0.7, [
      vertical(0.16),
      path([0.86, 0.14], [0.18, 0.57], [0.88, 0.92]),
    ]),
    L: glyph(0.58, [
      vertical(0.17),
      horizontal(0.17, 0.92, 0.9),
    ]),
    M: glyph(0.9, [
      vertical(0.1),
      path([0.1, 0.14], [0.5, 0.62], [0.9, 0.14]),
      vertical(0.9),
    ]),
    N: glyph(0.75, [
      vertical(0.14),
      path([0.14, 0.14], [0.86, 0.92]),
      vertical(0.86),
    ]),
    O: glyph(0.76, [ellipse(0.5, 0.53, 0.4, 0.4)]),
    P: glyph(0.68, [
      vertical(0.16),
      join(
        curve([0.16, 0.14], [0.55, 0.12], [0.84, 0.18], [0.84, 0.38]),
        curve([0.84, 0.38], [0.84, 0.57], [0.57, 0.61], [0.16, 0.59]),
      ),
    ]),
    Q: glyph(0.78, [
      ellipse(0.48, 0.51, 0.38, 0.38),
      path([0.56, 0.7], [0.91, 0.98]),
    ]),
    R: glyph(0.7, [
      vertical(0.16),
      join(
        curve([0.16, 0.14], [0.55, 0.12], [0.84, 0.18], [0.84, 0.38]),
        curve([0.84, 0.38], [0.84, 0.56], [0.57, 0.61], [0.16, 0.59]),
      ),
      path([0.53, 0.59], [0.88, 0.92]),
    ]),
    S: glyph(0.68, [
      join(
        curve([0.86, 0.23], [0.7, 0.1], [0.32, 0.09], [0.17, 0.28]),
        curve([0.17, 0.28], [0.03, 0.49], [0.77, 0.5], [0.83, 0.7]),
        curve([0.83, 0.7], [0.9, 0.91], [0.39, 1.02], [0.12, 0.82]),
      ),
    ]),
    T: glyph(0.7, [
      horizontal(0.08, 0.14, 0.92),
      vertical(0.5),
    ]),
    U: glyph(0.74, [
      join(
        path([0.14, 0.14], [0.14, 0.68]),
        curve([0.14, 0.68], [0.14, 0.88], [0.3, 0.94], [0.5, 0.94]),
        curve([0.5, 0.94], [0.7, 0.94], [0.86, 0.88], [0.86, 0.68]),
        path([0.86, 0.68], [0.86, 0.14]),
      ),
    ]),
    V: glyph(0.72, [path([0.1, 0.14], [0.5, 0.92], [0.9, 0.14])]),
    W: glyph(0.98, [
      path([0.06, 0.14], [0.27, 0.92], [0.5, 0.53], [0.73, 0.92], [0.94, 0.14]),
    ]),
    X: glyph(0.7, [
      path([0.1, 0.14], [0.9, 0.92]),
      path([0.9, 0.14], [0.1, 0.92]),
    ]),
    Y: glyph(0.7, [
      path([0.08, 0.14], [0.5, 0.55], [0.92, 0.14]),
      path([0.5, 0.55], [0.5, 0.92]),
    ]),
    Z: glyph(0.68, [
      horizontal(0.1, 0.14, 0.9),
      path([0.9, 0.14], [0.1, 0.92]),
      horizontal(0.1, 0.92, 0.9),
    ]),
    "0": glyph(0.7, [
      ellipse(0.5, 0.53, 0.36, 0.4),
      path([0.25, 0.82], [0.75, 0.24]),
    ]),
    "1": glyph(0.43, [
      path([0.2, 0.29], [0.5, 0.14], [0.5, 0.92]),
      horizontal(0.18, 0.92, 0.82),
    ]),
    "2": glyph(0.66, [
      join(
        curve([0.13, 0.31], [0.2, 0.08], [0.75, 0.06], [0.84, 0.3]),
        curve([0.84, 0.3], [0.9, 0.5], [0.48, 0.67], [0.12, 0.92]),
      ),
      horizontal(0.12, 0.92, 0.9),
    ]),
    "3": glyph(0.65, [
      join(
        curve([0.12, 0.24], [0.33, 0.08], [0.78, 0.08], [0.82, 0.31]),
        curve([0.82, 0.31], [0.84, 0.46], [0.64, 0.51], [0.43, 0.52]),
        curve([0.43, 0.52], [0.69, 0.51], [0.88, 0.59], [0.84, 0.75]),
        curve([0.84, 0.75], [0.79, 0.98], [0.31, 1.01], [0.1, 0.82]),
      ),
    ]),
    "4": glyph(0.68, [
      path([0.72, 0.92], [0.72, 0.14], [0.1, 0.7], [0.92, 0.7]),
    ]),
    "5": glyph(0.64, [
      path([0.86, 0.14], [0.18, 0.14], [0.14, 0.5]),
      join(
        curve([0.14, 0.5], [0.79, 0.42], [0.91, 0.58], [0.86, 0.76]),
        curve([0.86, 0.76], [0.8, 0.98], [0.31, 1.01], [0.1, 0.82]),
      ),
    ]),
    "6": glyph(0.66, [
      join(
        curve([0.82, 0.22], [0.64, 0.07], [0.26, 0.13], [0.15, 0.47]),
        curve([0.15, 0.47], [0.02, 0.86], [0.28, 0.97], [0.52, 0.94]),
        curve([0.52, 0.94], [0.87, 0.91], [0.95, 0.55], [0.68, 0.48]),
        curve([0.68, 0.48], [0.49, 0.43], [0.27, 0.52], [0.16, 0.65]),
      ),
    ]),
    "7": glyph(0.62, [
      horizontal(0.08, 0.14, 0.92),
      path([0.92, 0.14], [0.34, 0.92]),
    ]),
    "8": glyph(0.66, [
      ellipse(0.5, 0.34, 0.31, 0.22, 20),
      ellipse(0.5, 0.72, 0.36, 0.25, 22),
    ]),
    "9": glyph(0.66, [
      join(
        curve([0.17, 0.85], [0.36, 1.01], [0.74, 0.94], [0.85, 0.6]),
        curve([0.85, 0.6], [0.98, 0.21], [0.72, 0.1], [0.48, 0.13]),
        curve([0.48, 0.13], [0.13, 0.16], [0.05, 0.52], [0.32, 0.59]),
        curve([0.32, 0.59], [0.51, 0.64], [0.73, 0.55], [0.84, 0.42]),
      ),
    ]),
    "!": glyph(0.28, [vertical(0.5, 0.14, 0.7), path([0.5, 0.9], [0.5, 0.92])]),
    "?": glyph(0.58, [
      join(
        curve([0.12, 0.3], [0.18, 0.08], [0.77, 0.06], [0.84, 0.31]),
        curve([0.84, 0.31], [0.88, 0.49], [0.52, 0.55], [0.5, 0.68]),
      ),
      path([0.5, 0.9], [0.5, 0.92]),
    ]),
    ".": glyph(0.22, [path([0.5, 0.9], [0.5, 0.92])]),
    ",": glyph(0.24, [path([0.56, 0.86], [0.45, 0.98])]),
    ":": glyph(0.24, [path([0.5, 0.4], [0.5, 0.42]), path([0.5, 0.84], [0.5, 0.86])]),
    "-": glyph(0.45, [horizontal(0.14, 0.55, 0.86)]),
    "/": glyph(0.55, [path([0.88, 0.08], [0.12, 0.98])]),
    "\\": glyph(0.55, [path([0.12, 0.08], [0.88, 0.98])]),
    "&": glyph(0.78, [
      join(
        curve([0.82, 0.87], [0.65, 0.65], [0.2, 0.37], [0.29, 0.19]),
        curve([0.29, 0.19], [0.38, 0.02], [0.76, 0.12], [0.68, 0.33]),
        curve([0.68, 0.33], [0.58, 0.55], [0.09, 0.61], [0.14, 0.79]),
        curve([0.14, 0.79], [0.21, 1.03], [0.69, 0.97], [0.9, 0.57]),
      ),
    ]),
    "Æ": glyph(1.02, [
      path([0.06, 0.92], [0.37, 0.14], [0.53, 0.92]),
      horizontal(0.2, 0.61, 0.46),
      vertical(0.47),
      horizontal(0.47, 0.14, 0.94),
      horizontal(0.47, 0.52, 0.84),
      horizontal(0.47, 0.92, 0.96),
    ]),
    "Œ": glyph(1.04, [
      ellipse(0.31, 0.53, 0.25, 0.4),
      vertical(0.52),
      horizontal(0.52, 0.14, 0.95),
      horizontal(0.52, 0.52, 0.86),
      horizontal(0.52, 0.92, 0.97),
    ]),
    ";": glyph(0.24, [
      path([0.5, 0.4], [0.5, 0.42]),
      path([0.56, 0.82], [0.45, 0.98]),
    ]),
    "'": glyph(0.22, [path([0.54, 0.1], [0.46, 0.28])]),
    '"': glyph(0.38, [
      path([0.36, 0.1], [0.31, 0.28]),
      path([0.69, 0.1], [0.64, 0.28]),
    ]),
    "+": glyph(0.56, [horizontal(0.12, 0.55, 0.88), vertical(0.5, 0.3, 0.8)]),
    "=": glyph(0.56, [horizontal(0.12, 0.43, 0.88), horizontal(0.12, 0.67, 0.88)]),
    "_": glyph(0.58, [horizontal(0.08, 0.96, 0.92)]),
    "(": glyph(0.34, [
      join(
        curve([0.72, 0.09], [0.33, 0.28], [0.27, 0.72], [0.72, 0.98]),
      ),
    ]),
    ")": glyph(0.34, [
      join(
        curve([0.28, 0.09], [0.67, 0.28], [0.73, 0.72], [0.28, 0.98]),
      ),
    ]),
  });

  const ACCENTS = Object.freeze({
    "\u0300": [{ points: path([0.37, 0.01], [0.52, 0.09]), scale: 0.5 }],
    "\u0301": [{ points: path([0.48, 0.09], [0.63, 0.01]), scale: 0.5 }],
    "\u0302": [{ points: path([0.32, 0.09], [0.5, 0.01], [0.68, 0.09]), scale: 0.46 }],
    "\u0303": [{
      points: join(
        curve([0.31, 0.07], [0.4, -0.01], [0.47, 0.02], [0.52, 0.05], 5),
        curve([0.52, 0.05], [0.59, 0.09], [0.66, 0.09], [0.72, 0.02], 5),
      ),
      scale: 0.38,
    }],
    "\u0308": [
      { points: path([0.36, 0.045], [0.37, 0.045]), scale: 0.46 },
      { points: path([0.63, 0.045], [0.64, 0.045]), scale: 0.46 },
    ],
    "\u0327": [{ points: path([0.53, 0.91], [0.45, 1.02], [0.57, 1.04]), scale: 0.48 }],
    "\u030a": [{ points: ellipse(0.5, 0.045, 0.095, 0.055, 14), scale: 0.34 }],
  });

  const VARIANTS = Object.freeze({
    massive: Object.freeze({
      name: "Massive 01",
      widthScale: 0.96,
      strokeScale: 0.215,
      trackingScale: 0.075,
      geometryScale: 0.96,
      slant: 0,
      lineCap: "round",
      lineJoin: "round",
    }),
    condensed: Object.freeze({
      name: "Condensée 02",
      widthScale: 0.76,
      strokeScale: 0.18,
      trackingScale: 0.082,
      geometryScale: 0.94,
      slant: 0,
      lineCap: "round",
      lineJoin: "round",
    }),
    block: Object.freeze({
      name: "Bloc 03",
      widthScale: 0.92,
      strokeScale: 0.235,
      trackingScale: 0.07,
      geometryScale: 0.93,
      slant: 0,
      lineCap: "square",
      lineJoin: "miter",
    }),
    slanted: Object.freeze({
      name: "Inclinée 04",
      widthScale: 0.88,
      strokeScale: 0.19,
      trackingScale: 0.08,
      geometryScale: 0.94,
      slant: 0.12,
      lineCap: "round",
      lineJoin: "round",
    }),
  });

  function getGlyph(character) {
    if (/\s/u.test(character)) return glyph(0.34, []);

    const decomposed = character.normalize("NFD");
    const baseCharacter = decomposed[0].toLocaleUpperCase("fr-FR");
    const base = GLYPHS[baseCharacter] || GLYPHS[character] || GLYPHS["?"];
    const accentStrokes = Array.from(decomposed.slice(1)).flatMap(
      (mark) => ACCENTS[mark] || [],
    );

    if (!accentStrokes.length) return base;
    return glyph(base.width, [...base.strokes, ...accentStrokes]);
  }

  function getVariant(id) {
    return VARIANTS[id] || VARIANTS.massive;
  }

  function drawGlyph(
    context,
    definition,
    originX,
    originY,
    width,
    height,
    profile,
    weightMultiplier = 1,
  ) {
    context.save();
    context.strokeStyle = "#ffffff";
    context.lineCap = profile.lineCap;
    context.lineJoin = profile.lineJoin;

    definition.strokes.forEach((stroke) => {
      const points = Array.isArray(stroke) ? stroke : stroke.points;
      const weight = Array.isArray(stroke) ? 1 : stroke.scale;
      if (!points.length) return;
      context.lineWidth = height * profile.strokeScale * weight * weightMultiplier;

      const transform = (current) => ({
        x:
          originX +
          (0.5 + (current.x - 0.5) * profile.geometryScale + (0.5 - current.y) * profile.slant) *
            width,
        y: originY + current.y * height,
      });
      const first = transform(points[0]);
      context.beginPath();
      context.moveTo(first.x, first.y);
      points.slice(1).forEach((current) => {
        const transformed = transform(current);
        context.lineTo(transformed.x, transformed.y);
      });
      context.stroke();
    });
    context.restore();
  }

  window.BARRE_ALPHABET = Object.freeze({
    name: "VARYTHM ORIGINALS",
    getGlyph,
    getVariant,
    variants: VARIANTS,
    drawGlyph,
  });
})();
