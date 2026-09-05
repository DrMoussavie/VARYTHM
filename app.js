const SVG_NS = "http://www.w3.org/2000/svg";
const alphabet = window.BARRE_ALPHABET;

if (!alphabet) {
  throw new Error("The original Varythm alphabet could not be loaded.");
}

const ui = {
  text: document.querySelector("#textInput"),
  font: document.querySelector("#fontSelect"),
  alphabetWeight: document.querySelector("#alphabetWeight"),
  activeBars: document.querySelector("#activeBars"),
  spacing: document.querySelector("#spacing"),
  thinness: document.querySelector("#thinness"),
  bulge: document.querySelector("#bulge"),
  irregularity: document.querySelector("#irregularity"),
  edgeOverflow: document.querySelector("#edgeOverflow"),
  edgeSettings: document.querySelector("#edgeSettings"),
  alignedEdges: document.querySelector("#alignedEdges"),
  looseEdges: document.querySelector("#looseEdges"),
  mouseSpread: document.querySelector("#mouseSpread"),
  mouseIntensity: document.querySelector("#mouseIntensity"),
  mousePull: document.querySelector("#mousePull"),
  mouseSettings: document.querySelector("#mouseSettings"),
  randomMode: document.querySelector("#randomMode"),
  reactiveMode: document.querySelector("#reactiveMode"),
  modeStatus: document.querySelector("#modeStatus"),
  seed: document.querySelector("#seedInput"),
  ink: document.querySelector("#inkColor"),
  paper: document.querySelector("#paperColor"),
  randomize: document.querySelector("#randomize"),
  randomizeTop: document.querySelector("#randomizeTop"),
  downloadSvg: document.querySelector("#downloadSvg"),
  downloadPng: document.querySelector("#downloadPng"),
  svg: document.querySelector("#typeSvg"),
  artboard: document.querySelector("#artboard"),
  barCount: document.querySelector("#barCount"),
};

const rangeIds = [
  "alphabetWeight",
  "activeBars",
  "spacing",
  "thinness",
  "bulge",
  "irregularity",
  "edgeOverflow",
  "mouseSpread",
  "mouseIntensity",
  "mousePull",
];

let renderFrame = null;
let latestExport = null;
let randomLoopTimer = null;
let motionMode = "reactive";
let edgeMode = "aligned";
const pointer = { x: 0, y: 0, inside: false };

function hashSeed(value) {
  let hash = 1779033703 ^ value.length;
  for (let index = 0; index < value.length; index += 1) {
    hash = Math.imul(hash ^ value.charCodeAt(index), 3432918353);
    hash = (hash << 13) | (hash >>> 19);
  }
  hash = Math.imul(hash ^ (hash >>> 16), 2246822507);
  hash = Math.imul(hash ^ (hash >>> 13), 3266489909);
  return (hash ^ (hash >>> 16)) >>> 0;
}

function seededRandom(seed) {
  let state = hashSeed(seed);
  return function random() {
    let value = (state += 0x6d2b79f5);
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function between(random, min, max) {
  return min + (max - min) * random();
}

function svgNode(name, attributes = {}) {
  const node = document.createElementNS(SVG_NS, name);
  Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, String(value)));
  return node;
}

function catmullRom(points, shouldMove = true) {
  if (!points.length) return "";
  let path = shouldMove ? `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}` : "";
  for (let index = 0; index < points.length - 1; index += 1) {
    const previous = points[index - 1] || points[index];
    const current = points[index];
    const next = points[index + 1];
    const after = points[index + 2] || next;
    const control1X = current.x + (next.x - previous.x) / 6;
    const control1Y = current.y + (next.y - previous.y) / 6;
    const control2X = next.x - (after.x - current.x) / 6;
    const control2Y = next.y - (after.y - current.y) / 6;
    path += ` C ${control1X.toFixed(2)} ${control1Y.toFixed(2)}, ${control2X.toFixed(2)} ${control2Y.toFixed(2)}, ${next.x.toFixed(2)} ${next.y.toFixed(2)}`;
  }
  return path;
}

