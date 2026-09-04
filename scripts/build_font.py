#!/usr/bin/env python3
"""Build the installable Varythm family from its original vector skeletons."""

from __future__ import annotations

import argparse
import hashlib
import json
import math
import random
import shutil
import subprocess
import zipfile
from pathlib import Path

from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.ttLib import TTFont


ROOT = Path(__file__).resolve().parents[1]
FONTS_DIR = ROOT / "fonts"
GLYPHS_DIR = ROOT / "glyphs" / "svg"
RELEASES_DIR = ROOT / "releases"

UNITS_PER_EM = 1000
CAP_HEIGHT = 900
ASCENT = 1020
DESCENT = -130
BAR_SPACING = 64
ACTIVE_BARS = 12
BASE_THINNESS = 0.10
BULGE_VOLUME = 0.69
IRREGULARITY = 1.0
BUILD_SEED = "VARYTHM-2408"

STYLE_FILES = {
    "massive": "Massive",
    "condensed": "Condensed",
    "block": "Block",
    "slanted": "Slanted",
}


def load_source() -> dict:
    completed = subprocess.run(
        ["node", str(ROOT / "scripts" / "export-glyph-data.js")],
        cwd=ROOT,
        check=True,
        capture_output=True,
        text=True,
        encoding="utf-8",
    )
    return json.loads(completed.stdout)


def seeded_random(*parts: object) -> random.Random:
    digest = hashlib.sha256("|".join(map(str, parts)).encode("utf-8")).digest()
    return random.Random(int.from_bytes(digest[:8], "big"))


def distance_to_segment(
    x: float,
    y: float,
    start: tuple[float, float],
    end: tuple[float, float],
) -> float:
    vx = end[0] - start[0]
    vy = end[1] - start[1]
    length_squared = vx * vx + vy * vy
    if length_squared == 0:
        return math.hypot(x - start[0], y - start[1])
    t = max(0.0, min(1.0, ((x - start[0]) * vx + (y - start[1]) * vy) / length_squared))
    projected_x = start[0] + t * vx
    projected_y = start[1] + t * vy
    return math.hypot(x - projected_x, y - projected_y)


def transform_strokes(
    definition: dict,
    profile: dict,
    origin_x: float,
    glyph_width: float,
) -> list[tuple[tuple[float, float], tuple[float, float], float]]:
    transformed = []
    for stroke in definition["strokes"]:
        points = []
        for x, y in stroke["points"]:
            transformed_x = origin_x + (
                0.5
                + (x - 0.5) * profile["geometryScale"]
                + (0.5 - y) * profile["slant"]
            ) * glyph_width
            transformed_y = (1 - y) * CAP_HEIGHT
            points.append((transformed_x, transformed_y))
        half_width = CAP_HEIGHT * profile["strokeScale"] * float(stroke["scale"]) / 2
        if len(points) == 1:
            transformed.append((points[0], points[0], half_width))
        else:
            transformed.extend(
                (points[index], points[index + 1], half_width)
                for index in range(len(points) - 1)
            )
    return transformed


def mask_amount(
    x: float,
    y: float,
    segments: list[tuple[tuple[float, float], tuple[float, float], float]],
) -> float:
    amount = 0.0
    softness = 9.0
    for start, end, half_width in segments:
        reach = half_width + softness
        if (
            x < min(start[0], end[0]) - reach
            or x > max(start[0], end[0]) + reach
            or y < min(start[1], end[1]) - reach
            or y > max(start[1], end[1]) + reach
        ):
            continue
        distance = distance_to_segment(x, y, start, end)
        local = max(0.0, min(1.0, (half_width + softness - distance) / (softness * 2)))
        if local >= 1:
            return 1.0
        amount = max(amount, local)
    return amount


def choose_active_bars(centers: list[float], start: float, end: float) -> set[int]:
    candidates = [index for index, center in enumerate(centers) if start <= center <= end]
    desired = min(ACTIVE_BARS, len(candidates))
    selected: set[int] = set()
    for slot in range(desired):
        target = start + ((slot + 0.5) / desired) * (end - start)
        available = [index for index in candidates if index not in selected]
        if available:
            selected.add(min(available, key=lambda index: abs(centers[index] - target)))
    return selected


