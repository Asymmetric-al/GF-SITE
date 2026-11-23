import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

/**
 * Clean ISO 32000-1 PDF Post-Processor for Chromium-exported Brand Kit PDFs.
 * Performs lossless classic-xref in-place object replacement (zero duplicate
 * incremental /MediaBox objects!) for:
 *  1. Per-page /BleedBox and /TrimBox injection on 0.125in bleed card PDFs.
 *  2. Fused outline /Title whitespace repair (e.g., "Local ChurchPlanters" -> "Local Church Planters").
 *  3. Logical Arabic /ActualText + /StructElem tagging on multilingual PDFs so
 *     both visual Noto Naskh Arabic rendering AND logical UTF-8 extraction pass
 *     cleanly in PDFium, Acrobat, NVDA, JAWS, and VoiceOver.
 */

interface ParsedPdfObj {
  readonly objNum: number;
  readonly genNum: number;
  readonly bodyBuf: Buffer;
}

interface ParsedPdfStructure {
  readonly headerBuf: Buffer;
  readonly objects: readonly ParsedPdfObj[];
  readonly rootRef: string;
  readonly infoRef: string | null;
}

interface XrefEntry {
  readonly off: number;
  readonly gen: number;
}

const toUtf16BeHex = (text: string): string => {
  const buf = Buffer.from(text, "utf16le");
  buf.swap16();

  return `<FEFF${buf.toString("hex").toUpperCase()}>`;
};

const fromUtf16BeHex = (hexStr: string): string => {
  const clean = hexStr.replaceAll(/\s+/gu, "");

  if (clean.length < 4 || clean.length % 2 !== 0) {
    return "";
  }

  const raw = Buffer.from(clean, "hex");

  if (raw.length >= 2 && raw[0] === 0xfe && raw[1] === 0xff) {
    const payload = Buffer.from(raw.subarray(2));

    if (payload.length % 2 !== 0) {
      return "";
    }

    payload.swap16();

    return payload.toString("utf16le");
  }

  return raw.toString("latin1");
};

const parseXrefOffsets = (xrefText: string): Map<number, XrefEntry> => {
  const offsets = new Map<number, XrefEntry>();
  const lines = xrefText.split(/\r?\n/u);
  let idx = 0;

  while (idx < lines.length && lines[idx].trim() !== "xref") {
    idx += 1;
  }

  idx += 1;

  while (idx < lines.length) {
    const line = lines[idx].trim();

    if (line.startsWith("trailer") || line.length === 0) {
      break;
    }

    const secMatch = /^(?<start>\d+)\s+(?<count>\d+)$/u.exec(line);

    if (secMatch?.groups === undefined) {
      idx += 1;
      continue;
    }

    const startNum = Number(secMatch.groups.start);
    const count = Number(secMatch.groups.count);
    idx += 1;

    for (let k = 0; k < count && idx < lines.length; k += 1, idx += 1) {
      const entry = /^(?<off>\d{10})\s+(?<gen>\d{5})\s+(?<flag>[nf])$/u.exec(
        lines[idx].trim()
      );

      if (
        entry?.groups !== undefined &&
        entry.groups.flag === "n" &&
        startNum + k > 0
      ) {
        offsets.set(startNum + k, {
          off: Number(entry.groups.off),
          gen: Number(entry.groups.gen),
        });
      }
    }
  }

  return offsets;
};

