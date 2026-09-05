<div align="center">

# VARYTHM

`TYPE FAMILY / INTERACTIVE SVG GENERATOR / 2026`

### [OPEN THE LIVE STUDIO ↗](https://drmoussavie.github.io/VARYTHM/)

[Download 1.0.0](https://github.com/DrMoussavie/VARYTHM/releases/download/v1.0.0/Varythm-1.0.0.zip) · [View the glyphs](#character-set) · [Read the license](LICENSE.md)

</div>

<a href="https://drmoussavie.github.io/VARYTHM/">
  <img src="docs/images/varythm-glyphs.png" alt="Varythm type family specimen" width="100%">
</a>

<div align="center">

**CLICK THE SPECIMEN TO TYPE, MOVE, RANDOMIZE AND EXPORT**

`4 CUTS` · `136 GLYPHS` · `5-LINE CANVAS` · `TTF` · `WOFF2` · `SVG` · `PNG`

</div>

## LIVE STUDIO

The [browser studio](https://drmoussavie.github.io/VARYTHM/) is the controllable view of Varythm. Type up to five lines and adjust the drawing without installing anything.

| Text | Ends | Motion | Export |
| --- | --- | --- | --- |
| 1–5 lines on one continuous field | aligned or loose, with adjustable overflow | fixed pointer response or seeded playback | editable SVG and high-resolution PNG |

The vertical bars cross the complete canvas. Line breaks add new letter rows without restarting the bars.

## FONT FAMILY

| Cut | Format | Direct download |
| --- | --- | --- |
| **Massive** | TTF / WOFF2 | [TTF](fonts/Varythm-Massive.ttf) · [WOFF2](fonts/Varythm-Massive.woff2) |
| **Condensed** | TTF / WOFF2 | [TTF](fonts/Varythm-Condensed.ttf) · [WOFF2](fonts/Varythm-Condensed.woff2) |
| **Block** | TTF / WOFF2 | [TTF](fonts/Varythm-Block.ttf) · [WOFF2](fonts/Varythm-Block.woff2) |
| **Slanted** | TTF / WOFF2 | [TTF](fonts/Varythm-Slanted.ttf) · [WOFF2](fonts/Varythm-Slanted.woff2) |

The complete package is available in the [Varythm 1.0.0 release](https://github.com/DrMoussavie/VARYTHM/releases/tag/v1.0.0).

## CHARACTER SET

```text
ABCDEFGHIJKLMNOPQRSTUVWXYZ
abcdefghijklmnopqrstuvwxyz
0123456789

À Á Â Ã Ä Å Æ Ç È É Ê Ë Ì Í Î Ï Ñ Ò Ó Ô Õ Ö Œ Ù Ú Û Ü Ÿ
à á â ã ä å æ ç è é ê ë ì í î ï ñ ò ó ô õ ö œ ù ú û ü ÿ

! ? . , : ; - ' " / \ & + = _ ( )
```

All 136 Massive glyphs can also be downloaded separately from [`glyphs/svg`](glyphs/svg). Files are named with their Unicode code point.

## WEB USE

Copy the WOFF2 files and [`fonts/varythm.css`](fonts/varythm.css), then select one of the four family names.

```html
<link rel="stylesheet" href="fonts/varythm.css">
```

```css
.title {
  font-family: "Varythm Massive", sans-serif;
}
```

## SOURCE

```text
alphabet.js                  Original vector alphabet
app.js                       Interactive SVG renderer
fonts/                       TTF, WOFF2 and CSS
glyphs/svg/                  Individual Massive glyphs
scripts/build_font.py        Font builder
docs/images/                 Repository specimens
releases/                    Download packages
```

Build requirements: Python 3.10+, `fontTools` with Brotli support, and Node.js 18+.

```bash
python scripts/build_font.py
```

## LICENSE

Varythm is source-available. Personal, non-commercial evaluation is permitted. Commercial use, embedding, redistribution and derivative releases require written permission. See [`LICENSE.md`](LICENSE.md).

Original drawing and build provenance: [`ORIGINAL-ALPHABET.md`](ORIGINAL-ALPHABET.md).

© 2026 SAS LHOMME DEVELOPMENT AND INNOVATION.