function readSettings() {
  const text = ui.text.value.trim().toLocaleUpperCase("fr-FR") || "VARYTHM";
  return {
    text,
    lines: text.split(/\r?\n/).slice(0, 2),
    variant: alphabet.getVariant(ui.font.value),
    alphabetWeight: Number(ui.alphabetWeight.value) / 100,
    activeBars: Number(ui.activeBars.value),
    spacing: Number(ui.spacing.value),
    thinness: Number(ui.thinness.value) / 100,
    bulge: Number(ui.bulge.value) / 100,
    irregularity: Number(ui.irregularity.value) / 100,
    edgeOverflow: Number(ui.edgeOverflow.value) / 100,
    mouseSpread: Number(ui.mouseSpread.value),
    mouseIntensity: Number(ui.mouseIntensity.value) / 100,
    mousePull: Number(ui.mousePull.value) / 100,
    seed: ui.seed.value.trim() || "VARYTHM",
    ink: ui.ink.value,
    paper: ui.paper.value,
  };
}

function measureText(settings) {
  const fontSize = 220;
  const tracking = fontSize * settings.variant.trackingScale;
  const lineHeight = 212;

  const lines = settings.lines.map((text, lineIndex) => {
    let cursor = 0;
    const glyphs = [];
    Array.from(text || " ").forEach((character, characterIndex, characters) => {
      const definition = alphabet.getGlyph(character);
      const advance = definition.width * fontSize * settings.variant.widthScale;
      if (!/\s/.test(character)) {
        glyphs.push({
          character,
          definition,
          start: cursor,
          end: cursor + advance,
          lineIndex,
        });
      }
      cursor += advance;
      if (characterIndex < characters.length - 1) cursor += tracking;
    });
    return {
      text: text || " ",
      glyphs,
      width: Math.max(cursor, fontSize * 0.35),
    };
  });

  return { fontSize, tracking, lineHeight, lines };
}

function createMaskSampler(settings, measured, layout) {
  const scale = 1.5;
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(layout.width * scale);
  canvas.height = Math.ceil(layout.height * scale);
  const context = canvas.getContext("2d", { willReadFrequently: true });
  context.scale(scale, scale);
  measured.lines.forEach((line, lineIndex) => {
    const top = layout.baselines[lineIndex] - measured.fontSize;
    line.glyphs.forEach((currentGlyph) => {
      alphabet.drawGlyph(
        context,
        currentGlyph.definition,
        layout.paddingX + currentGlyph.start,
        top,
        currentGlyph.end - currentGlyph.start,
        measured.fontSize,
        settings.variant,
        settings.alphabetWeight,
      );
    });
  });

  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;

  function alphaAt(x, y) {
    const pixelX = Math.max(0, Math.min(canvas.width - 1, Math.round(x * scale)));
    const pixelY = Math.max(0, Math.min(canvas.height - 1, Math.round(y * scale)));
    return pixels[(pixelY * canvas.width + pixelX) * 4 + 3] / 255;
  }

  return function sampleMask(x, y) {
    const verticalOffsets = [-10, -6, -3, 0, 3, 6, 10];
    const weights = [0.05, 0.1, 0.17, 0.36, 0.17, 0.1, 0.05];
    let amount = 0;
    verticalOffsets.forEach((offset, index) => {
      const horizontalPeak = Math.max(
        alphaAt(x - 1.25, y + offset),
        alphaAt(x, y + offset),
        alphaAt(x + 1.25, y + offset),
      );
      amount += horizontalPeak * weights[index];
    });
    return Math.min(1, amount);
  };
}

