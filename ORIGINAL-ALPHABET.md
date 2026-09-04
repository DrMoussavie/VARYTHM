# Varythm original alphabet

Varythm uses four original vector skeletons created for this project:

- Varythm Massive;
- Varythm Condensed;
- Varythm Block;
- Varythm Slanted.

These are not renamed or converted versions of existing fonts. Each character
is defined in `alphabet.js` as points, lines and Bézier curves. The browser
renderer and the font builder both read this same geometry.

No external font file, OpenType or TrueType outline, system glyph or webfont
is used as a source.

## Character set

The first release includes:

- A–Z capitals;
- a–z unicase lowercase mappings;
- 0–9 numerals;
- punctuation: `! ? . , : ; - ' " / \ & + = _ ( )`;
- Æ, æ, Œ and œ ligatures;
- composed Latin accents: grave, acute, circumflex, tilde, dieresis, ring and cedilla.

## Construction

Every glyph starts as a hidden stroke skeleton. The renderer samples the
distance between each vertical bar and that skeleton. All bars remain present;
only their local width changes.

The installable TTF and WOFF2 files are generated directly from those sampled
bar outlines by `scripts/build_font.py`.

Copyright © 2026 SAS LHOMME DEVELOPMENT AND INNOVATION.