const parseClassicPdf = (filePath: string): ParsedPdfStructure => {
  const buf = fs.readFileSync(filePath);
  const raw = buf.toString("latin1");

  const startXrefMatch = /startxref\r?\n(?<pos>\d+)\r?\n%%EOF/u.exec(raw);
  const tail = raw.slice(-1024);
  const rootMatch = /\/Root\s+(?<root>\d+\s+\d+\s+R)/u.exec(tail);
  const infoMatch = /\/Info\s+(?<info>\d+\s+\d+\s+R)/u.exec(tail);

  if (
    startXrefMatch?.groups?.pos === undefined ||
    rootMatch?.groups?.root === undefined
  ) {
    throw new Error(
      `Could not parse classic PDF xref/trailer in ${path.basename(filePath)}`
    );
  }

  const xrefPos = Number(startXrefMatch.groups.pos);
  const offsets = parseXrefOffsets(raw.slice(xrefPos));

  const sortedByOff = [...offsets.entries()].toSorted(
    (a, b) => a[1].off - b[1].off
  );

  if (sortedByOff.length === 0) {
    throw new Error(
      `No active PDF objects parsed from xref in ${path.basename(filePath)}`
    );
  }

  const [firstEntry] = sortedByOff;
  const headerBuf = buf.subarray(0, firstEntry[1].off);
  const objects: ParsedPdfObj[] = [];

  for (let i = 0; i < sortedByOff.length; i += 1) {
    const [objNum, meta] = sortedByOff[i];

    const nextOff =
      i + 1 < sortedByOff.length ? sortedByOff[i + 1][1].off : xrefPos;

    const slice = buf.subarray(meta.off, nextOff);
    const sliceStr = slice.toString("latin1");
    const hdrMatch = /^\d+\s+\d+\s+obj\r?\n?/u.exec(sliceStr);
    const endObjIdx = sliceStr.lastIndexOf("endobj");

    if (hdrMatch === null || endObjIdx === -1) {
      throw new Error(
        `Malformed PDF object ${objNum} in ${path.basename(filePath)}`
      );
    }

    const [hdrToken] = hdrMatch;
    const bodyBuf = Buffer.from(slice.subarray(hdrToken.length, endObjIdx));

    objects.push({
      objNum,
      genNum: meta.gen,
      bodyBuf,
    });
  }

  return {
    headerBuf,
    objects,
    rootRef: rootMatch.groups.root,
    infoRef: infoMatch?.groups?.info ?? null,
  };
};

const writeRebuiltPdf = (
  filePath: string,
  parsed: ParsedPdfStructure,
  replacements: ReadonlyMap<number, Buffer>
): void => {
  const chunks: Buffer[] = [parsed.headerBuf];
  let cursor = parsed.headerBuf.length;

  const objByNum = new Map<
    number,
    { readonly genNum: number; readonly body: Buffer }
  >();

  let maxObjNum = 0;

  for (const obj of parsed.objects) {
    const body = replacements.get(obj.objNum) ?? obj.bodyBuf;
    objByNum.set(obj.objNum, { genNum: obj.genNum, body });

    if (obj.objNum > maxObjNum) {
      maxObjNum = obj.objNum;
    }
  }

  const newOffsets = new Map<number, number>();

  for (let n = 1; n <= maxObjNum; n += 1) {
    const entry = objByNum.get(n);

    if (entry === undefined) {
      continue;
    }

    newOffsets.set(n, cursor);
    const prefix = Buffer.from(`${n} ${entry.genNum} obj\n`, "latin1");

    const bodyTrimEnd =
      entry.body.length > 0 && entry.body.at(-1) === 0x0a
        ? entry.body
        : Buffer.concat([entry.body, Buffer.from("\n", "latin1")]);

    const suffix = Buffer.from("endobj\n", "latin1");

    chunks.push(prefix, bodyTrimEnd, suffix);
    cursor += prefix.length + bodyTrimEnd.length + suffix.length;
  }

  const xrefOffset = cursor;

  const xrefLines: string[] = [
    "xref\n",
    `0 ${maxObjNum + 1}\n`,
    "0000000000 65535 f \n",
  ];

  for (let n = 1; n <= maxObjNum; n += 1) {
    const off = newOffsets.get(n);
    const entry = objByNum.get(n);

    if (off === undefined || entry === undefined) {
      xrefLines.push("0000000000 65535 f \n");
    } else {
      xrefLines.push(
        `${String(off).padStart(10, "0")} ${String(entry.genNum).padStart(5, "0")} n \n`
      );
    }
  }

  const infoLine = parsed.infoRef === null ? "" : `/Info ${parsed.infoRef}\n`;

  const trailerStr = [
    ...xrefLines,
    "trailer\n",
    `<</Size ${maxObjNum + 1}\n/Root ${parsed.rootRef}\n${infoLine}>>\n`,
    "startxref\n",
    `${xrefOffset}\n`,
    "%%EOF\n",
  ].join("");

  chunks.push(Buffer.from(trailerStr, "latin1"));
  fs.writeFileSync(filePath, Buffer.concat(chunks));
};

const extractTopDict = (bodyStr: string): string | null => {
  const dictStart = bodyStr.indexOf("<<");

  if (dictStart === -1) {
    return null;
  }

  let depth = 0;

  for (let i = dictStart; i < bodyStr.length - 1; i += 1) {
    if (bodyStr[i] === "<" && bodyStr[i + 1] === "<") {
      depth += 1;
      i += 1;
    } else if (bodyStr[i] === ">" && bodyStr[i + 1] === ">") {
      depth -= 1;
      i += 1;

      if (depth === 0) {
        return bodyStr.slice(dictStart, i + 1);
      }
    }
  }

  return null;
};