function createBarSpecs(width, settings) {
  const random = seededRandom(`${settings.seed}|${settings.text}|grid`);
  const specs = [];
  let center = settings.spacing * 0.45;
  while (center < width && specs.length < 220) {
    const widthVariation = between(random, 0.82, 1.18);
    const baseWidth = Math.max(0.7, settings.spacing * settings.thinness * widthVariation);
    const requestedMaximum = settings.spacing * settings.bulge * between(random, 0.86, 1.12);
    specs.push({
      center,
      baseWidth,
      maximumWidth: Math.max(baseWidth * 1.65, requestedMaximum),
      activeLines: new Set(),
      randomSeed: `${settings.seed}|${settings.text}|bar-${specs.length}`,
      ambientCenter: between(random, 0.28, 0.72),
      ambientSpread: between(random, 0.11, 0.24),
      ambientStrength: between(random, 0.28, 0.46),
      topEdge: between(random, -1, 0.35),
      bottomEdge: between(random, -0.35, 1),
    });
    center += settings.spacing * between(random, 0.96, 1.04);
  }
  return specs;
}

function assignActiveBars(specs, measured, layout, activeBarCount) {
  measured.lines.forEach((line, lineIndex) => {
    line.glyphs.forEach((glyph) => {
      const start = layout.paddingX + glyph.start;
      const end = layout.paddingX + glyph.end;
      const candidates = specs
        .map((spec, specIndex) => ({ spec, specIndex }))
        .filter(({ spec }) => spec.center >= start && spec.center <= end);
      const desiredCount = Math.min(activeBarCount, candidates.length);
      const alreadyChosen = new Set();

      for (let slot = 0; slot < desiredCount; slot += 1) {
        const target = start + ((slot + 0.5) / desiredCount) * (end - start);
        let bestIndex = -1;
        let bestDistance = Infinity;
        candidates.forEach(({ spec, specIndex }) => {
          if (alreadyChosen.has(specIndex)) return;
          const distance = Math.abs(spec.center - target);
          if (distance < bestDistance) {
            bestDistance = distance;
            bestIndex = specIndex;
          }
        });
        if (bestIndex >= 0) {
          alreadyChosen.add(bestIndex);
          specs[bestIndex].activeLines.add(lineIndex);
        }
      }
    });
  });
}

function buildBarPath(spec, settings, layout, sampleMask) {
  const edgeReach = layout.edgeRoom * settings.edgeOverflow;
  const startY =
    edgeMode === "loose" ? layout.coreTop + spec.topEdge * edgeReach : layout.coreTop;
  const endY =
    edgeMode === "loose" ? layout.coreBottom + spec.bottomEdge * edgeReach : layout.coreBottom;
  const barHeight = Math.max(1, endY - startY);
  const rows = Math.max(70, Math.round(barHeight / 3.5));
  const left = [];
  const right = [];
  const random = seededRandom(spec.randomSeed);
  const phase = between(random, 0, Math.PI * 2);
  const bias = between(random, -1, 1);

  for (let row = 0; row <= rows; row += 1) {
    const progress = row / rows;
    const y = startY + progress * barHeight;
    const lineIndex = layout.lineBands.findIndex((band) => y >= band.top && y <= band.bottom);
    const canBulge = lineIndex >= 0 && spec.activeLines.has(lineIndex);
    const amount = canBulge ? sampleMask(spec.center, y) : 0;
    const eased = amount * amount * (3 - 2 * amount);

    // Every line breathes once, even when it does not participate in a letter.
    const ambientDistance = (progress - spec.ambientCenter) / spec.ambientSpread;
    const ambientBulge = Math.exp(-0.5 * ambientDistance * ambientDistance) * spec.ambientStrength;
    const pointerRadiusX = settings.mouseSpread;
    const pointerRadiusY = settings.mouseSpread * 1.35;
    const pointerDistanceX = (spec.center - pointer.x) / pointerRadiusX;
    const pointerDistanceY = (y - pointer.y) / pointerRadiusY;
    const pointerBulge =
      motionMode === "reactive" && pointer.inside
        ? Math.exp(-0.5 * (pointerDistanceX ** 2 + pointerDistanceY ** 2)) *
          settings.mouseIntensity
        : 0;
    const combinedBulge = Math.min(
      2.4,
      ambientBulge +
        eased * (1 - ambientBulge * 0.35) +
        pointerBulge * (1 - Math.max(ambientBulge, eased) * 0.45),
    );

    const widthNoise =
      1 +
      combinedBulge * settings.irregularity *
        (Math.sin(progress * Math.PI * 5 + phase) * 0.1 + between(random, -0.035, 0.035));
    const localWidth =
      spec.baseWidth + (spec.maximumWidth - spec.baseWidth) * combinedBulge * widthNoise;
    const asymmetricShift =
      combinedBulge * settings.irregularity * spec.maximumWidth *
        (bias * 0.08 + Math.sin(progress * Math.PI * 3 + phase) * 0.035) +
      pointerBulge * settings.mousePull * (pointer.x - spec.center) * 0.032;

    left.push({ x: spec.center + asymmetricShift - localWidth / 2, y });
    right.push({ x: spec.center + asymmetricShift + localWidth / 2, y });
  }

  const reverseRight = [...right].reverse();
  return `${catmullRom(left)} L ${reverseRight[0].x.toFixed(2)} ${reverseRight[0].y.toFixed(2)}${catmullRom(reverseRight, false)} Z`;
}