def build_bar_polygons(
    character: str,
    definition: dict,
    style_id: str,
    profile: dict,
) -> tuple[list[list[tuple[float, float]]], int]:
    raw_width = definition["width"] * UNITS_PER_EM * profile["widthScale"]
    tracking = UNITS_PER_EM * profile["trackingScale"]
    advance = max(320, math.ceil((raw_width + tracking) / BAR_SPACING) * BAR_SPACING)
    origin_x = (advance - raw_width) / 2
    centers = [center for center in range(BAR_SPACING // 2, advance, BAR_SPACING)]
    active = choose_active_bars(centers, origin_x, origin_x + raw_width)
    strokes = transform_strokes(definition, profile, origin_x, raw_width)
    polygons = []

    for bar_index, center in enumerate(centers):
        bar_random = seeded_random(BUILD_SEED, style_id, ord(character), bar_index)
        base_width = max(
            5.0,
            BAR_SPACING * BASE_THINNESS * bar_random.uniform(0.82, 1.18),
        )
        maximum_width = max(
            base_width * 1.65,
            BAR_SPACING * BULGE_VOLUME * bar_random.uniform(0.86, 1.12),
        )
        ambient_center = bar_random.uniform(0.28, 0.72)
        ambient_spread = bar_random.uniform(0.11, 0.24)
        ambient_strength = bar_random.uniform(0.28, 0.46)
        phase = bar_random.uniform(0, math.pi * 2)
        bias = bar_random.uniform(-1, 1)
        left = []
        right = []

        rows = 100
        for row in range(rows + 1):
            y = (row / rows) * CAP_HEIGHT
            progress = 1 - y / CAP_HEIGHT
            amount = (
                mask_amount(center, y, strokes)
                if bar_index in active and strokes
                else 0.0
            )
            eased = amount * amount * (3 - 2 * amount)
            ambient_distance = (progress - ambient_center) / ambient_spread
            ambient = math.exp(-0.5 * ambient_distance * ambient_distance) * ambient_strength
            combined = min(2.4, ambient + eased * (1 - ambient * 0.35))
            width_noise = 1 + combined * IRREGULARITY * (
                math.sin(progress * math.pi * 5 + phase) * 0.10
                + bar_random.uniform(-0.035, 0.035)
            )
            local_width = base_width + (maximum_width - base_width) * combined * width_noise
            shift = (
                combined
                * IRREGULARITY
                * maximum_width
                * (bias * 0.08 + math.sin(progress * math.pi * 3 + phase) * 0.035)
            )
            left.append((center + shift - local_width / 2, y))
            right.append((center + shift + local_width / 2, y))

        polygons.append(left + list(reversed(right)))

    return polygons, advance


def polygon_glyph(polygons: list[list[tuple[float, float]]]):
    pen = TTGlyphPen(None)
    for polygon in polygons:
        if not polygon:
            continue
        pen.moveTo(polygon[0])
        for current in polygon[1:]:
            pen.lineTo(current)
        pen.closePath()
    return pen.glyph()


def notdef_glyph():
    pen = TTGlyphPen(None)
    pen.moveTo((60, 0))
    pen.lineTo((60, CAP_HEIGHT))
    pen.lineTo((580, CAP_HEIGHT))
    pen.lineTo((580, 0))
    pen.closePath()
    pen.moveTo((130, 90))
    pen.lineTo((510, 90))
    pen.lineTo((510, 810))
    pen.lineTo((130, 810))
    pen.closePath()
    return pen.glyph()


def glyph_name(character: str) -> str:
    if character == " ":
        return "space"
    if character == "\\":
        return "backslash"
    if character == "'":
        return "quotesingle"
    if character == '"':
        return "quotedbl"
    if character.isascii() and character.isalpha():
        return character
    if character.isascii() and character.isdigit():
        names = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"]
        return names[int(character)]
    ascii_names = {
        "!": "exclam",
        "?": "question",
        ".": "period",
        ",": "comma",
        ":": "colon",
        ";": "semicolon",
        "-": "hyphen",
        "/": "slash",
        "&": "ampersand",
        "+": "plus",
        "=": "equal",
        "_": "underscore",
        "(": "parenleft",
        ")": "parenright",
    }
    return ascii_names.get(character, f"uni{ord(character):04X}")


def svg_file_name(character: str) -> str:
    return f"U+{ord(character):04X}.svg"


def write_svg(character: str, polygons: list[list[tuple[float, float]]], advance: int) -> None:
    commands = []
    for polygon in polygons:
        if not polygon:
            continue
        commands.append(
            "M "
            + " L ".join(f"{x:.2f} {CAP_HEIGHT - y:.2f}" for x, y in polygon)
            + " Z"
        )
    label = character.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    content = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {advance} {CAP_HEIGHT}" '
        f'role="img" aria-label="Varythm {label}">\n'
        f'  <rect width="{advance}" height="{CAP_HEIGHT}" fill="#f0eee7"/>\n'
        f'  <path d="{" ".join(commands)}" fill="#11100e"/>\n'
        "</svg>\n"
    )
    (GLYPHS_DIR / svg_file_name(character)).write_text(content, encoding="utf-8")


def build_style(source: dict, style_id: str, style_name: str) -> tuple[Path, Path]:
    profile = source["variants"][style_id]
    glyph_order = [".notdef"]
    glyphs = {".notdef": notdef_glyph()}
    metrics = {".notdef": (640, 0)}
    character_map = {}

    for character in source["characters"]:
        name = glyph_name(character)
        polygons, advance = build_bar_polygons(
            character,
            source["glyphs"][character],
            style_id,
            profile,
        )
        glyph_order.append(name)
        glyphs[name] = polygon_glyph(polygons)
        metrics[name] = (advance, 0)
        character_map[ord(character)] = name
        if style_id == "massive":
            write_svg(character, polygons, advance)

    family_name = source["family"]
    full_name = f"{family_name} {style_name}"
    postscript_name = f"{family_name}-{style_name}"
    font = FontBuilder(UNITS_PER_EM, isTTF=True)
    font.setupGlyphOrder(glyph_order)
    font.setupCharacterMap(character_map)
    font.setupGlyf(glyphs)
    font.setupHorizontalMetrics(metrics)
    font.setupHorizontalHeader(ascent=ASCENT, descent=DESCENT)
    font.setupNameTable(
        {
            "familyName": family_name,
            "styleName": style_name,
            "uniqueFontIdentifier": f"Varythm {source['version']} {style_name}",
            "fullName": full_name,
            "psName": postscript_name,
            "version": f"Version {source['version']}",
            "manufacturer": "SAS LHOMME DEVELOPMENT AND INNOVATION",
            "designer": "Varythm project",
            "description": "A continuous barcode display typeface revealed by local variations in stroke width.",
            "licenseDescription": "Copyright 2026 SAS LHOMME DEVELOPMENT AND INNOVATION. See LICENSE.md.",
        }
    )
    font.setupOS2(
        sTypoAscender=ASCENT,
        sTypoDescender=DESCENT,
        sTypoLineGap=80,
        usWinAscent=ASCENT,
        usWinDescent=abs(DESCENT),
        sxHeight=650,
        sCapHeight=CAP_HEIGHT,
        fsType=0,
    )
    font.setupPost(keepGlyphNames=True)
    font.setupMaxp()

    ttf_path = FONTS_DIR / f"Varythm-{style_name}.ttf"
    font.save(ttf_path)

    woff2_path = FONTS_DIR / f"Varythm-{style_name}.woff2"
    web_font = TTFont(ttf_path)
    web_font.flavor = "woff2"
    web_font.save(woff2_path)
    return ttf_path, woff2_path


def write_css() -> None:
    rules = []
    for style_name in STYLE_FILES.values():
        rules.append(
            "@font-face {\n"
            f"  font-family: 'Varythm {style_name}';\n"
            f"  src: url('./Varythm-{style_name}.woff2') format('woff2');\n"
            "  font-style: normal;\n"
            "  font-weight: 400;\n"
            "  font-display: swap;\n"
            "}\n"
        )
    (FONTS_DIR / "varythm.css").write_text("\n".join(rules), encoding="utf-8")


def write_release(source: dict, font_paths: list[Path]) -> Path:
    release_path = RELEASES_DIR / f"Varythm-{source['version']}.zip"
    with zipfile.ZipFile(release_path, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        for font_path in font_paths:
            archive.write(font_path, f"Varythm-{source['version']}/fonts/{font_path.name}")
        archive.write(ROOT / "LICENSE.md", f"Varythm-{source['version']}/LICENSE.md")
        archive.write(ROOT / "README.md", f"Varythm-{source['version']}/README.md")
        for image_path in sorted((ROOT / "docs" / "images").glob("*.png")):
            archive.write(
                image_path,
                f"Varythm-{source['version']}/docs/images/{image_path.name}",
            )
        for svg_path in sorted(GLYPHS_DIR.glob("*.svg")):
            archive.write(
                svg_path,
                f"Varythm-{source['version']}/glyphs-svg/{svg_path.name}",
            )
    return release_path


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--package-only",
        action="store_true",
        help="rebuild CSS and the release ZIP from existing font binaries",
    )
    arguments = parser.parse_args()
    source = load_source()
    FONTS_DIR.mkdir(parents=True, exist_ok=True)
    RELEASES_DIR.mkdir(parents=True, exist_ok=True)
    outputs = [
        path
        for style_name in STYLE_FILES.values()
        for path in (
            FONTS_DIR / f"Varythm-{style_name}.ttf",
            FONTS_DIR / f"Varythm-{style_name}.woff2",
        )
    ]

    if not arguments.package_only:
        if GLYPHS_DIR.exists():
            shutil.rmtree(GLYPHS_DIR)
        GLYPHS_DIR.mkdir(parents=True)
        outputs = []
        for style_id, style_name in STYLE_FILES.items():
            outputs.extend(build_style(source, style_id, style_name))

    missing = [path for path in outputs if not path.exists()]
    if missing:
        raise FileNotFoundError(f"Missing built font: {missing[0]}")
    write_css()
    outputs.append(FONTS_DIR / "varythm.css")
    release_path = write_release(source, outputs)

    print(f"Varythm {source['version']} built successfully")
    for output in outputs:
        print(f"- {output.relative_to(ROOT)} ({output.stat().st_size:,} bytes)")
    print(f"- {release_path.relative_to(ROOT)} ({release_path.stat().st_size:,} bytes)")
    print(f"- {len(list(GLYPHS_DIR.glob('*.svg')))} SVG glyph specimens")


if __name__ == "__main__":
    main()