/**
 * Cleanly replaces /BleedBox and /TrimBox IN PLACE on every /Type /Page object
 * (zero duplicate incremental /MediaBox copies!).
 */
export const applyCleanPdfBleedAndTrimBoxes = (
  filePath: string,
  bleedPt: number,
  bleedWpt: number,
  bleedHpt: number
): void => {
  const parsed = parseClassicPdf(filePath);
  const replacements = new Map<number, Buffer>();

  const trimMaxX = (bleedWpt - bleedPt).toFixed(2).replace(/\.00$/u, "");
  const trimMaxY = (bleedHpt - bleedPt).toFixed(2).replace(/\.00$/u, "");
  const bPt = bleedPt.toFixed(2).replace(/\.00$/u, "");
  const bW = bleedWpt.toFixed(2).replace(/\.00$/u, "");
  const bH = bleedHpt.toFixed(2).replace(/\.00$/u, "");

  for (const obj of parsed.objects) {
    const str = obj.bodyBuf.toString("latin1");
    const dict = extractTopDict(str);

    if (dict === null || !/\/Type\s*\/Page\b(?!s)/u.test(dict)) {
      continue;
    }

    const updatedDict = dict
      .replaceAll(/\/(?:TrimBox|BleedBox)\s*\[[^\]]+\]\s*/gu, "")
      .replace(
        /(?<mediaBox>\/MediaBox\s*\[[^\]]+\])/u,
        `$<mediaBox>\n/BleedBox [0 0 ${bW} ${bH}]\n/TrimBox [${bPt} ${bPt} ${trimMaxX} ${trimMaxY}]`
      );

    replacements.set(obj.objNum, Buffer.from(`${updatedDict}\n`, "latin1"));
  }

  if (replacements.size === 0) {
    throw new Error(
      `No /Type /Page objects found for clean TrimBox rewrite in ${path.basename(filePath)}`
    );
  }

  writeRebuiltPdf(filePath, parsed, replacements);
};

/**
 * Repairs Chromium's wrapped-heading PDF outline /Title concatenation
 * (including lowercase-to-lowercase joins like "missionaryarrives" or
 * comma-to-lowercase joins like "books,open") by matching against exact
 * normalized DOM heading strings extracted during Playwright export, plus a
 * safe regex fallback for camelCase and comma spacing.
 */
const normalizeHeadingKey = (raw: string): string =>
  raw.toLowerCase().replaceAll(/[\s\u00A0\u2018\u2019\u201C\u201D'"`]+/gu, "");

const escapePdfLiteral = (text: string): string =>
  text.replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)");

export const repairPdfOutlineTitles = (
  filePath: string,
  domHeadings: readonly string[] = []
): void => {
  const parsed = parseClassicPdf(filePath);
  const replacements = new Map<number, Buffer>();

  const domHeadingMap = new Map<string, string>();

  for (const h of domHeadings) {
    const clean = h.replaceAll(/\s+/gu, " ").trim();

    if (clean.length > 0) {
      domHeadingMap.set(normalizeHeadingKey(clean), clean);
    }
  }

  for (const obj of parsed.objects) {
    const str = obj.bodyBuf.toString("latin1");

    if (!str.includes("/Title") || !str.includes("/Dest")) {
      continue;
    }

    let changed = false;

    const repairTitleValue = (rawText: string): string | null => {
      const domMatch = domHeadingMap.get(normalizeHeadingKey(rawText));

      if (domMatch !== undefined && domMatch !== rawText) {
        return domMatch;
      }

      const spaced = rawText
        .replaceAll(/(?<low>[a-z])(?<up>[A-Z])/gu, "$<low> $<up>")
        .replaceAll(/,(?<ch>[A-Za-z])/gu, ", $<ch>");

      if (spaced !== rawText) {
        return spaced;
      }

      return null;
    };

    let fixed = str.replaceAll(
      /\/Title\s*\((?<title>(?:\\.|[^)])+)\)/gu,
      (full, title: string) => {
        const unescaped = title
          .replaceAll("\\(", "(")
          .replaceAll("\\)", ")")
          .replaceAll("\\\\", "\\");

        const repaired = repairTitleValue(unescaped);

        if (repaired === null) {
          return full;
        }

        changed = true;

        if (/^[\u0020-\u007E]+$/u.test(repaired)) {
          return `/Title (${escapePdfLiteral(repaired)})`;
        }

        return `/Title ${toUtf16BeHex(repaired)}`;
      }
    );

    fixed = fixed.replaceAll(
      /\/Title\s*<(?<hex>[0-9A-Fa-f\s]+)>/gu,
      (full, hexVal: string) => {
        const decoded = fromUtf16BeHex(hexVal);

        if (decoded.length === 0) {
          return full;
        }

        const repaired = repairTitleValue(decoded);

        if (repaired === null) {
          return full;
        }

        changed = true;

        if (/^[\u0020-\u007E]+$/u.test(repaired)) {
          return `/Title (${escapePdfLiteral(repaired)})`;
        }

        return `/Title ${toUtf16BeHex(repaired)}`;
      }
    );

    if (changed) {
      replacements.set(obj.objNum, Buffer.from(fixed, "latin1"));
    }
  }

  if (replacements.size > 0) {
    writeRebuiltPdf(filePath, parsed, replacements);
  }
};