function render() {
  const settings = readSettings();
  const measured = measureText(settings);
  const paddingX = 46;
  const paddingY = 42;
  const contentWidth = Math.max(...measured.lines.map((line) => line.width));
  const contentHeight = measured.fontSize + (measured.lines.length - 1) * measured.lineHeight;
  const width = contentWidth + paddingX * 2;
  const coreHeight = contentHeight + paddingY * 2;
  const edgeRoom = edgeMode === "loose" ? Math.max(34, contentHeight * 0.16) : 0;
  const height = coreHeight + edgeRoom * 2;
  const coreTop = edgeRoom;
  const coreBottom = edgeRoom + coreHeight;
  const baselines = measured.lines.map(
    (_, lineIndex) => coreTop + paddingY + measured.fontSize + lineIndex * measured.lineHeight,
  );
  const lineBands = baselines.map((baseline) => ({
    top: baseline - measured.fontSize,
    bottom: baseline + measured.fontSize * 0.06,
  }));
  const layout = {
    width,
    height,
    paddingX,
    paddingY,
    baselines,
    lineBands,
    edgeRoom,
    coreTop,
    coreBottom,
  };

  const sampleMask = createMaskSampler(settings, measured, layout);
  const specs = createBarSpecs(width, settings);
  assignActiveBars(specs, measured, layout, settings.activeBars);

  ui.svg.replaceChildren();
  ui.svg.setAttribute("viewBox", `0 0 ${width.toFixed(2)} ${height.toFixed(2)}`);
  ui.svg.setAttribute("style", `background-color:${settings.paper}`);
  ui.artboard.style.setProperty("--preview-paper", settings.paper);

  const title = svgNode("title", { id: "svgTitle" });
  title.textContent = `Continuous lettering: ${settings.text.replace(/\n/g, " ")}`;
  const description = svgNode("desc", { id: "svgDesc" });
  description.textContent =
    "A continuous barcode whose local changes in width reveal the text.";
  ui.svg.append(title, description);
  ui.svg.append(svgNode("rect", { width, height, fill: settings.paper }));

  const group = svgNode("g", { fill: settings.ink });
  specs.forEach((spec) => {
    group.append(
      svgNode("path", {
        d: buildBarPath(spec, settings, layout, sampleMask),
        "data-active": spec.activeLines.size ? "true" : "false",
      }),
    );
  });
  ui.svg.append(group);

  const activeCount = specs.filter((spec) => spec.activeLines.size).length;
  ui.barCount.textContent = `${specs.length} BARS · ${activeCount} ACTIVE`;

  latestExport = {
    width,
    height,
    fileName: makeFileName(settings.text),
    svg: serializeSvg(ui.svg),
  };
}

