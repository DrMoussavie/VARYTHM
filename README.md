<div align="center">

# VARYTHM

`TYPEFACE 01 / 2026`

**CONTINUOUS BARCODE TYPEFACE / SVG GENERATOR**

[OPEN STUDIO](https://drmoussavie.github.io/VARYTHM/) · [DOWNLOAD V1.0.0](https://github.com/DrMoussavie/VARYTHM/releases/download/v1.0.0/Varythm-1.0.0.zip) · [LICENSE](LICENSE.md)

</div>

![Varythm family specimen](docs/images/varythm-glyphs.png)

## 01 / STUDIO

![Varythm Studio](docs/images/varythm-studio.png)

The browser tool renders text as a continuous set of vertical bars. Every bar
stays visible. Letter shapes are produced by local changes in width.

| Output | Motion | Controls |
| --- | --- | --- |
| SVG and PNG | fixed pointer mode or seeded playback | source weight, active bars, spacing, straight width, bulge, irregularity, aligned or loose ends, overflow, pointer spread, intensity and lateral shift |

Default pointer settings: `40 / 164 / 0`.

## 02 / DOWNLOAD

The [Varythm 1.0.0 release](https://github.com/DrMoussavie/VARYTHM/releases/tag/v1.0.0) contains:

- 4 installable TTF files;
- 4 WOFF2 webfonts;
- CSS `@font-face` declarations;
- 136 individual Massive SVG glyphs;
- the project license and documentation.

| Style | TTF | WOFF2 |
| --- | --- | --- |
| Massive | [download](fonts/Varythm-Massive.ttf) | [download](fonts/Varythm-Massive.woff2) |
| Condensed | [download](fonts/Varythm-Condensed.ttf) | [download](fonts/Varythm-Condensed.woff2) |
| Block | [download](fonts/Varythm-Block.ttf) | [download](fonts/Varythm-Block.woff2) |
| Slanted | [download](fonts/Varythm-Slanted.ttf) | [download](fonts/Varythm-Slanted.woff2) |

## 03 / CHARACTER SET

```text
ABCDEFGHIJKLMNOPQRSTUVWXYZ
abcdefghijklmnopqrstuvwxyz
0123456789

À Á Â Ã Ä Å Æ Ç È É Ê Ë Ì Í Î Ï Ñ Ò Ó Ô Õ Ö Œ Ù Ú Û Ü Ÿ
à á â ã ä å æ ç è é ê ë ì í î ï ñ ò ó ô õ ö œ ù ú û ü ÿ

! ? . , : ; - ' " / \ & + = _ ( )
```

The Massive cut is also available as 136 separate files in [`glyphs/svg`](glyphs/svg).
SVG filenames use Unicode code points.

## 04 / WEBFONT

Copy the WOFF2 files and [`fonts/varythm.css`](fonts/varythm.css), then use one
of the four family names:

```css
.title {
  font-family: "Varythm Massive", sans-serif;
}
```

## 05 / BUILD

Requirements: Python 3.10+, `fontTools` with Brotli support and Node.js 18+.

```bash
python scripts/build_font.py
```

The build reads the original vector skeletons from `alphabet.js`, then creates
the TTF, WOFF2, SVG and ZIP outputs.

```text
alphabet.js                  Original glyph skeletons and style profiles
app.js                       Interactive SVG renderer
fonts/                       TTF, WOFF2 and CSS files
glyphs/svg/                  Individual Massive glyphs
scripts/build_font.py        Font build
scripts/export-glyph-data.js Browser-to-build data bridge
docs/images/                 Repository specimens
releases/                    Download packages
```

## 06 / LICENSE

Varythm is source-available, not open source. Personal, non-commercial
evaluation is permitted. Commercial use, embedding, redistribution and
derivative releases require written permission. See [`LICENSE.md`](LICENSE.md).

Original drawing and build provenance: [`ORIGINAL-ALPHABET.md`](ORIGINAL-ALPHABET.md).

© 2026 SAS LHOMME DEVELOPMENT AND INNOVATION.