/**
 * Ensures the PDF /Info dictionary declares a clean, explicit /Title
 * (UTF-16BE for non-ASCII titles such as Arabic WCAG 2.2 PDF/UA 2.4.2 compliance,
 * or pure ASCII literal for neutral restricted prayer-card titles).
 */
export const ensurePdfDocumentTitle = (
  filePath: string,
  title: string
): void => {
  const parsed = parseClassicPdf(filePath);

  if (parsed.infoRef === null) {
    return;
  }

  const infoNumMatch = /^(?<num>\d+)\s+\d+\s+R$/u.exec(parsed.infoRef.trim());

  if (infoNumMatch?.groups?.num === undefined) {
    return;
  }

  const infoObjNum = Number(infoNumMatch.groups.num);
  const infoObj = parsed.objects.find((o) => o.objNum === infoObjNum);

  if (infoObj === undefined) {
    return;
  }

  const infoStr = infoObj.bodyBuf.toString("latin1");
  const dict = extractTopDict(infoStr);

  if (dict === null) {
    return;
  }

  const encodedTitle = /^[\u0020-\u007E]+$/u.test(title)
    ? `(${escapePdfLiteral(title)})`
    : toUtf16BeHex(title);

  const stripped = dict.replace(
    /\/Title\s*(?:\((?:\\.|[^)])*\)|<[0-9A-Fa-f\s]*>)\s*/u,
    ""
  );

  const updated = stripped.replace(/>>$/u, `/Title ${encodedTitle}>>`);

  const replacements = new Map<number, Buffer>([
    [infoObjNum, Buffer.from(`${updated}\n`, "latin1")],
  ]);

  writeRebuiltPdf(filePath, parsed, replacements);
};

interface ArabicStructTarget {
  readonly structObjNum: number;
  readonly pageObjNum: number;
  readonly mcids: readonly number[];
  readonly dictStr: string;
}

interface ArabicPageItem {
  readonly target: ArabicStructTarget;
  readonly text: string;
}

const collectLeafMcids = (
  objMap: ReadonlyMap<number, Buffer>,
  structObjNum: number,
  visited = new Set<number>()
): readonly { readonly pageObjNum: number; readonly mcid: number }[] => {
  if (visited.has(structObjNum)) {
    return [];
  }

  visited.add(structObjNum);
  const str = (objMap.get(structObjNum) ?? Buffer.alloc(0)).toString("latin1");
  const results: { readonly pageObjNum: number; readonly mcid: number }[] = [];

  const pgMatch = /\/Pg\s+(?<pg>\d+)\s+0\s+R/u.exec(str);

  const pageObjNum =
    pgMatch?.groups?.pg === undefined ? null : Number(pgMatch.groups.pg);

  const kMatch = /\/K\s+(?<val>\[[^\]]*\]|\d+\s+0\s+R|\d+)/u.exec(str);

  if (kMatch?.groups?.val === undefined) {
    return results;
  }

  const val = kMatch.groups.val.trim();
  const childRefs = [...val.matchAll(/(?<ref>\d+)\s+0\s+R/gu)];

  for (const cr of childRefs) {
    const childNum = Number(cr.groups?.ref);

    if (Number.isFinite(childNum)) {
      results.push(...collectLeafMcids(objMap, childNum, visited));
    }
  }

  const cleanedNoRefs = val.replaceAll(/\d+\s+0\s+R/gu, "");

  for (const numM of cleanedNoRefs.matchAll(/\b(?<mcid>\d+)\b/gu)) {
    const mcid = Number(numM.groups?.mcid);

    if (pageObjNum !== null && Number.isFinite(mcid)) {
      results.push({ pageObjNum, mcid });
    }
  }

  return results;
};