function serializeSvg(svg) {
  const copy = svg.cloneNode(true);
  copy.setAttribute("xmlns", SVG_NS);
  const viewBox = copy.getAttribute("viewBox").split(" ");
  copy.setAttribute("width", viewBox[2]);
  copy.setAttribute("height", viewBox[3]);
  return `<?xml version="1.0" encoding="UTF-8"?>\n${new XMLSerializer().serializeToString(copy)}`;
}

function makeFileName(text) {
  const slug = text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `varythm-${slug || "composition"}`;
}

function scheduleRender() {
  cancelAnimationFrame(renderFrame);
  renderFrame = requestAnimationFrame(render);
}

function updateRange(input) {
  const min = Number(input.min);
  const max = Number(input.max);
  const value = Number(input.value);
  const position = ((value - min) / (max - min)) * 100;
  input.style.setProperty("--position", `${position}%`);
  const output = document.querySelector(`#${input.id}Value`);
  if (output) output.value = value;
}

function randomize() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  const suffix = Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
  ui.seed.value = `VARYTHM-${suffix}`;
  scheduleRender();
}

const glyphGroups = [
  { label: "Capitals", characters: "ABCDEFGHIJKLMNOPQRSTUVWXYZ" },
  { label: "Unicase lowercase", characters: "abcdefghijklmnopqrstuvwxyz" },
  { label: "Numerals", characters: "0123456789" },
  {
    label: "Accented capitals + ligatures",
    characters: "ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÑÒÓÔÕÖŒÙÚÛÜŸ",
  },
  {
    label: "Accented lowercase + ligatures",
    characters: "àáâãäåæçèéêëìíîïñòóôõöœùúûüÿ",
  },
  { label: "Punctuation", characters: "!?.,:;-'\"/\\&+=_()" },
];

function codePointLabel(character) {
  return `U+${character.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")}`;
}

function renderGlyphLibrary() {
  const library = document.querySelector("#glyphGrid");
  if (!library) return;

  glyphGroups.forEach(({ label, characters }) => {
    const section = document.createElement("section");
    section.className = "glyph-group";

    const heading = document.createElement("h3");
    heading.textContent = `${label} · ${Array.from(characters).length}`;

    const grid = document.createElement("div");
    grid.className = "glyph-grid";

    Array.from(characters).forEach((character) => {
      const codePoint = codePointLabel(character);
      const card = document.createElement("a");
      card.className = "glyph-card";
      card.href = `glyphs/svg/${codePoint}.svg`;
      card.download = `${codePoint}.svg`;
      card.title = `Download ${character} as SVG`;

      const preview = document.createElement("span");
      preview.className = "glyph-preview";
      preview.textContent = character;

      const meta = document.createElement("span");
      meta.className = "glyph-meta";
      const characterLabel = document.createElement("span");
      characterLabel.textContent = character;
      const code = document.createElement("code");
      code.textContent = codePoint;
      meta.append(characterLabel, code);

      card.append(preview, meta);
      grid.append(card);
    });

    section.append(heading, grid);
    library.append(section);
  });
}

function stopRandomLoop() {
  if (randomLoopTimer) {
    clearInterval(randomLoopTimer);
    randomLoopTimer = null;
  }
}

function updateMotionUi() {
  const isRandom = motionMode === "random";
  ui.randomMode.classList.toggle("is-active", isRandom);
  ui.randomMode.setAttribute("aria-pressed", String(isRandom));
  ui.reactiveMode.classList.toggle("is-active", !isRandom);
  ui.reactiveMode.setAttribute("aria-pressed", String(!isRandom));
  ui.artboard.classList.toggle("is-reactive", !isRandom);
  ui.mouseSettings.classList.toggle("is-disabled", isRandom);
  [ui.mouseSpread, ui.mouseIntensity, ui.mousePull].forEach((control) => {
    control.disabled = isRandom;
  });
  ui.modeStatus.textContent = isRandom
    ? "New seed every 1.2 seconds"
    : "Move the pointer over the preview";
}

