#!/usr/bin/env node

global.window = {};
require("../alphabet.js");

const alphabet = window.BARRE_ALPHABET;
const characters = Array.from(
  new Set(
    Array.from(
      " ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789" +
        "ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÑÒÓÔÕÖŒÙÚÛÜŸ" +
        "àáâãäåæçèéêëìíîïñòóôõöœùúûüÿ" +
        "!?.,:;-'\"/\\&+=_()",
    ),
  ),
);

const glyphs = {};
characters.forEach((character) => {
  const definition = alphabet.getGlyph(character);
  glyphs[character] = {
    width: definition.width,
    strokes: definition.strokes.map((stroke) => ({
      scale: Array.isArray(stroke) ? 1 : stroke.scale,
      points: (Array.isArray(stroke) ? stroke : stroke.points).map(({ x, y }) => [x, y]),
    })),
  };
});

process.stdout.write(
  JSON.stringify({
    family: "Varythm",
    version: "1.0.0",
    characters,
    variants: alphabet.variants,
    glyphs,
  }),
);