const collectArabicTargets = (
  parsed: ParsedPdfStructure,
  objMap: ReadonlyMap<number, Buffer>
): readonly ArabicStructTarget[] => {
  const arabicTargets: ArabicStructTarget[] = [];

  for (const obj of parsed.objects) {
    const str = obj.bodyBuf.toString("latin1");

    if (!str.includes("/Lang (ar)")) {
      continue;
    }

    const leaves = collectLeafMcids(objMap, obj.objNum);

    if (leaves.length === 0) {
      continue;
    }

    const [firstLeaf] = leaves;

    const mcids = [...new Set(leaves.map((l) => l.mcid))].toSorted(
      (a, b) => a - b
    );

    arabicTargets.push({
      structObjNum: obj.objNum,
      pageObjNum: firstLeaf.pageObjNum,
      mcids,
      dictStr: str,
    });
  }

  return arabicTargets.toSorted(
    (a, b) => a.pageObjNum - b.pageObjNum || a.mcids[0] - b.mcids[0]
  );
};

interface BalancedMcidRange {
  readonly start: number;
  readonly headerEnd: number;
  readonly bodyEnd: number;
  readonly end: number;
}

const findBalancedMcidRange = (
  streamText: string,
  mcid: number,
  pageObjNum: number,
  filePath: string
): BalancedMcidRange => {
  const openRe = new RegExp(
    `/(?<tag>[A-Za-z0-9]+)\\s*<<\\s*/MCID\\s+${mcid}\\s*>>\\s*BDC\\r?\\n?`,
    "u"
  );

  const openMatch = openRe.exec(streamText);

  if (openMatch === null) {
    throw new Error(
      `Could not locate /MCID ${mcid} opening BDC on page obj ${pageObjNum} in ${path.basename(filePath)}`
    );
  }

  const start = openMatch.index;
  const [openTok] = openMatch;
  const headerEnd = start + openTok.length;
  const tail = streamText.slice(headerEnd);
  const lines = tail.split("\n");
  let depth = 1;
  let offset = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    const lineLen = line.length + 1;

    if (trimmed.endsWith(" BDC") || trimmed.endsWith(" BMC")) {
      depth += 1;
    } else if (trimmed === "EMC") {
      depth -= 1;

      if (depth === 0) {
        const bodyEnd = headerEnd + offset;
        const end = Math.min(streamText.length, bodyEnd + line.length);

        return { start, headerEnd, bodyEnd, end };
      }
    }

    offset += lineLen;
  }

  throw new Error(
    `Could not locate balanced EMC for /MCID ${mcid} on page obj ${pageObjNum} in ${path.basename(filePath)}`
  );
};

const stripInnerTextMarkedContent = (insideBt: string): readonly string[] => {
  const cleaned: string[] = [];
  let skipDepth = 0;

  for (const line of insideBt.split(/\r?\n/u)) {
    const trimmed = line.trim();

    if (trimmed.length === 0) {
      continue;
    }

    if (
      trimmed === "/ReversedChars BMC" ||
      trimmed.startsWith("/Span<</ActualText")
    ) {
      skipDepth += 1;
      continue;
    }

    if (trimmed === "EMC" && skipDepth > 0) {
      skipDepth -= 1;
      continue;
    }

    cleaned.push(line);
  }

  return cleaned;
};

const rewriteArabicMcidBlock = (
  streamText: string,
  mcid: number,
  text: string,
  state: { emittedPrimary: boolean },
  pageObjNum: number,
  filePath: string
): string => {
  const range = findBalancedMcidRange(streamText, mcid, pageObjNum, filePath);
  const innerBody = streamText.slice(range.headerEnd, range.bodyEnd);

  const rewrittenBody = innerBody.replaceAll(
    /BT\r?\n(?<inside>[\s\S]*?)\r?\nET/gu,
    (_full, inside: string) => {
      const cleanedLines = stripInnerTextMarkedContent(inside);
      const isPrimaryBlock = !state.emittedPrimary;
      state.emittedPrimary = true;

      const spanHeader = isPrimaryBlock
        ? `/Span<</Lang (ar) /ActualText ${toUtf16BeHex(text)}>> BDC`
        : "/Span<</ActualText ()>> BDC";

      return ["BT", spanHeader, ...cleanedLines, "EMC", "ET"].join("\n");
    }
  );

  return (
    streamText.slice(0, range.headerEnd) +
    rewrittenBody +
    streamText.slice(range.bodyEnd)
  );
};