function setMotionMode(mode) {
  stopRandomLoop();
  motionMode = mode;
  pointer.inside = false;
  updateMotionUi();

  if (mode === "random") {
    randomize();
    randomLoopTimer = setInterval(randomize, 1200);
  } else {
    scheduleRender();
  }
}

function updateEdgeUi() {
  const isLoose = edgeMode === "loose";
  ui.alignedEdges.classList.toggle("is-active", !isLoose);
  ui.alignedEdges.setAttribute("aria-pressed", String(!isLoose));
  ui.looseEdges.classList.toggle("is-active", isLoose);
  ui.looseEdges.setAttribute("aria-pressed", String(isLoose));
  ui.edgeSettings.classList.toggle("is-disabled", !isLoose);
  ui.edgeOverflow.disabled = !isLoose;
}

function setEdgeMode(mode) {
  edgeMode = mode;
  updateEdgeUi();
  scheduleRender();
}

function updatePointer(event) {
  if (motionMode !== "reactive" || !latestExport) return;
  const bounds = ui.artboard.getBoundingClientRect();
  const scale = Math.min(
    bounds.width / latestExport.width,
    bounds.height / latestExport.height,
  );
  const renderedWidth = latestExport.width * scale;
  const renderedHeight = latestExport.height * scale;
  const offsetX = (bounds.width - renderedWidth) / 2;
  const offsetY = (bounds.height - renderedHeight) / 2;
  pointer.x = (event.clientX - bounds.left - offsetX) / scale;
  pointer.y = (event.clientY - bounds.top - offsetY) / scale;
  pointer.inside =
    pointer.x >= 0 &&
    pointer.x <= latestExport.width &&
    pointer.y >= 0 &&
    pointer.y <= latestExport.height;
  scheduleRender();
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function downloadSvg() {
  if (!latestExport) return;
  downloadBlob(
    new Blob([latestExport.svg], { type: "image/svg+xml;charset=utf-8" }),
    `${latestExport.fileName}.svg`,
  );
}

function downloadPng() {
  if (!latestExport) return;
  const source = new Blob([latestExport.svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(source);
  const image = new Image();
  image.onload = () => {
    const scale = Math.min(4, Math.max(1, 2600 / latestExport.width));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(latestExport.width * scale);
    canvas.height = Math.round(latestExport.height * scale);
    const context = canvas.getContext("2d");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (blob) downloadBlob(blob, `${latestExport.fileName}.png`);
      URL.revokeObjectURL(url);
    }, "image/png");
  };
  image.src = url;
}

rangeIds.forEach((id) => {
  const input = ui[id];
  updateRange(input);
  input.addEventListener("input", () => {
    updateRange(input);
    scheduleRender();
  });
});

[ui.text, ui.font, ui.seed, ui.ink, ui.paper].forEach((control) => {
  control.addEventListener("input", scheduleRender);
  control.addEventListener("change", scheduleRender);
});

ui.randomize.addEventListener("click", randomize);
ui.randomizeTop.addEventListener("click", randomize);
ui.randomMode.addEventListener("click", () => setMotionMode("random"));
ui.reactiveMode.addEventListener("click", () => setMotionMode("reactive"));
ui.alignedEdges.addEventListener("click", () => setEdgeMode("aligned"));
ui.looseEdges.addEventListener("click", () => setEdgeMode("loose"));
ui.artboard.addEventListener("pointermove", updatePointer);
ui.artboard.addEventListener("pointerleave", () => {
  if (!pointer.inside) return;
  pointer.inside = false;
  scheduleRender();
});
ui.downloadSvg.addEventListener("click", downloadSvg);
ui.downloadPng.addEventListener("click", downloadPng);

updateMotionUi();
updateEdgeUi();
renderGlyphLibrary();
render();