const rewriteArabicPageStream = (
  objMap: ReadonlyMap<number, Buffer>,
  pageObjNum: number,
  items: readonly ArabicPageItem[],
  filePath: string
): { readonly contentObjNum: number; readonly rebuiltBuf: Buffer } | null => {
  const pageStr = (objMap.get(pageObjNum) ?? Buffer.alloc(0)).toString(
    "latin1"
  );

  const contentsMatch = /\/Contents\s+(?<cid>\d+)\s+0\s+R/u.exec(pageStr);

  if (contentsMatch?.groups?.cid === undefined) {
    return null;
  }

  const contentObjNum = Number(contentsMatch.groups.cid);
  const contentBuf = objMap.get(contentObjNum);

  if (contentBuf === undefined) {
    return null;
  }

  const contentStr = contentBuf.toString("latin1");
  const streamMatch = /stream\r?\n/u.exec(contentStr);
  const endStreamIdx = contentStr.lastIndexOf("endstream");

  if (streamMatch === null || endStreamIdx === -1) {
    return null;
  }

  const compressedSlice = contentBuf.subarray(
    streamMatch.index + streamMatch[0].length,
    endStreamIdx
  );

  let streamText = zlib.inflateSync(compressedSlice).toString("latin1");

  for (const { target, text } of items) {
    const state = { emittedPrimary: false };

    for (const mcid of target.mcids) {
      streamText = rewriteArabicMcidBlock(
        streamText,
        mcid,
        text,
        state,
        pageObjNum,
        filePath
      );
    }

    if (!state.emittedPrimary) {
      throw new Error(
        `Arabic StructElem ${target.structObjNum} had zero BT..ET text blocks in ${path.basename(filePath)} (text: "${text.slice(0, 40)}")`
      );
    }
  }

  const recompressed = zlib.deflateSync(Buffer.from(streamText, "latin1"));

  const rebuiltBuf = Buffer.concat([
    Buffer.from(
      `<</Filter /FlateDecode /Length ${recompressed.length}>>\nstream\n`,
      "latin1"
    ),
    recompressed,
    Buffer.from("\nendstream\n", "latin1"),
  ]);

  return { contentObjNum, rebuiltBuf };
};

/**
 * Replaces Chromium Skia's reversed/shattered per-glyph Arabic /ReversedChars
 * emission with clean ISO 32000-1 /Span<</Lang (ar) /ActualText <FEFF...>>>
 * wrapping directly around the real Noto Naskh Arabic visual glyph runs, plus
 * matching /ActualText <FEFF...> on each /Lang (ar) /StructElem.
 */
export const injectLogicalArabicPdfTags = (
  filePath: string,
  logicalArabicPassages: readonly string[]
): number => {
  const parsed = parseClassicPdf(filePath);
  const objMap = new Map(parsed.objects.map((o) => [o.objNum, o.bodyBuf]));
  const arabicTargets = collectArabicTargets(parsed, objMap);

  if (arabicTargets.length !== logicalArabicPassages.length) {
    throw new Error(
      `Arabic StructElem count (${arabicTargets.length}) != DOM [lang="ar"] passage count (${logicalArabicPassages.length}) in ${path.basename(filePath)}`
    );
  }

  const replacements = new Map<number, Buffer>();
  const targetsByPage = new Map<number, ArabicPageItem[]>();

  for (const [idx, target] of arabicTargets.entries()) {
    const text = logicalArabicPassages[idx];
    const list = targetsByPage.get(target.pageObjNum) ?? [];
    list.push({ target, text });
    targetsByPage.set(target.pageObjNum, list);

    const cleanStruct = target.dictStr
      .replace(/\/ActualText\s*(?:<[^>]*>|\([^)]*\))\s*/u, "")
      .replace(
        /\/Lang\s*\(ar\)/u,
        `/Lang (ar)\n/ActualText ${toUtf16BeHex(text)}`
      );

    replacements.set(target.structObjNum, Buffer.from(cleanStruct, "latin1"));
  }

  for (const [pageObjNum, items] of targetsByPage.entries()) {
    const updated = rewriteArabicPageStream(
      objMap,
      pageObjNum,
      items,
      filePath
    );

    if (updated !== null) {
      replacements.set(updated.contentObjNum, updated.rebuiltBuf);
    }
  }

  writeRebuiltPdf(filePath, parsed, replacements);

  return arabicTargets.length;
};
