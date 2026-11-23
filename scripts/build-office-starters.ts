import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

import {
  DECK_SHARED_STRINGS,
  DECK_SLIDES,
  MULTILINGUAL_WITNESS_SCRIPTS,
} from "./brand-deck-data";

/**
 * Zero-dependency deterministic OOXML builder (v15.0) generating six genuine editable lean-staff starters
 * dynamically hydrated from `brand-kit/tokens/tokens.json` (Harbor Teal / Kiln Clay / Candle Apricot / Warm Paper):
 *   1. brand-kit/office/worker-prayer-letter-public-starter.docx
 *      - Branded letterhead with embedded logo PNG, occasion-neutral editable headline, named Word/Docs styles, and Calibri/Georgia fallbacks
 *   2. brand-kit/office/worker-prayer-letter-restricted-starter.docx
 *      - Safe-by-default Tier 2/3 edition with ZERO header logo, ZERO GF name/address/EIN, and collective-only default signature
 *   3. brand-kit/office/local-only-meeting-sheet-starter.docx
 *      - Editable Level 4 Zero-Attribution local congregation meeting/prayer sheet (neutral Noto/Arial styles, ZERO GF branding, metadata, or media)
 *   4. brand-kit/office/local-fellowship-brief-arabic-rtl-starter.docx
 *      - Editable Level 4 Zero-Attribution Arabic-First RTL local fellowship brief (<w:bidi/> / <w:rtl/>, ZERO GF branding, metadata, or media)
 *   5. brand-kit/office/donor-receipt-and-redesignation-starter.docx
 *      - Branded Finance & Donor Care manual fill-in letter starter (first-gift/recurring thank-you + IRS 501(c)(3) substantiation, PCI-safe failed card note, worker-transition/closed-fund re-designation notice, January annual statement cover letter)
 *   6. brand-kit/office/global-fellowship-deck-starter.pptx
 *      - Full 8-slide 16:9 widescreen deck generated 100% verbatim from shared `scripts/brand-deck-data.ts` (exact parity with GF-TPL-10)
 *      - Embedded contextual street photograph (`gf-street-tea-table.jpg`) + opaque caption on Slide 1, per-script multilingual font runs on Slide 4, 5 reusable Slide Layouts with real <p:ph> placeholders, embedded logos, clickable mailto links, single specimen hold per slide, and speaker notes
 */

interface TokenColorEntry {
  readonly $value: { readonly hex: string };
}

interface TokensDoc {
  readonly color: Record<string, TokenColorEntry>;
}

const isTokensDoc = (val: unknown): val is TokensDoc =>
  typeof val === "object" &&
  val !== null &&
  "color" in val &&
  typeof val.color === "object" &&
  val.color !== null &&
  !Array.isArray(val.color);

const rawTokensParsed: unknown = JSON.parse(
  fs.readFileSync(path.resolve("brand-kit/tokens/tokens.json"), "utf-8")
);

if (!isTokensDoc(rawTokensParsed)) {
  throw new Error(
    "Invalid color token structure in brand-kit/tokens/tokens.json"
  );
}

const tokensDoc = rawTokensParsed;

const hex6 = (tokenKey: string): string => {
  const entry = tokensDoc.color[tokenKey];

  if (entry === undefined) {
    throw new Error(
      `Missing color token "${tokenKey}" in brand-kit/tokens/tokens.json`
    );
  }

  return entry.$value.hex.replace(/^#/u, "").toUpperCase();
};

const C = {
  paper: hex6("paper"),
  linen: hex6("paper-subtle"),
  ink: hex6("ink"),
  harbor: hex6("harbor"),
  harborDeep: hex6("harbor-deep"),
  harborCard: hex6("harbor-card"),
  clay: hex6("clay"),
  apricot: hex6("apricot"),
  seaMist: hex6("sea-mist"),
  mistText: hex6("mist-text"),
  notice: hex6("notice-surface"),
  slate: hex6("slate"),
  rule: hex6("rule"),
  borderDark: hex6("border-dark"),
  forest: hex6("forest"),
  crimson: hex6("crimson"),
} as const;

interface ZipEntry {
  readonly name: string;
  readonly data: Buffer;
}

const createZipBuffer = (entries: readonly ZipEntry[]): Buffer => {
  const localParts: Buffer[] = [];
  const centralParts: Buffer[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBuf = Buffer.from(entry.name, "utf-8");
    const raw = entry.data;
    const compressed = zlib.deflateRawSync(raw);
    const crc = zlib.crc32(raw);

    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04_03_4b_50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0, 6);
    localHeader.writeUInt16LE(8, 8);
    localHeader.writeUInt16LE(0, 10);
    localHeader.writeUInt16LE(0x5d_75, 12);
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(compressed.length, 18);
    localHeader.writeUInt32LE(raw.length, 22);
    localHeader.writeUInt16LE(nameBuf.length, 26);
    localHeader.writeUInt16LE(0, 28);

    localParts.push(localHeader, nameBuf, compressed);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02_01_4b_50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0, 8);
    centralHeader.writeUInt16LE(8, 10);
    centralHeader.writeUInt16LE(0, 12);
    centralHeader.writeUInt16LE(0x5d_75, 14);
    centralHeader.writeUInt32LE(crc, 16);
    centralHeader.writeUInt32LE(compressed.length, 20);
    centralHeader.writeUInt32LE(raw.length, 24);
    centralHeader.writeUInt16LE(nameBuf.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(offset, 42);

    centralParts.push(centralHeader, nameBuf);
    offset += localHeader.length + nameBuf.length + compressed.length;
  }

  const centralDir = Buffer.concat(centralParts);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06_05_4b_50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(centralDir.length, 12);
  eocd.writeUInt32LE(offset, 16);
  eocd.writeUInt16LE(0, 20);

  return Buffer.concat([...localParts, centralDir, eocd]);
};

const xmlEscape = (text: string): string =>
  text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const officeDir = path.resolve("brand-kit/office");

fs.mkdirSync(officeDir, { recursive: true });

const legacySingleDocx = path.join(
  officeDir,
  "worker-prayer-letter-starter.docx"
);

if (fs.existsSync(legacySingleDocx)) {
  fs.unlinkSync(legacySingleDocx);
}

const logoLightPng = fs.readFileSync(
  path.resolve("brand-kit/logos/png/gf-lockup-horizontal-2x.png")
);

const logoReversedPng = fs.readFileSync(
  path.resolve("brand-kit/logos/png/gf-lockup-horizontal-reversed-2x.png")
);

const logoMonoPng = fs.readFileSync(
  path.resolve("brand-kit/logos/png/gf-lockup-horizontal-mono-2x.png")
);

const coverStreetTeaJpg = fs.readFileSync(
  path.resolve("brand-kit/photography/gf-street-tea-table.jpg")
);

// =========================================================================
// 1. SHARED DOCX STYLES & FALLBACK FONT TABLE (Harbor Teal / Kiln Clay / Charcoal Ink)
// =========================================================================

const docxStylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="Source Serif 4" w:hAnsi="Source Serif 4" w:cs="Noto Sans"/>
        <w:color w:val="${C.ink}"/>
        <w:sz w:val="22"/>
        <w:szCs w:val="22"/>
      </w:rPr>
    </w:rPrDefault>
    <w:pPrDefault>
      <w:pPr>
        <w:spacing w:after="160" w:line="320" w:lineRule="auto"/>
      </w:pPr>
    </w:pPrDefault>
  </w:docDefaults>
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:qFormat/>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Kicker">
    <w:name w:val="GF Kicker"/>
    <w:basedOn w:val="Normal"/>
    <w:qFormat/>
    <w:pPr>
      <w:pBdr><w:bottom w:val="single" w:sz="12" w:space="6" w:color="${C.clay}"/></w:pBdr>
      <w:spacing w:after="140"/>
    </w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="Plus Jakarta Sans" w:hAnsi="Plus Jakarta Sans"/>
      <w:b/>
      <w:color w:val="${C.harbor}"/>
      <w:sz w:val="18"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="heading 1"/>
    <w:basedOn w:val="Normal"/>
    <w:qFormat/>
    <w:pPr><w:spacing w:before="80" w:after="200" w:line="276" w:lineRule="auto"/></w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="Source Serif 4" w:hAnsi="Source Serif 4"/>
      <w:b/>
      <w:color w:val="${C.ink}"/>
      <w:sz w:val="42"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading2">
    <w:name w:val="heading 2"/>
    <w:basedOn w:val="Normal"/>
    <w:qFormat/>
    <w:pPr><w:spacing w:before="180" w:after="100"/></w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="Plus Jakarta Sans" w:hAnsi="Plus Jakarta Sans"/>
      <w:b/>
      <w:color w:val="${C.harbor}"/>
      <w:sz w:val="22"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="PrayerPrompt">
    <w:name w:val="GF Prayer Prompt"/>
    <w:basedOn w:val="Normal"/>
    <w:qFormat/>
    <w:pPr>
      <w:pBdr><w:left w:val="single" w:sz="18" w:space="10" w:color="${C.clay}"/></w:pBdr>
      <w:ind w:left="240"/>
      <w:spacing w:after="110" w:line="300" w:lineRule="auto"/>
    </w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="Source Serif 4" w:hAnsi="Source Serif 4"/>
      <w:color w:val="${C.ink}"/>
      <w:sz w:val="21"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="PrivacyNotice">
    <w:name w:val="GF Privacy Notice"/>
    <w:basedOn w:val="Normal"/>
    <w:qFormat/>
    <w:pPr>
      <w:pBdr><w:left w:val="single" w:sz="24" w:space="12" w:color="${C.harbor}"/></w:pBdr>
      <w:shd w:val="clear" w:color="auto" w:fill="${C.notice}"/>
      <w:ind w:left="180" w:right="140"/>
      <w:spacing w:before="160" w:after="160"/>
    </w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="Plus Jakarta Sans" w:hAnsi="Plus Jakarta Sans"/>
      <w:b/>
      <w:color w:val="${C.harborDeep}"/>
      <w:sz w:val="18"/>
    </w:rPr>
  </w:style>
</w:styles>`;

const docxFontTableXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:fonts xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:font w:name="Plus Jakarta Sans"><w:altName w:val="Calibri"/><w:family w:val="swiss"/></w:font>
  <w:font w:name="Source Serif 4"><w:altName w:val="Georgia"/><w:family w:val="roman"/></w:font>
  <w:font w:name="Noto Sans"><w:altName w:val="Calibri"/><w:family w:val="swiss"/></w:font>
  <w:font w:name="Calibri"><w:family w:val="swiss"/></w:font>
  <w:font w:name="Georgia"><w:family w:val="roman"/></w:font>
</w:fonts>`;

const wStyledPara = (styleId: string, text: string): string =>
  `<w:p><w:pPr><w:pStyle w:val="${styleId}"/></w:pPr><w:r><w:t xml:space="preserve">${xmlEscape(text)}</w:t></w:r></w:p>`;

// =========================================================================
// 1A. BUILD brand-kit/office/worker-prayer-letter-public-starter.docx (Open Regions)
// =========================================================================

const publicHeaderXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:p>
    <w:pPr><w:pBdr><w:bottom w:val="single" w:sz="8" w:space="6" w:color="${C.rule}"/></w:pBdr><w:spacing w:after="120"/></w:pPr>
    <w:r>
      <w:drawing>
        <wp:inline distT="0" distB="0" distL="0" distR="0" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing">
          <wp:extent cx="1554480" cy="300300"/>
          <wp:docPr id="1" name="Global Fellowship Header Lockup"/>
          <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
            <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
              <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
                <pic:nvPicPr><pic:cNvPr id="0" name="gf-lockup-horizontal-2x.png"/><pic:cNvPicPr/></pic:nvPicPr>
                <pic:blipFill><a:blip r:embed="rId1"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>
                <pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="1554480" cy="300300"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr>
              </pic:pic>
            </a:graphicData>
          </a:graphic>
        </wp:inline>
      </w:drawing>
    </w:r>
  </w:p>
</w:hdr>`;

const publicFooterXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:p>
    <w:pPr><w:pBdr><w:top w:val="single" w:sz="6" w:space="6" w:color="${C.rule}"/></w:pBdr><w:spacing w:before="80" w:after="0"/></w:pPr>
    <w:r>
      <w:rPr><w:rFonts w:ascii="Plus Jakarta Sans" w:hAnsi="Plus Jakarta Sans"/><w:color w:val="${C.slate}"/><w:sz w:val="16"/></w:rPr>
      <w:t xml:space="preserve">Global Fellowship, Inc. (501(c)(3) EIN 68-0214543)  |  P.O. Box 1, Meadow Vista, CA 95722  |  Church Planting · Local Leadership · Unreached People</w:t>
    </w:r>
  </w:p>
</w:ftr>`;

const publicDocxXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    ${wStyledPara("Kicker", "PUBLIC WORKER PRAYER LETTER STARTER (OPEN REGIONS ONLY)  |  WORD, LIBREOFFICE & GOOGLE DOCS")}
    ${wStyledPara("Normal", "[CLEARED REGION]  |  [MONTH YEAR]  |  For Partial (Tier 2) or Restricted (Tier 3) regions, switch to the separate zero-logo Restricted Prayer Letter starter in this office folder.")}
    ${wStyledPara("Heading1", "[Replace with your headline: e.g., Singing at a river baptism / A slower month of rest]")}
    ${wStyledPara("Normal", "Dear friends,")}
    ${wStyledPara("Normal", "[Option A: Joyful Thanksgiving. Share one concrete scene of baptism, Scripture reading, or hospitality in your local congregation. Put local leaders first as active subjects; name the Bible translation beside any Scripture quote.]")}
    ${wStyledPara("Normal", "[Option B: Rest or Hard Season (Health Above Results). You never have to manufacture monthly victories. One brief paragraph, or a single sentence asking friends to pray while you rest with your regional care lead's blessing, is complete.]")}
    ${wStyledPara("Heading2", "THREE CONCRETE WAYS TO REJOICE AND PRAY WITH US")}
    ${wStyledPara("PrayerPrompt", "1. Give thanks: [Name one clear grace of God this month without inflating counts or taking credit.]")}
    ${wStyledPara("PrayerPrompt", "2. Ask for deep local roots: [Name one specific prayer request for local elders, new believers, or mother-tongue Scripture study.]")}
    ${wStyledPara("PrayerPrompt", "3. Remember [me / our household]: [Share one specific prayer request for health, rest, children, or friendship.]")}
    ${wStyledPara("Normal", "How can our fellowship pray for your household or church this month? Simply reply to this letter.")}
    ${wStyledPara("Normal", "[Your Approved Display Name]  |  [Approved Contact Email]  |  Designation: [Code]")}
    ${wStyledPara("Normal", "SPECIMEN STARTER: Replace all bracketed placeholders and confirm signed revocable consent before sending.")}
    <w:sectPr>
      <w:headerReference w:type="default" r:id="rId2"/>
      <w:footerReference w:type="default" r:id="rId3"/>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1296" w:right="1152" w:bottom="1152" w:left="1152" w:header="540" w:footer="540"/>
    </w:sectPr>
  </w:body>
</w:document>`;

const publicDocxEntries: ZipEntry[] = [
  {
    name: "[Content_Types].xml",
    data: Buffer.from(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/fontTable.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.fontTable+xml"/><Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/><Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>`,
      "utf-8"
    ),
  },
  {
    name: "_rels/.rels",
    data: Buffer.from(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>`,
      "utf-8"
    ),
  },
  {
    name: "docProps/core.xml",
    data: Buffer.from(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>Global Fellowship Public Worker Prayer Letter Starter</dc:title><dc:creator>Global Fellowship</dc:creator></cp:coreProperties>`,
      "utf-8"
    ),
  },
  {
    name: "word/_rels/document.xml.rels",
    data: Buffer.from(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/><Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/fontTable" Target="fontTable.xml"/></Relationships>`,
      "utf-8"
    ),
  },
  {
    name: "word/_rels/header1.xml.rels",
    data: Buffer.from(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/logo.png"/></Relationships>`,
      "utf-8"
    ),
  },
  { name: "word/media/logo.png", data: logoLightPng },
  { name: "word/styles.xml", data: Buffer.from(docxStylesXml, "utf-8") },
  { name: "word/fontTable.xml", data: Buffer.from(docxFontTableXml, "utf-8") },
  { name: "word/header1.xml", data: Buffer.from(publicHeaderXml, "utf-8") },
  { name: "word/footer1.xml", data: Buffer.from(publicFooterXml, "utf-8") },
  { name: "word/document.xml", data: Buffer.from(publicDocxXml, "utf-8") },
];

fs.writeFileSync(
  path.join(officeDir, "worker-prayer-letter-public-starter.docx"),
  createZipBuffer(publicDocxEntries)
);

// =========================================================================
// 1B. BUILD brand-kit/office/worker-prayer-letter-restricted-starter.docx (Safe-by-Default Zero-Logo Tier 2/3)
// =========================================================================

const restrictedStylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="Noto Serif" w:hAnsi="Noto Serif" w:cs="Noto Sans"/>
        <w:color w:val="1A1D24"/>
        <w:sz w:val="22"/>
        <w:szCs w:val="22"/>
      </w:rPr>
    </w:rPrDefault>
    <w:pPrDefault>
      <w:pPr>
        <w:spacing w:after="160" w:line="320" w:lineRule="auto"/>
      </w:pPr>
    </w:pPrDefault>
  </w:docDefaults>
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:qFormat/>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Kicker">
    <w:name w:val="Private Kicker"/>
    <w:basedOn w:val="Normal"/>
    <w:qFormat/>
    <w:pPr>
      <w:pBdr><w:bottom w:val="single" w:sz="8" w:space="6" w:color="4B5357"/></w:pBdr>
      <w:spacing w:after="140"/>
    </w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="Noto Sans" w:hAnsi="Noto Sans"/>
      <w:b/>
      <w:color w:val="1A1D24"/>
      <w:sz w:val="18"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="heading 1"/>
    <w:basedOn w:val="Normal"/>
    <w:qFormat/>
    <w:pPr><w:spacing w:before="80" w:after="200" w:line="276" w:lineRule="auto"/></w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="Noto Serif" w:hAnsi="Noto Serif"/>
      <w:b/>
      <w:color w:val="1A1D24"/>
      <w:sz w:val="38"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading2">
    <w:name w:val="heading 2"/>
    <w:basedOn w:val="Normal"/>
    <w:qFormat/>
    <w:pPr><w:spacing w:before="180" w:after="100"/></w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="Noto Sans" w:hAnsi="Noto Sans"/>
      <w:b/>
      <w:color w:val="1A1D24"/>
      <w:sz w:val="22"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="PrayerPrompt">
    <w:name w:val="Prayer Prompt"/>
    <w:basedOn w:val="Normal"/>
    <w:qFormat/>
    <w:pPr>
      <w:pBdr><w:left w:val="single" w:sz="16" w:space="10" w:color="4B5357"/></w:pBdr>
      <w:ind w:left="240"/>
      <w:spacing w:after="110" w:line="300" w:lineRule="auto"/>
    </w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="Noto Serif" w:hAnsi="Noto Serif"/>
      <w:color w:val="1A1D24"/>
      <w:sz w:val="21"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="PrivacyNotice">
    <w:name w:val="Privacy Notice"/>
    <w:basedOn w:val="Normal"/>
    <w:qFormat/>
    <w:pPr>
      <w:pBdr><w:left w:val="single" w:sz="18" w:space="12" w:color="1A1D24"/></w:pBdr>
      <w:shd w:val="clear" w:color="auto" w:fill="F3F3F1"/>
      <w:ind w:left="180" w:right="140"/>
      <w:spacing w:before="160" w:after="160"/>
    </w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="Noto Sans" w:hAnsi="Noto Sans"/>
      <w:b/>
      <w:color w:val="1A1D24"/>
      <w:sz w:val="18"/>
    </w:rPr>
  </w:style>
</w:styles>`;

const restrictedFontTableXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:fonts xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:font w:name="Noto Sans"><w:altName w:val="Calibri"/><w:family w:val="swiss"/></w:font>
  <w:font w:name="Noto Serif"><w:altName w:val="Georgia"/><w:family w:val="roman"/></w:font>
  <w:font w:name="Calibri"><w:family w:val="swiss"/></w:font>
  <w:font w:name="Georgia"><w:family w:val="roman"/></w:font>
</w:fonts>`;

const restrictedDocxXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${wStyledPara("Kicker", "MONTHLY PRAYER  |  PRIVATE UPDATE  |  [MONTH YEAR]")}
    ${wStyledPara("Heading1", "A slower month of prayer, rest, and renewal")}
    ${wStyledPara("Normal", "Dear friends,")}
    ${wStyledPara("Normal", "Thank you for standing with [me / us] in ordinary and heavy seasons, not only during visible milestones. Share only safe, non-identifying details cleared by your regional leader, or use the one-sentence rest note below whenever you need renewal.")}
    ${wStyledPara("Normal", "One-sentence rest option: Friends, [I am / we are] taking a planned rest month with our care team's blessing; thank you for praying for renewal in Christ, and [I / we] will write again in [Month].")}
    ${wStyledPara("Heading2", "THREE WAYS TO PRAY THIS MONTH")}
    ${wStyledPara("PrayerPrompt", "1. Renewal and rest: Pray for deep rest and strength in Christ for single workers, families, and local friends.")}
    ${wStyledPara("PrayerPrompt", "2. Scripture conversations: Pray for neighbors continuing to read the Gospels with local believers in their mother tongue.")}
    ${wStyledPara("PrayerPrompt", "3. Wisdom for local elders: Pray for discernment and peace for households facing neighborhood pressure.")}
    ${wStyledPara("PrivacyNotice", "PLEASE KEEP THIS UPDATE PRIVATE: Do not post this letter on social media, public blogs, or church livestreams. Strip personal names, cities, seasons, and GPS metadata before saving PDFs or sharing inside vetted encrypted channels.")}
    ${wStyledPara("Normal", "[Collective Description Only (Tier 3 Default): e.g., Local Church Planters or Regional Team Code]")}
    ${wStyledPara("Normal", "Optional Tier 2 Only (delete for Tier 3): Replace the collective line above with an approved first name or alias ONLY when Tier 2 Identity consent is signed on your private consent record.")}
    ${wStyledPara("Normal", "LOCAL DRAFT STARTER: Replace bracketed text and clear document properties before sharing inside vetted channels.")}
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1152" w:right="1152" w:bottom="1152" w:left="1152" w:header="540" w:footer="540"/>
    </w:sectPr>
  </w:body>
</w:document>`;

const restrictedDocxEntries: ZipEntry[] = [
  {
    name: "[Content_Types].xml",
    data: Buffer.from(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/fontTable.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.fontTable+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>`,
      "utf-8"
    ),
  },
  {
    name: "_rels/.rels",
    data: Buffer.from(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>`,
      "utf-8"
    ),
  },
  {
    name: "docProps/core.xml",
    data: Buffer.from(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>Private Prayer Update Starter</dc:title><dc:creator>Local Fellowship</dc:creator></cp:coreProperties>`,
      "utf-8"
    ),
  },
  {
    name: "word/_rels/document.xml.rels",
    data: Buffer.from(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/fontTable" Target="fontTable.xml"/></Relationships>`,
      "utf-8"
    ),
  },
  { name: "word/styles.xml", data: Buffer.from(restrictedStylesXml, "utf-8") },
  {
    name: "word/fontTable.xml",
    data: Buffer.from(restrictedFontTableXml, "utf-8"),
  },
  { name: "word/document.xml", data: Buffer.from(restrictedDocxXml, "utf-8") },
];

fs.writeFileSync(
  path.join(officeDir, "worker-prayer-letter-restricted-starter.docx"),
  createZipBuffer(restrictedDocxEntries)
);

// =========================================================================
// 1C. BUILD brand-kit/office/local-only-meeting-sheet-starter.docx (Level 4 Zero-Attribution Editable Starter)
// =========================================================================

const level4DocxXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${wStyledPara("Kicker", "[LOCAL CONGREGATION OR FELLOWSHIP NAME]  |  WEEKLY GATHERING & PRAYER SHEET")}
    ${wStyledPara("Heading1", "[Weekly Scripture Reading & Local Fellowship Gathering]")}
    ${wStyledPara("Normal", "Date & Time: [Day, Date, Time]  |  Location: [Host Home or Meeting Space]  |  Scripture Passage: [Book Chapter:Verses]")}
    ${wStyledPara("Heading2", "1. OPENING SCRIPTURE & DISCUSSION")}
    ${wStyledPara("Normal", "[Paste or type the weekly passage in your congregation's own language and preferred Bible translation.]")}
    ${wStyledPara("Heading2", "2. NEIGHBORHOOD CARE & PRAYER REQUESTS")}
    ${wStyledPara("PrayerPrompt", "1. [Household or neighbor need for practical care and prayer this week]")}
    ${wStyledPara("PrayerPrompt", "2. [Encouragement for emerging local leaders, new believers, singles, and families]")}
    ${wStyledPara("PrayerPrompt", "3. [Thanksgiving for answered prayer and hospitality around the table]")}
    ${wStyledPara("Heading2", "3. NEXT GATHERING & LOCAL CONTACT")}
    ${wStyledPara("Normal", "Host or Elder Contact: [Local Leader Name & Private Contact Method]")}
    ${wStyledPara("PrivacyNotice", "LOCAL DRAFT STARTER: Replace all bracketed text and clear document properties before printing or sharing inside your local fellowship. Contains zero outside organization identifiers.")}
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1152" w:right="1152" w:bottom="1152" w:left="1152" w:header="540" w:footer="540"/>
    </w:sectPr>
  </w:body>
</w:document>`;

const level4DocxEntries: ZipEntry[] = [
  {
    name: "[Content_Types].xml",
    data: Buffer.from(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/fontTable.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.fontTable+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>`,
      "utf-8"
    ),
  },
  {
    name: "_rels/.rels",
    data: Buffer.from(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>`,
      "utf-8"
    ),
  },
  {
    name: "docProps/core.xml",
    data: Buffer.from(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>Local Fellowship Meeting and Prayer Sheet</dc:title><dc:creator>Local Fellowship</dc:creator></cp:coreProperties>`,
      "utf-8"
    ),
  },
  {
    name: "word/_rels/document.xml.rels",
    data: Buffer.from(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/fontTable" Target="fontTable.xml"/></Relationships>`,
      "utf-8"
    ),
  },
  { name: "word/styles.xml", data: Buffer.from(restrictedStylesXml, "utf-8") },
  {
    name: "word/fontTable.xml",
    data: Buffer.from(restrictedFontTableXml, "utf-8"),
  },
  { name: "word/document.xml", data: Buffer.from(level4DocxXml, "utf-8") },
];

fs.writeFileSync(
  path.join(officeDir, "local-only-meeting-sheet-starter.docx"),
  createZipBuffer(level4DocxEntries)
);

// =========================================================================
// 1D. BUILD brand-kit/office/local-fellowship-brief-arabic-rtl-starter.docx (Arabic-First Editable RTL Starter)
// =========================================================================

const rtlStylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="Noto Sans Arabic" w:hAnsi="Noto Sans Arabic" w:cs="Noto Sans Arabic"/>
        <w:color w:val="1A1D24"/>
        <w:sz w:val="24"/>
        <w:szCs w:val="24"/>
        <w:lang w:val="en-US" w:bidi="ar-SA"/>
      </w:rPr>
    </w:rPrDefault>
    <w:pPrDefault>
      <w:pPr>
        <w:bidi/>
        <w:jc w:val="right"/>
        <w:spacing w:after="160" w:line="360" w:lineRule="auto"/>
      </w:pPr>
    </w:pPrDefault>
  </w:docDefaults>
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:qFormat/>
  </w:style>
  <w:style w:type="paragraph" w:styleId="RtlKicker">
    <w:name w:val="Arabic Kicker"/>
    <w:basedOn w:val="Normal"/>
    <w:qFormat/>
    <w:pPr>
      <w:bidi/>
      <w:pBdr><w:bottom w:val="single" w:sz="10" w:space="6" w:color="4B5357"/></w:pBdr>
      <w:spacing w:after="140"/>
    </w:pPr>
    <w:rPr>
      <w:b/>
      <w:color w:val="1A1D24"/>
      <w:sz w:val="20"/>
      <w:szCs w:val="20"/>
      <w:rtl/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="RtlHeading1">
    <w:name w:val="heading 1"/>
    <w:basedOn w:val="Normal"/>
    <w:qFormat/>
    <w:pPr><w:bidi/><w:spacing w:before="80" w:after="200" w:line="340" w:lineRule="auto"/></w:pPr>
    <w:rPr>
      <w:b/>
      <w:color w:val="1A1D24"/>
      <w:sz w:val="40"/>
      <w:szCs w:val="40"/>
      <w:rtl/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="RtlPrompt">
    <w:name w:val="Arabic Prayer Prompt"/>
    <w:basedOn w:val="Normal"/>
    <w:qFormat/>
    <w:pPr>
      <w:bidi/>
      <w:pBdr><w:right w:val="single" w:sz="18" w:space="10" w:color="4B5357"/></w:pBdr>
      <w:ind w:right="240"/>
      <w:spacing w:after="120" w:line="350" w:lineRule="auto"/>
    </w:pPr>
    <w:rPr>
      <w:color w:val="1A1D24"/>
      <w:sz w:val="23"/>
      <w:szCs w:val="23"/>
      <w:rtl/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="EnSubordinate">
    <w:name w:val="English Reference Translation"/>
    <w:basedOn w:val="Normal"/>
    <w:qFormat/>
    <w:pPr>
      <w:bidi w:val="0"/>
      <w:jc w:val="left"/>
      <w:pBdr><w:top w:val="single" w:sz="6" w:space="8" w:color="DBD4C9"/></w:pBdr>
      <w:spacing w:before="200" w:after="100" w:line="300" w:lineRule="auto"/>
    </w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="Noto Sans" w:hAnsi="Noto Sans"/>
      <w:color w:val="4B5357"/>
      <w:sz w:val="19"/>
    </w:rPr>
  </w:style>
</w:styles>`;

const rtlFontTableXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:fonts xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:font w:name="Noto Sans Arabic"><w:altName w:val="Arial"/><w:family w:val="swiss"/></w:font>
  <w:font w:name="Noto Sans"><w:altName w:val="Calibri"/><w:family w:val="swiss"/></w:font>
  <w:font w:name="Arial"><w:family w:val="swiss"/></w:font>
  <w:font w:name="Calibri"><w:family w:val="swiss"/></w:font>
</w:fonts>`;

const wRtlPara = (styleId: string, text: string): string =>
  `<w:p><w:pPr><w:pStyle w:val="${styleId}"/><w:bidi/></w:pPr><w:r><w:rPr><w:rtl/></w:rPr><w:t xml:space="preserve">${xmlEscape(text)}</w:t></w:r></w:p>`;

const wRtlMixedPara = (
  styleId: string,
  arBefore: string,
  ltrSpan: string,
  arAfter: string
): string =>
  `<w:p><w:pPr><w:pStyle w:val="${styleId}"/><w:bidi/></w:pPr><w:r><w:rPr><w:rtl/></w:rPr><w:t xml:space="preserve">${xmlEscape(arBefore)}</w:t></w:r><w:r><w:rPr><w:rtl w:val="0"/><w:lang w:val="en-US"/></w:rPr><w:t xml:space="preserve">${xmlEscape(ltrSpan)}</w:t></w:r><w:r><w:rPr><w:rtl/></w:rPr><w:t xml:space="preserve">${xmlEscape(arAfter)}</w:t></w:r></w:p>`;

const rtlDocxXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${wRtlMixedPara("RtlKicker", "نموذج تقني للمراجعة · نسخة محلية مستقلة · ", "2026", " · [اسم الكنيسة أو الجماعة المحلية]")}
    ${wRtlPara("RtlHeading1", "القادة المحليون يقودون الكنيسة في لغتهم الأم")}
    ${wRtlPara("Normal", "يجتمع المؤمنون معاً في المحبة والصلاة وقراءة الكتاب المقدس بلغة البيت والحي، وتبقى قيادة الجماعة محلية بالكامل؛ فالشيوخ المحليون هم الذين يرعون الكنيسة، ويضعون جدولها الزمني، ويقررون ما يُشارك داخل الجماعة.")}
    ${wRtlMixedPara("Normal", "«الرَّبُّ يَحْفَظُ خُرُوجَكَ وَدُخُولَكَ مِنَ الآنَ وَإِلَى الدَّهْرِ.» (مزمور ", "121:8", " · ترجمة فاندايك)")}
    ${wRtlPara("RtlPrompt", "1. الاسم والقرار محليان: تحتفظ الكنيسة باسمها وبلغتها الأم في التعليم والعبادة والضيافة.")}
    ${wRtlPara("RtlPrompt", "2. صون العائلات والخصوصية: يحفظ الشيوخ خصوصية البيوت داخل الجماعة، ويقررون بهدوء ما يُذكر في الصلاة العامة وما يبقى خاصاً.")}
    ${wRtlPara("RtlPrompt", "3. الصلاة والراحة في كل موسم: تُحترم أوقات التعب والحزن بالكامل داخل الجماعة، ونجتمع للصلاة والرعاية المتبادلة بلا ضغط.")}
    ${wRtlPara("Normal", "اجتماع هذا الأسبوع: [اليوم · الوقت · العائلة المضيفة · قراءة الإنجيل]")}
    ${wRtlPara("Normal", "طلب صلاة 1: [أضف طلب صلاة آمناً من دون أسماء أو مواقع حساسة] · طلب صلاة 2: [اطلبوا الحكمة للشيوخ والراحة للعائلات والعاملين العزّاب]")}
    ${wRtlPara("Normal", "تواصل الشيوخ المحليين: [الاسم أو وسيلة التواصل المحلية الآمنة]")}
    ${wRtlPara("Normal", "الخصوصية: هذه الورقة للاستخدام المحلي الخاص فقط؛ يُرجى عدم تصويرها أو نشرها على الإنترنت. استبدل الحقول قبل الطباعة.")}
    <w:sectPr>
      <w:bidi/>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1152" w:right="1152" w:bottom="1152" w:left="1152" w:header="540" w:footer="540"/>
    </w:sectPr>
  </w:body>
</w:document>`;

const rtlDocxEntries: ZipEntry[] = [
  {
    name: "[Content_Types].xml",
    data: Buffer.from(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/fontTable.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.fontTable+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>`,
      "utf-8"
    ),
  },
  {
    name: "_rels/.rels",
    data: Buffer.from(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>`,
      "utf-8"
    ),
  },
  {
    name: "docProps/core.xml",
    data: Buffer.from(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>نشرة الكنيسة المحلية</dc:title><dc:creator>الكنيسة المحلية</dc:creator></cp:coreProperties>`,
      "utf-8"
    ),
  },
  {
    name: "word/_rels/document.xml.rels",
    data: Buffer.from(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/fontTable" Target="fontTable.xml"/></Relationships>`,
      "utf-8"
    ),
  },
  { name: "word/styles.xml", data: Buffer.from(rtlStylesXml, "utf-8") },
  { name: "word/fontTable.xml", data: Buffer.from(rtlFontTableXml, "utf-8") },
  { name: "word/document.xml", data: Buffer.from(rtlDocxXml, "utf-8") },
];

fs.writeFileSync(
  path.join(officeDir, "local-fellowship-brief-arabic-rtl-starter.docx"),
  createZipBuffer(rtlDocxEntries)
);

// =========================================================================
// 1E. BUILD brand-kit/office/donor-receipt-and-redesignation-starter.docx (Finance Manual Fill-In Starter)
// =========================================================================

const donorReceiptDocxXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    ${wStyledPara("Kicker", "FINANCE & DONOR CARE MANUAL FILL-IN STARTER  |  WORD, LIBREOFFICE & GOOGLE DOCS")}
    ${wStyledPara("Normal", "Four ready-to-edit manual fill-in letters matching GF-TPL-21 (Donor Lifecycle, Tax Receipt & Gift Re-Designation Kit). Delete the three sections you do not need, replace every bracketed placeholder manually, and verify public-safe designation codes before sending.")}
    ${wStyledPara("Heading1", "1. First-Gift and Single-Contribution ($250+) Thank-You Receipt")}
    ${wStyledPara("Normal", "Date: [Month DD, YYYY]  |  Donor: [Donor Full Name]  |  Amount: $[Amount]  |  Designation: [Cleared Public Label or Protective Code]")}
    ${wStyledPara("Normal", "Dear [Donor Name],")}
    ${wStyledPara("Normal", "Thank you for your generous gift of $[Amount] received on [Gift Date] toward [Cleared Public Label or Protective Code]. God builds his church through faithful local believers, and your open-handed stewardship supports practical ministry costs so workers can remain present in their neighborhoods.")}
    ${wStyledPara("Normal", "IRS 501(c)(3) Substantiation ($250+ Contemporaneous Acknowledgment) and Variance Power: Global Fellowship, Inc. (EIN 68-0214543) is a registered 501(c)(3) religious nonprofit organization. No goods or services were provided in whole or in part in exchange for this contribution, other than intangible religious benefits. Contributions are tax-deductible to the extent allowed by United States law (for DAF or IRA QCD gifts, use the non-cash acknowledgment wording in GF-TPL-21 instead). In keeping with IRS rules and board oversight, designated contributions are applied to the named ministry with board variance power if a fund closes or changes. Global Fellowship never sells, rents, or trades donor contact lists, and recurring givers may adjust or pause giving anytime without guilt.")}
    ${wStyledPara("Heading2", "2. PCI-SAFE FAILED OR EXPIRED PAYMENT METHOD CARE NOTE")}
    ${wStyledPara("Normal", "Dear [Donor Name], we wanted to let you know that your scheduled gift of $[Amount] toward [Cleared Label] did not process on [Attempt Date]. Cards expire and banks reissue numbers all the time, so please feel no urgency or guilt. Please update your payment method safely by contacting Finance at finance@globalfellowship.org or calling our Home Office line at 1 866 984 5622 during Pacific business hours (confirmed online portal link pending). For your protection, never reply by email or voicemail with a credit card number, expiration date, CVV, or bank account number. If your household season has changed, simply reply 'Please pause my recurring gift' and we will update it promptly with sincere thanks.")}
    ${wStyledPara("Heading2", "3. WORKER-TRANSITION OR CLOSED-FUND RE-DESIGNATION NOTICE")}
    ${wStyledPara("Normal", "Dear [Donor Name], thank you for your faithful prayer and generosity toward [Cleared Worker or Project Name]. As of [Effective Date], [Cleared Name] is [concluding this season of field service / completing this project fund]. Out of care for household privacy, we share only the details cleared for distribution. In keeping with IRS 501(c)(3) stewardship standards and board oversight, any remaining designated balance after final transition expenses will support [related regional church-planting fund / Global Fellowship General Field Fund].")}
    ${wStyledPara("PrayerPrompt", "Your recurring schedule ($[Amount] / [Cadence]): Your scheduled gifts will conclude automatically after [Final Charge Date] unless you reply to redirect future gifts to: (A) another cleared worker or field project designation, (B) the Global Fellowship General Field Fund (designated for field church-planting ministry), (C) Where Most Needed and Home Office Operations (unrestricted administration and urgent regional needs), or (D) end recurring giving with our sincere gratitude. Write anytime to finance@globalfellowship.org or call 1 866 984 5622.")}
    ${wStyledPara("Normal", "Privacy reminder for Tier 2 and Tier 3 worker transitions: Out of care for this household and the local believers they serve alongside, please keep this update private. Pray faithfully at home and in small groups, and do not post worker names, aliases, codes, or details on social media or church livestreams.")}
    ${wStyledPara("Heading2", "4. JANUARY ANNUAL 501(C)(3) GIVING STATEMENT COVER LETTER")}
    ${wStyledPara("Normal", "Dear [Donor Name], enclosed is your official [Tax Year] annual giving statement for contributions received by Global Fellowship, Inc. (EIN 68-0214543). Global Fellowship confirms that no goods or services were provided in exchange for any contribution listed on this statement, other than intangible religious benefits. For open financial records, Global Fellowship publishes annual Statements of Activity (including 2025 Consolidated $5.82M received / $5.73M disbursed alongside Global Fellowship, Inc. $2.08M / $2.13M and affiliated ministries MissionStream and BOLK) and maintains a public Candid profile (ID 8043461). For questions or a separate designation breakdown, write finance@globalfellowship.org or call 1 866 984 5622.")}
    ${wStyledPara("PrivacyNotice", "PRE-PUBLICATION SPECIMEN STARTER: Delete unused sections, verify cleared Tier 1-3 designation codes, and confirm Finance approval before mailing or emailing.")}
    <w:sectPr>
      <w:headerReference w:type="default" r:id="rId2"/>
      <w:footerReference w:type="default" r:id="rId3"/>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1296" w:right="1152" w:bottom="1152" w:left="1152" w:header="540" w:footer="540"/>
    </w:sectPr>
  </w:body>
</w:document>`;

const donorReceiptDocxEntries: ZipEntry[] = [
  {
    name: "[Content_Types].xml",
    data: Buffer.from(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/fontTable.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.fontTable+xml"/><Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/><Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>`,
      "utf-8"
    ),
  },
  {
    name: "_rels/.rels",
    data: Buffer.from(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>`,
      "utf-8"
    ),
  },
  {
    name: "docProps/core.xml",
    data: Buffer.from(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>Global Fellowship Finance Donor Receipt and Re-Designation Starter</dc:title><dc:creator>Global Fellowship</dc:creator></cp:coreProperties>`,
      "utf-8"
    ),
  },
  {
    name: "word/_rels/document.xml.rels",
    data: Buffer.from(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/><Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/fontTable" Target="fontTable.xml"/></Relationships>`,
      "utf-8"
    ),
  },
  {
    name: "word/_rels/header1.xml.rels",
    data: Buffer.from(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/logo.png"/></Relationships>`,
      "utf-8"
    ),
  },
  { name: "word/media/logo.png", data: logoLightPng },
  { name: "word/styles.xml", data: Buffer.from(docxStylesXml, "utf-8") },
  { name: "word/fontTable.xml", data: Buffer.from(docxFontTableXml, "utf-8") },
  { name: "word/header1.xml", data: Buffer.from(publicHeaderXml, "utf-8") },
  { name: "word/footer1.xml", data: Buffer.from(publicFooterXml, "utf-8") },
  {
    name: "word/document.xml",
    data: Buffer.from(donorReceiptDocxXml, "utf-8"),
  },
];

fs.writeFileSync(
  path.join(officeDir, "donor-receipt-and-redesignation-starter.docx"),
  createZipBuffer(donorReceiptDocxEntries)
);

// =========================================================================
// 2. BUILD brand-kit/office/global-fellowship-deck-starter.pptx (v10.0 Full 8 Slides)
// =========================================================================

interface StyledRunSpec {
  readonly text: string;
  readonly font: string;
  readonly lang?: string;
}

interface TextBoxSpec {
  readonly id: number;
  readonly name: string;
  readonly x: number;
  readonly y: number;
  readonly cx: number;
  readonly cy: number;
  readonly text: string;
  readonly font: string;
  readonly sz: number;
  readonly color: string;
  readonly bold?: boolean;
  readonly phType?: "title" | "body" | "ftr";
  readonly phIdx?: number;
  readonly linkTarget?: string;
  readonly multiRuns?: readonly StyledRunSpec[];
}

interface RectSpec {
  readonly id: number;
  readonly name: string;
  readonly x: number;
  readonly y: number;
  readonly cx: number;
  readonly cy: number;
  readonly fill: string;
}

interface SlideSpec {
  readonly layoutIdx: number;
  readonly bgHex: string;
  readonly logoRel?: "reversed" | "light" | "mono";
  readonly coverPhoto?: boolean;
  readonly rects: readonly RectSpec[];
  readonly boxes: readonly TextBoxSpec[];
  readonly notes: string;
}

const makeTextBoxXml = (b: TextBoxSpec, linkRelId?: string): string => {
  const ph =
    b.phType === undefined
      ? ""
      : `<p:ph type="${b.phType}"${b.phIdx === undefined ? "" : ` idx="${b.phIdx}"`}/>`;

  const hlink =
    linkRelId === undefined ? "" : `<a:hlinkClick r:id="${linkRelId}"/>`;

  let paras = "";

  if (b.multiRuns !== undefined && b.multiRuns.length > 0) {
    const runs = b.multiRuns
      .map(
        (run) =>
          `<a:r><a:rPr lang="${run.lang ?? "en-US"}" sz="${b.sz}"${b.bold === true ? ' b="1"' : ""}><a:solidFill><a:srgbClr val="${b.color}"/></a:solidFill><a:latin typeface="${run.font}"/><a:ea typeface="${run.font}"/><a:cs typeface="${run.font}"/></a:rPr><a:t>${xmlEscape(run.text)}</a:t></a:r>`
      )
      .join("");

    paras = `<a:p>${runs}</a:p>`;
  } else {
    const lines = b.text.split("\n");
    paras = lines
      .map(
        (line, idx) =>
          `<a:p><a:r><a:rPr lang="en-US" sz="${b.sz}"${b.bold === true ? ' b="1"' : ""}${idx === lines.length - 1 && linkRelId !== undefined ? ' u="sng"' : ""}><a:solidFill><a:srgbClr val="${b.color}"/></a:solidFill><a:latin typeface="${b.font}"/>${idx === lines.length - 1 ? hlink : ""}</a:rPr><a:t>${xmlEscape(line)}</a:t></a:r></a:p>`
      )
      .join("");
  }

  return `<p:sp><p:nvSpPr><p:cNvPr id="${b.id}" name="${xmlEscape(b.name)}"/><p:cNvSpPr txBox="${b.phType === undefined ? "1" : "0"}"/><p:nvPr>${ph}</p:nvPr></p:nvSpPr><p:spPr><a:xfrm><a:off x="${b.x}" y="${b.y}"/><a:ext cx="${b.cx}" cy="${b.cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr><p:txBody><a:bodyPr wrap="square"/><a:lstStyle/>${paras}</p:txBody></p:sp>`;
};

const makeRectXml = (r: RectSpec): string =>
  `<p:sp><p:nvSpPr><p:cNvPr id="${r.id}" name="${xmlEscape(r.name)}"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="${r.x}" y="${r.y}"/><a:ext cx="${r.cx}" cy="${r.cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:solidFill><a:srgbClr val="${r.fill}"/></a:solidFill><a:ln><a:noFill/></a:ln></p:spPr></p:sp>`;

const makeLogoPicXml = (rId: string, y = 420_000): string =>
  `<p:pic><p:nvPicPr><p:cNvPr id="90" name="Global Fellowship Lockup"/><p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr><p:nvPr/></p:nvPicPr><p:blipFill><a:blip r:embed="${rId}"/><a:stretch><a:fillRect/></a:stretch></p:blipFill><p:spPr><a:xfrm><a:off x="685800" y="${y}"/><a:ext cx="2150000" cy="415300"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr></p:pic>`;

const makeCoverPhotoPicXml = (rId: string): string =>
  `<p:pic><p:nvPicPr><p:cNvPr id="91" name="Contextual Street Photography (GF-PHO-01)" descr="Documentary street photograph of two hands pouring warm tea across a wooden tray with clay pots and cups; contextual street photography (James Creegan, CC BY 2.0), not a Global Fellowship congregation."/><p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr><p:nvPr/></p:nvPicPr><p:blipFill><a:blip r:embed="${rId}"/><a:stretch><a:fillRect/></a:stretch></p:blipFill><p:spPr><a:xfrm><a:off x="7380000" y="1380000"/><a:ext cx="4120000" cy="2746667"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr></p:pic>`;

const [S1, S2, S3, S4, S5, S6, S7, S8] = DECK_SLIDES;

const multilingualRuns: StyledRunSpec[] = MULTILINGUAL_WITNESS_SCRIPTS.flatMap(
  (item, idx) => {
    const run: StyledRunSpec = {
      text: item.text,
      font: item.font,
      lang: item.lang,
    };

    return idx === 0
      ? [run]
      : [{ text: " · ", font: "Plus Jakarta Sans", lang: "en-US" }, run];
  }
);

const SLIDES: readonly SlideSpec[] = [
  // Slide 1: Uncluttered Harbor Night Cover + Flagship Headline + Local Edit + Embedded Street Photo (GF-PHO-01)
  {
    layoutIdx: 1,
    bgHex: C.harborDeep,
    logoRel: "reversed",
    coverPhoto: true,
    rects: [
      {
        id: 2,
        name: "CandleRule",
        x: 685_800,
        y: 1_560_000,
        cx: 860_000,
        cy: 56_000,
        fill: C.apricot,
      },
      {
        id: 3,
        name: "LocalEditLeftBar",
        x: 685_800,
        y: 4_060_000,
        cx: 60_000,
        cy: 1_640_000,
        fill: C.apricot,
      },
      {
        id: 4,
        name: "PhotoCaptionRule",
        x: 7_380_000,
        y: 4_126_667,
        cx: 4_120_000,
        cy: 28_000,
        fill: C.apricot,
      },
      {
        id: 5,
        name: "PhotoCaptionBg",
        x: 7_380_000,
        y: 4_154_667,
        cx: 4_120_000,
        cy: 1_545_000,
        fill: C.harborCard,
      },
    ],
    boxes: [
      {
        id: 10,
        name: "Kicker",
        x: 3_150_000,
        y: 460_000,
        cx: 8_350_000,
        cy: 340_000,
        text: S1.kicker,
        font: "Plus Jakarta Sans",
        sz: 1200,
        color: C.apricot,
        bold: true,
      },
      {
        id: 11,
        name: "Title",
        x: 685_800,
        y: 1_720_000,
        cx: 6_360_000,
        cy: 1_460_000,
        text: S1.headline,
        font: "Source Serif 4",
        sz: 3400,
        color: C.paper,
        bold: true,
        phType: "title",
      },
      {
        id: 12,
        name: "Subtitle",
        x: 685_800,
        y: 3_200_000,
        cx: 6_360_000,
        cy: 760_000,
        text: S1.sub ?? "",
        font: "Plus Jakarta Sans",
        sz: 1450,
        color: C.mistText,
        phType: "body",
        phIdx: 1,
      },
      {
        id: 13,
        name: "LocalEditHero",
        x: 880_000,
        y: 4_060_000,
        cx: 6_160_000,
        cy: 1_640_000,
        text: `${DECK_SHARED_STRINGS.vetoLocalLabel.toUpperCase()}\n\u201C${DECK_SHARED_STRINGS.vetoLocalRevision}\u201D\n${DECK_SHARED_STRINGS.vetoOutsiderLabel}: \u201C${DECK_SHARED_STRINGS.vetoOutsiderDraft}\u201D`,
        font: "Source Serif 4",
        sz: 1450,
        color: C.paper,
      },
      {
        id: 15,
        name: "CoverPhotoCaption",
        x: 7_520_000,
        y: 4_250_000,
        cx: 3_840_000,
        cy: 1_360_000,
        text: `CONTEXTUAL STREET PHOTOGRAPHY\n${DECK_SHARED_STRINGS.coverPhotoCaption}`,
        font: "Plus Jakarta Sans",
        sz: 1150,
        color: C.paper,
      },
      {
        id: 14,
        name: "Footer",
        x: 685_800,
        y: 6_120_000,
        cx: 10_800_000,
        cy: 380_000,
        text: `${S1.footerLeft}  |  ${S1.specimenStatus} · Slide 1 / 8`,
        font: "Plus Jakarta Sans",
        sz: 1150,
        color: C.mistText,
        phType: "ftr",
        phIdx: 2,
      },
    ],
    notes: S1.speakerNote,
  },
  // Slide 2: Protected Foundations (Exclusive Warm Linen + Harbor Teal / Kiln Clay stepped bars)
  {
    layoutIdx: 2,
    bgHex: C.paper,
    logoRel: "light",
    rects: [
      {
        id: 2,
        name: "FoundationsBar1",
        x: 685_800,
        y: 1_550_000,
        cx: 68_000,
        cy: 2_050_000,
        fill: C.harbor,
      },
      {
        id: 3,
        name: "FoundationsBg1",
        x: 753_800,
        y: 1_550_000,
        cx: 6_350_000,
        cy: 2_050_000,
        fill: C.linen,
      },
      {
        id: 4,
        name: "FoundationsBar2",
        x: 685_800,
        y: 3_880_000,
        cx: 68_000,
        cy: 1_650_000,
        fill: C.clay,
      },
      {
        id: 5,
        name: "FoundationsBg2",
        x: 753_800,
        y: 3_880_000,
        cx: 6_350_000,
        cy: 1_650_000,
        fill: C.linen,
      },
      {
        id: 6,
        name: "PillarsRule",
        x: 7_450_000,
        y: 1_550_000,
        cx: 4_050_000,
        cy: 48_000,
        fill: C.ink,
      },
    ],
    boxes: [
      {
        id: 10,
        name: "Kicker",
        x: 685_800,
        y: 620_000,
        cx: 10_800_000,
        cy: 300_000,
        text: S2.kicker,
        font: "Plus Jakarta Sans",
        sz: 1300,
        color: C.harbor,
        bold: true,
      },
      {
        id: 15,
        name: "SlideTitle",
        x: 685_800,
        y: 940_000,
        cx: 10_800_000,
        cy: 500_000,
        text: S2.headline,
        font: "Source Serif 4",
        sz: 2600,
        color: C.ink,
        bold: true,
        phType: "title",
      },
      {
        id: 11,
        name: "Mission",
        x: 920_000,
        y: 1_700_000,
        cx: 6_000_000,
        cy: 1_800_000,
        text: `${DECK_SHARED_STRINGS.missionLabel.toUpperCase()}\n\u201C${DECK_SHARED_STRINGS.missionVerbatim}\u201D`,
        font: "Source Serif 4",
        sz: 1950,
        color: C.ink,
      },
      {
        id: 12,
        name: "Vision",
        x: 920_000,
        y: 4_020_000,
        cx: 6_000_000,
        cy: 1_400_000,
        text: `${DECK_SHARED_STRINGS.visionLabel.toUpperCase()}\n\u201C${DECK_SHARED_STRINGS.visionVerbatim}\u201D`,
        font: "Source Serif 4",
        sz: 1950,
        color: C.ink,
        phType: "body",
        phIdx: 1,
      },
      {
        id: 13,
        name: "ThreePillars",
        x: 7_450_000,
        y: 1_700_000,
        cx: 4_050_000,
        cy: 3_950_000,
        text: `${DECK_SHARED_STRINGS.threePillarsLabel.toUpperCase()}\n\n${(S2.columns ?? []).map((c) => `${c.title}\n${c.body}`).join("\n\n")}\n\n${S2.footnote ?? ""}`,
        font: "Plus Jakarta Sans",
        sz: 1420,
        color: C.ink,
      },
      {
        id: 14,
        name: "Footer",
        x: 685_800,
        y: 6_120_000,
        cx: 10_800_000,
        cy: 360_000,
        text: `${S2.footerLeft}  |  ${S2.specimenStatus} · Slide 2 / 8`,
        font: "Plus Jakarta Sans",
        sz: 1150,
        color: C.slate,
        phType: "ftr",
        phIdx: 2,
        linkTarget: "mailto:info@globalfellowship.org",
      },
    ],
    notes: S2.speakerNote,
  },
  // Slide 3: Warm Linen Editorial Statement Slide (Replacing harsh bright yellow)
  {
    layoutIdx: 3,
    bgHex: C.linen,
    logoRel: "light",
    rects: [
      {
        id: 2,
        name: "ClayTopRule",
        x: 0,
        y: 0,
        cx: 12_192_000,
        cy: 96_000,
        fill: C.clay,
      },
      {
        id: 3,
        name: "InkRule",
        x: 685_800,
        y: 4_850_000,
        cx: 10_800_000,
        cy: 24_000,
        fill: C.clay,
      },
    ],
    boxes: [
      {
        id: 10,
        name: "Kicker",
        x: 685_800,
        y: 1_050_000,
        cx: 10_800_000,
        cy: 340_000,
        text: S3.kicker,
        font: "Plus Jakarta Sans",
        sz: 1400,
        color: C.clay,
        bold: true,
      },
      {
        id: 11,
        name: "Title",
        x: 685_800,
        y: 1_550_000,
        cx: 6_200_000,
        cy: 1_550_000,
        text: S3.headline,
        font: "Source Serif 4",
        sz: 4000,
        color: C.ink,
        bold: true,
        phType: "title",
      },
      {
        id: 12,
        name: "Body",
        x: 685_800,
        y: 3_150_000,
        cx: 6_200_000,
        cy: 1_650_000,
        text: S3.sub ?? "",
        font: "Source Serif 4",
        sz: 1900,
        color: C.ink,
        phType: "body",
        phIdx: 1,
      },
      {
        id: 13,
        name: "Callout",
        x: 685_800,
        y: 4_960_000,
        cx: 6_200_000,
        cy: 800_000,
        text: S3.secondaryCallout ?? "",
        font: "Plus Jakarta Sans",
        sz: 1600,
        color: C.harbor,
        bold: true,
      },
      {
        id: 15,
        name: "Chronology",
        x: 7_250_000,
        y: 1_550_000,
        cx: 4_250_000,
        cy: 4_200_000,
        text: (S3.columns ?? [])
          .map((c) => `${c.kicker ?? ""} · ${c.title}\n${c.body}`)
          .join("\n\n"),
        font: "Plus Jakarta Sans",
        sz: 1450,
        color: C.ink,
      },
      {
        id: 14,
        name: "Footer",
        x: 685_800,
        y: 6_120_000,
        cx: 10_800_000,
        cy: 360_000,
        text: `${S3.footerLeft}  |  ${S3.specimenStatus} · Slide 3 / 8`,
        font: "Plus Jakarta Sans",
        sz: 1150,
        color: C.slate,
        phType: "ftr",
        phIdx: 2,
      },
    ],
    notes: S3.speakerNote,
  },
  // Slide 4: Stepped Authority Cascade
  {
    layoutIdx: 4,
    bgHex: C.paper,
    logoRel: "light",
    rects: [
      {
        id: 2,
        name: "Row1Bar",
        x: 685_800,
        y: 2_580_000,
        cx: 72_000,
        cy: 920_000,
        fill: C.slate,
      },
      {
        id: 3,
        name: "Row2Bar",
        x: 1_180_000,
        y: 3_680_000,
        cx: 72_000,
        cy: 980_000,
        fill: C.harbor,
      },
      {
        id: 4,
        name: "Row3Bg",
        x: 1_680_000,
        y: 4_520_000,
        cx: 9_800_000,
        cy: 980_000,
        fill: C.harborDeep,
      },
      {
        id: 5,
        name: "Row3Bar",
        x: 1_680_000,
        y: 4_520_000,
        cx: 90_000,
        cy: 980_000,
        fill: C.apricot,
      },
    ],
    boxes: [
      {
        id: 10,
        name: "Kicker",
        x: 685_800,
        y: 1_020_000,
        cx: 10_800_000,
        cy: 340_000,
        text: S4.kicker,
        font: "Plus Jakarta Sans",
        sz: 1400,
        color: C.harbor,
        bold: true,
      },
      {
        id: 11,
        name: "Title",
        x: 685_800,
        y: 1_420_000,
        cx: 10_800_000,
        cy: 980_000,
        text: S4.headline,
        font: "Source Serif 4",
        sz: 3600,
        color: C.ink,
        bold: true,
        phType: "title",
      },
      {
        id: 12,
        name: "Tier1Global",
        x: 900_000,
        y: 2_560_000,
        cx: 10_580_000,
        cy: 920_000,
        text: `${S4.columns?.[0]?.title ?? ""} · ${S4.columns?.[0]?.footerNote ?? ""}\n${S4.columns?.[0]?.body ?? ""}`,
        font: "Plus Jakarta Sans",
        sz: 1600,
        color: C.ink,
        phType: "body",
        phIdx: 1,
      },
      {
        id: 13,
        name: "Tier2Regional",
        x: 1_400_000,
        y: 3_680_000,
        cx: 10_080_000,
        cy: 960_000,
        text: `${S4.columns?.[1]?.title ?? ""} · ${S4.columns?.[1]?.footerNote ?? ""}\n${S4.columns?.[1]?.body ?? ""}`,
        font: "Plus Jakarta Sans",
        sz: 1600,
        color: C.ink,
      },
      {
        id: 14,
        name: "Tier3Local",
        x: 1_920_000,
        y: 4_560_000,
        cx: 9_380_000,
        cy: 920_000,
        text: `${S4.columns?.[2]?.title ?? ""} · ${S4.columns?.[2]?.footerNote ?? ""}\n${S4.columns?.[2]?.body ?? ""}`,
        font: "Plus Jakarta Sans",
        sz: 1550,
        color: C.paper,
        bold: true,
      },
      {
        id: 16,
        name: "OwnTongueStrip",
        x: 685_800,
        y: 5_600_000,
        cx: 10_800_000,
        cy: 420_000,
        text: DECK_SHARED_STRINGS.multilingualPlainLine,
        font: "Noto Sans",
        sz: 1450,
        color: C.ink,
        multiRuns: multilingualRuns,
      },
      {
        id: 15,
        name: "Footer",
        x: 685_800,
        y: 6_180_000,
        cx: 10_800_000,
        cy: 340_000,
        text: `${S4.footerLeft}  |  ${S4.specimenStatus} · Slide 4 / 8`,
        font: "Plus Jakarta Sans",
        sz: 1150,
        color: C.slate,
        phType: "ftr",
        phIdx: 2,
      },
    ],
    notes: S4.speakerNote,
  },
  // Slide 5: Sanctuary Prayer Dark (Balanced Two-Column Layout matching HTML 1-to-1)
  {
    layoutIdx: 5,
    bgHex: C.harborDeep,
    rects: [
      {
        id: 2,
        name: "CandleRule",
        x: 685_800,
        y: 1_480_000,
        cx: 920_000,
        cy: 64_000,
        fill: C.apricot,
      },
      {
        id: 3,
        name: "PromptsDivider",
        x: 6_520_000,
        y: 1_480_000,
        cx: 56_000,
        cy: 4_160_000,
        fill: C.apricot,
      },
    ],
    boxes: [
      {
        id: 10,
        name: "Kicker",
        x: 685_800,
        y: 660_000,
        cx: 10_800_000,
        cy: 340_000,
        text: S5.kicker,
        font: "Plus Jakarta Sans",
        sz: 1350,
        color: C.seaMist,
        bold: true,
      },
      {
        id: 11,
        name: "Title",
        x: 685_800,
        y: 1_720_000,
        cx: 5_560_000,
        cy: 1_120_000,
        text: S5.headline,
        font: "Source Serif 4",
        sz: 4200,
        color: C.paper,
        bold: true,
        phType: "title",
      },
      {
        id: 12,
        name: "Body",
        x: 685_800,
        y: 2_920_000,
        cx: 5_560_000,
        cy: 1_920_000,
        text: S5.sub ?? "",
        font: "Source Serif 4",
        sz: 1850,
        color: C.paper,
        phType: "body",
        phIdx: 1,
      },
      {
        id: 13,
        name: "PrayerCall",
        x: 685_800,
        y: 4_960_000,
        cx: 5_560_000,
        cy: 720_000,
        text: S5.secondaryCallout ?? "",
        font: "Plus Jakarta Sans",
        sz: 1500,
        color: C.apricot,
        bold: true,
      },
      {
        id: 15,
        name: "PrayerPrompts",
        x: 6_820_000,
        y: 1_520_000,
        cx: 4_680_000,
        cy: 4_160_000,
        text: (S5.columns ?? [])
          .map((c) => `${c.kicker ?? ""} · ${c.title}\n${c.body}`)
          .join("\n\n"),
        font: "Plus Jakarta Sans",
        sz: 1450,
        color: C.paper,
      },
      {
        id: 14,
        name: "Footer",
        x: 685_800,
        y: 6_120_000,
        cx: 10_800_000,
        cy: 360_000,
        text: `${S5.footerLeft}  |  ${S5.specimenStatus} · Slide 5 / 8`,
        font: "Plus Jakarta Sans",
        sz: 1150,
        color: C.mistText,
        phType: "ftr",
        phIdx: 2,
      },
    ],
    notes: S5.speakerNote,
  },
  // Slide 6: Commanding Full-Width Host Stop-Authority Decision + Hairline Pathways Below
  {
    layoutIdx: 2,
    bgHex: C.paper,
    logoRel: "light",
    rects: [
      {
        id: 2,
        name: "HostStageBg",
        x: 685_800,
        y: 2_380_000,
        cx: 10_800_000,
        cy: 1_780_000,
        fill: C.harborDeep,
      },
      {
        id: 3,
        name: "HostStageLeftBar",
        x: 685_800,
        y: 2_380_000,
        cx: 96_000,
        cy: 1_780_000,
        fill: C.apricot,
      },
      {
        id: 4,
        name: "BridgeRule",
        x: 685_800,
        y: 4_440_000,
        cx: 5_200_000,
        cy: 36_000,
        fill: C.harbor,
      },
      {
        id: 5,
        name: "FrontlinesRule",
        x: 6_285_800,
        y: 4_440_000,
        cx: 5_200_000,
        cy: 36_000,
        fill: C.harbor,
      },
    ],
    boxes: [
      {
        id: 10,
        name: "Kicker",
        x: 685_800,
        y: 960_000,
        cx: 10_800_000,
        cy: 300_000,
        text: S6.kicker,
        font: "Plus Jakarta Sans",
        sz: 1350,
        color: C.harbor,
        bold: true,
      },
      {
        id: 11,
        name: "Title",
        x: 685_800,
        y: 1_300_000,
        cx: 10_800_000,
        cy: 960_000,
        text: S6.headline,
        font: "Source Serif 4",
        sz: 3100,
        color: C.ink,
        bold: true,
        phType: "title",
      },
      {
        id: 12,
        name: "HostQuote",
        x: 960_000,
        y: 2_520_000,
        cx: 5_700_000,
        cy: 1_500_000,
        text: `${S6.columns?.[0]?.kicker ?? ""}\n${S6.columns?.[0]?.title ?? ""}`,
        font: "Source Serif 4",
        sz: 2050,
        color: C.paper,
        bold: true,
        phType: "body",
        phIdx: 1,
      },
      {
        id: 16,
        name: "HostOutcome",
        x: 6_920_000,
        y: 2_520_000,
        cx: 4_340_000,
        cy: 1_500_000,
        text: `${S6.columns?.[0]?.body ?? ""}\n\n${S6.columns?.[0]?.footerNote ?? ""}`,
        font: "Plus Jakarta Sans",
        sz: 1380,
        color: C.mistText,
      },
      {
        id: 13,
        name: "BridgeRow",
        x: 685_800,
        y: 4_560_000,
        cx: 5_200_000,
        cy: 1_420_000,
        text: `${S6.columns?.[1]?.kicker ?? ""}\n${S6.columns?.[1]?.title ?? ""}\n${S6.columns?.[1]?.body ?? ""}`,
        font: "Plus Jakarta Sans",
        sz: 1380,
        color: C.ink,
      },
      {
        id: 14,
        name: "FrontlinesRow",
        x: 6_285_800,
        y: 4_560_000,
        cx: 5_200_000,
        cy: 1_420_000,
        text: `${S6.columns?.[2]?.kicker ?? ""}\n${S6.columns?.[2]?.title ?? ""}\n${S6.columns?.[2]?.body ?? ""}`,
        font: "Plus Jakarta Sans",
        sz: 1380,
        color: C.ink,
      },
      {
        id: 15,
        name: "Footer",
        x: 685_800,
        y: 6_120_000,
        cx: 10_800_000,
        cy: 360_000,
        text: `${S6.footerLeft}  |  ${S6.specimenStatus} · Slide 6 / 8`,
        font: "Plus Jakarta Sans",
        sz: 1150,
        color: C.slate,
        phType: "ftr",
        phIdx: 2,
        linkTarget: "mailto:info@globalfellowship.org",
      },
    ],
    notes: S6.speakerNote,
  },
  // Slide 7: Projector-Clear Open Books
  {
    layoutIdx: 4,
    bgHex: C.paper,
    logoRel: "light",
    rects: [
      {
        id: 2,
        name: "Bar1Track",
        x: 4_350_000,
        y: 2_560_000,
        cx: 5_300_000,
        cy: 260_000,
        fill: C.linen,
      },
      {
        id: 3,
        name: "Bar1Fill",
        x: 4_350_000,
        y: 2_560_000,
        cx: 5_300_000,
        cy: 260_000,
        fill: C.harbor,
      },
      {
        id: 4,
        name: "Bar2Track",
        x: 4_350_000,
        y: 3_320_000,
        cx: 5_300_000,
        cy: 260_000,
        fill: C.linen,
      },
      {
        id: 5,
        name: "Bar2Fill",
        x: 4_350_000,
        y: 3_320_000,
        cx: Math.round(((S7.bars?.[1]?.widthPct ?? 37.2) / 100) * 5_300_000),
        cy: 260_000,
        fill: C.harborDeep,
      },
      {
        id: 6,
        name: "LowerDivider",
        x: 685_800,
        y: 4_060_000,
        cx: 10_800_000,
        cy: 24_000,
        fill: C.ink,
      },
      {
        id: 7,
        name: "HomeOfficeRule",
        x: 685_800,
        y: 4_260_000,
        cx: 56_000,
        cy: 1_560_000,
        fill: C.clay,
      },
    ],
    boxes: [
      {
        id: 10,
        name: "Kicker",
        x: 685_800,
        y: 980_000,
        cx: 10_800_000,
        cy: 300_000,
        text: S7.kicker,
        font: "Plus Jakarta Sans",
        sz: 1400,
        color: C.harbor,
        bold: true,
      },
      {
        id: 11,
        name: "Title",
        x: 685_800,
        y: 1_320_000,
        cx: 10_800_000,
        cy: 760_000,
        text: S7.headline,
        font: "Source Serif 4",
        sz: 3400,
        color: C.ink,
        bold: true,
        phType: "title",
      },
      {
        id: 12,
        name: "Bar1Label",
        x: 685_800,
        y: 2_380_000,
        cx: 3_560_000,
        cy: 640_000,
        text: `${S7.bars?.[0]?.label ?? ""}\n${S7.bars?.[0]?.sub ?? ""}`,
        font: "Plus Jakarta Sans",
        sz: 1450,
        color: C.ink,
        bold: true,
        phType: "body",
        phIdx: 1,
      },
      {
        id: 13,
        name: "Bar1Value",
        x: 9_800_000,
        y: 2_500_000,
        cx: 1_700_000,
        cy: 420_000,
        text: S7.bars?.[0]?.value ?? "",
        font: "Plus Jakarta Sans",
        sz: 1850,
        color: C.harbor,
        bold: true,
      },
      {
        id: 14,
        name: "Bar2Label",
        x: 685_800,
        y: 3_140_000,
        cx: 3_560_000,
        cy: 640_000,
        text: `${S7.bars?.[1]?.label ?? ""}\n${S7.bars?.[1]?.sub ?? ""}`,
        font: "Plus Jakarta Sans",
        sz: 1450,
        color: C.ink,
        bold: true,
      },
      {
        id: 15,
        name: "Bar2Value",
        x: 9_800_000,
        y: 3_260_000,
        cx: 1_700_000,
        cy: 420_000,
        text: S7.bars?.[1]?.value ?? "",
        font: "Plus Jakarta Sans",
        sz: 1850,
        color: C.harborDeep,
        bold: true,
      },
      {
        id: 16,
        name: "HomeOfficeCallout",
        x: 900_000,
        y: 4_240_000,
        cx: 4_820_000,
        cy: 1_620_000,
        text: `${S7.homeOfficeCallout?.title ?? ""}\n${S7.homeOfficeCallout?.amount ?? ""}\n${S7.homeOfficeCallout?.body ?? ""}`,
        font: "Plus Jakarta Sans",
        sz: 1500,
        color: C.ink,
        bold: true,
      },
      {
        id: 17,
        name: "ScopeNote",
        x: 6_060_000,
        y: 4_240_000,
        cx: 5_440_000,
        cy: 1_620_000,
        text: `SCOPE & PENDING FINANCE REVIEW\n${S7.scopeNote ?? ""}`,
        font: "Plus Jakarta Sans",
        sz: 1450,
        color: C.ink,
        linkTarget: "mailto:finance@globalfellowship.org",
      },
      {
        id: 18,
        name: "Footer",
        x: 685_800,
        y: 6_140_000,
        cx: 10_800_000,
        cy: 340_000,
        text: `${S7.footerLeft}  |  ${S7.specimenStatus} · Slide 7 / 8`,
        font: "Plus Jakarta Sans",
        sz: 1150,
        color: C.slate,
        phType: "ftr",
        phIdx: 2,
      },
    ],
    notes: S7.speakerNote,
  },
  // Slide 8: Single Primary Bridge Project Focus + Two Calm Secondary Pathways (matching HTML 1-to-1)
  {
    layoutIdx: 1,
    bgHex: C.harborDeep,
    logoRel: "reversed",
    rects: [
      {
        id: 2,
        name: "TopApricotBand",
        x: 0,
        y: 0,
        cx: 12_192_000,
        cy: 90_000,
        fill: C.apricot,
      },
      {
        id: 3,
        name: "PrimaryBridgeBg",
        x: 685_800,
        y: 2_680_000,
        cx: 5_680_000,
        cy: 3_120_000,
        fill: C.apricot,
      },
      {
        id: 4,
        name: "Secondary1Bg",
        x: 6_720_000,
        y: 2_680_000,
        cx: 4_780_000,
        cy: 1_460_000,
        fill: C.harborCard,
      },
      {
        id: 5,
        name: "Secondary1Top",
        x: 6_720_000,
        y: 2_680_000,
        cx: 4_780_000,
        cy: 52_000,
        fill: C.seaMist,
      },
      {
        id: 6,
        name: "Secondary2Bg",
        x: 6_720_000,
        y: 4_340_000,
        cx: 4_780_000,
        cy: 1_460_000,
        fill: C.harborCard,
      },
      {
        id: 7,
        name: "Secondary2Top",
        x: 6_720_000,
        y: 4_340_000,
        cx: 4_780_000,
        cy: 52_000,
        fill: C.seaMist,
      },
    ],
    boxes: [
      {
        id: 10,
        name: "Kicker",
        x: 685_800,
        y: 1_020_000,
        cx: 10_800_000,
        cy: 340_000,
        text: S8.kicker,
        font: "Plus Jakarta Sans",
        sz: 1400,
        color: C.seaMist,
        bold: true,
      },
      {
        id: 11,
        name: "Title",
        x: 685_800,
        y: 1_420_000,
        cx: 10_800_000,
        cy: 1_050_000,
        text: S8.headline,
        font: "Source Serif 4",
        sz: 4000,
        color: C.paper,
        bold: true,
        phType: "title",
      },
      {
        id: 12,
        name: "PrimaryBridge",
        x: 920_000,
        y: 2_880_000,
        cx: 5_200_000,
        cy: 2_760_000,
        text: `${S8.columns?.[0]?.kicker ?? ""}\n${S8.columns?.[0]?.title ?? ""}\n\n${S8.columns?.[0]?.body ?? ""}\n\n${S8.columns?.[0]?.footerNote ?? ""}\n${S8.columns?.[0]?.email ?? ""}`,
        font: "Plus Jakarta Sans",
        sz: 1580,
        color: C.ink,
        bold: true,
        phType: "body",
        phIdx: 1,
        linkTarget: "mailto:info@globalfellowship.org",
      },
      {
        id: 13,
        name: "SecondaryOpenBooks",
        x: 6_920_000,
        y: 2_820_000,
        cx: 4_380_000,
        cy: 1_240_000,
        text: `${S8.columns?.[1]?.kicker ?? ""} · ${S8.columns?.[1]?.title ?? ""}\n${S8.columns?.[1]?.body ?? ""}\n${S8.columns?.[1]?.email ?? ""}`,
        font: "Plus Jakarta Sans",
        sz: 1380,
        color: C.paper,
        linkTarget: "mailto:finance@globalfellowship.org",
      },
      {
        id: 15,
        name: "SecondaryService",
        x: 6_920_000,
        y: 4_480_000,
        cx: 4_380_000,
        cy: 1_240_000,
        text: `${S8.columns?.[2]?.kicker ?? ""} · ${S8.columns?.[2]?.title ?? ""}\n${S8.columns?.[2]?.body ?? ""}\n${S8.columns?.[2]?.email ?? ""}`,
        font: "Plus Jakarta Sans",
        sz: 1380,
        color: C.paper,
        linkTarget: "mailto:info@globalfellowship.org",
      },
      {
        id: 14,
        name: "Footer",
        x: 685_800,
        y: 6_120_000,
        cx: 10_800_000,
        cy: 360_000,
        text: `${S8.footerLeft}  |  ${S8.specimenStatus} · Slide 8 / 8`,
        font: "Plus Jakarta Sans",
        sz: 1150,
        color: C.mistText,
        phType: "ftr",
        phIdx: 2,
      },
    ],
    notes: S8.speakerNote,
  },
];

const LAYOUT_DEFS = [
  { idx: 1, name: "Cover Harbor Night", type: "title" },
  { idx: 2, name: "Editorial Split Warm Paper", type: "twoObj" },
  { idx: 3, name: "Warm Linen Statement", type: "secHead" },
  { idx: 4, name: "Stepped Authority and Data", type: "obj" },
  { idx: 5, name: "Sanctuary Prayer Dark", type: "blank" },
] as const;

const buildLayoutXml = (
  name: string,
  type: string
): string => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" type="${type}">
  <p:cSld name="${xmlEscape(name)}">
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr/>
      <p:sp><p:nvSpPr><p:cNvPr id="2" name="Title Placeholder"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr><p:ph type="title"/></p:nvPr></p:nvSpPr><p:spPr><a:xfrm><a:off x="685800" y="1480000"/><a:ext cx="10800000" cy="1200000"/></a:xfrm></p:spPr><p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:endParaRPr lang="en-US"/></a:p></p:txBody></p:sp>
      <p:sp><p:nvSpPr><p:cNvPr id="3" name="Content Placeholder"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr><p:ph type="body" idx="1"/></p:nvPr></p:nvSpPr><p:spPr><a:xfrm><a:off x="685800" y="3000000"/><a:ext cx="10800000" cy="2700000"/></a:xfrm></p:spPr><p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:endParaRPr lang="en-US"/></a:p></p:txBody></p:sp>
      <p:sp><p:nvSpPr><p:cNvPr id="4" name="Footer Placeholder"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr><p:ph type="ftr" idx="2"/></p:nvPr></p:nvSpPr><p:spPr><a:xfrm><a:off x="685800" y="6120000"/><a:ext cx="10800000" cy="360000"/></a:xfrm></p:spPr><p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:endParaRPr lang="en-US"/></a:p></p:txBody></p:sp>
    </p:spTree>
  </p:cSld>
</p:sldLayout>`;

const buildNotesSlideXml = (
  notesText: string
): string => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:notes xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr/>
      <p:sp>
        <p:nvSpPr><p:cNvPr id="2" name="Notes Placeholder"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr><p:ph type="body" idx="1"/></p:nvPr></p:nvSpPr>
        <p:spPr/>
        <p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:r><a:rPr lang="en-US" sz="1200"/><a:t>${xmlEscape(notesText)}</a:t></a:r></a:p></p:txBody>
      </p:sp>
    </p:spTree>
  </p:cSld>
</p:notes>`;

const pptxEntries: ZipEntry[] = [];

const contentOverrides: string[] = [
  `<Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>`,
  `<Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>`,
  `<Override PartName="/ppt/notesMasters/notesMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.notesMaster+xml"/>`,
  `<Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>`,
  `<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>`,
];

for (const layout of LAYOUT_DEFS) {
  contentOverrides.push(
    `<Override PartName="/ppt/slideLayouts/slideLayout${layout.idx}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>`
  );
  pptxEntries.push(
    {
      name: `ppt/slideLayouts/slideLayout${layout.idx}.xml`,
      data: Buffer.from(buildLayoutXml(layout.name, layout.type), "utf-8"),
    },
    {
      name: `ppt/slideLayouts/_rels/slideLayout${layout.idx}.xml.rels`,
      data: Buffer.from(
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/></Relationships>`,
        "utf-8"
      ),
    }
  );
}

const slideIdListXml: string[] = [];

const presRelsXml: string[] = [
  `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>`,
  `<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/notesMaster" Target="notesMasters/notesMaster1.xml"/>`,
];

for (let i = 0; i < SLIDES.length; i += 1) {
  const num = i + 1;
  const spec = SLIDES[i];
  const rIdPres = `rId${num + 2}`;

  slideIdListXml.push(`<p:sldId id="${255 + num}" r:id="${rIdPres}"/>`);
  presRelsXml.push(
    `<Relationship Id="${rIdPres}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${num}.xml"/>`
  );

  contentOverrides.push(
    `<Override PartName="/ppt/slides/slide${num}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`,
    `<Override PartName="/ppt/notesSlides/notesSlide${num}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.notesSlide+xml"/>`
  );

  const slideRels: string[] = [
    `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout${spec.layoutIdx}.xml"/>`,
    `<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/notesSlide" Target="../notesSlides/notesSlide${num}.xml"/>`,
  ];

  let picXml = "";
  let nextRelIdx = 3;

  if (spec.logoRel !== undefined) {
    let target = "../media/logo-light.png";

    if (spec.logoRel === "reversed") {
      target = "../media/logo-reversed.png";
    } else if (spec.logoRel === "mono") {
      target = "../media/logo-mono.png";
    }

    const rId = `rId${nextRelIdx}`;
    nextRelIdx += 1;
    slideRels.push(
      `<Relationship Id="${rId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="${target}"/>`
    );
    picXml += makeLogoPicXml(rId);
  }

  if (spec.coverPhoto === true) {
    const photoRId = `rId${nextRelIdx}`;
    nextRelIdx += 1;
    slideRels.push(
      `<Relationship Id="${photoRId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/cover-street-tea.jpg"/>`
    );
    picXml += `\n      ${makeCoverPhotoPicXml(photoRId)}`;
  }

  const boxXmlList = spec.boxes.map((b) => {
    if (b.linkTarget === undefined) {
      return makeTextBoxXml(b);
    }

    const rId = `rId${nextRelIdx}`;
    nextRelIdx += 1;
    slideRels.push(
      `<Relationship Id="${rId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="${xmlEscape(b.linkTarget)}" TargetMode="External"/>`
    );

    return makeTextBoxXml(b, rId);
  });

  const slideXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:bg><p:bgPr><a:solidFill><a:srgbClr val="${spec.bgHex}"/></a:solidFill><a:effectLst/></p:bgPr></p:bg>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>
      ${spec.rects.map((r) => makeRectXml(r)).join("\n      ")}
      ${picXml}
      ${boxXmlList.join("\n      ")}
    </p:spTree>
  </p:cSld>
</p:sld>`;

  pptxEntries.push(
    {
      name: `ppt/slides/slide${num}.xml`,
      data: Buffer.from(slideXml, "utf-8"),
    },
    {
      name: `ppt/slides/_rels/slide${num}.xml.rels`,
      data: Buffer.from(
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${slideRels.join("")}</Relationships>`,
        "utf-8"
      ),
    },
    {
      name: `ppt/notesSlides/notesSlide${num}.xml`,
      data: Buffer.from(buildNotesSlideXml(spec.notes), "utf-8"),
    },
    {
      name: `ppt/notesSlides/_rels/notesSlide${num}.xml.rels`,
      data: Buffer.from(
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/notesMaster" Target="../notesMasters/notesMaster1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="../slides/slide${num}.xml"/></Relationships>`,
        "utf-8"
      ),
    }
  );
}

pptxEntries.push(
  {
    name: "[Content_Types].xml",
    data: Buffer.from(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Default Extension="jpg" ContentType="image/jpeg"/>${contentOverrides.join("")}</Types>`,
      "utf-8"
    ),
  },
  {
    name: "_rels/.rels",
    data: Buffer.from(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>`,
      "utf-8"
    ),
  },
  {
    name: "docProps/core.xml",
    data: Buffer.from(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>Global Fellowship 16:9 Presentation Deck Starter</dc:title><dc:creator>Global Fellowship</dc:creator></cp:coreProperties>`,
      "utf-8"
    ),
  },
  {
    name: "ppt/presentation.xml",
    data: Buffer.from(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst><p:notesMasterIdLst><p:notesMasterId r:id="rId2"/></p:notesMasterIdLst><p:sldIdLst>${slideIdListXml.join("")}</p:sldIdLst><p:sldSz cx="12192000" cy="6858000"/><p:notesSz cx="6858000" cy="9144000"/></p:presentation>`,
      "utf-8"
    ),
  },
  {
    name: "ppt/_rels/presentation.xml.rels",
    data: Buffer.from(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${presRelsXml.join("")}</Relationships>`,
      "utf-8"
    ),
  },
  {
    name: "ppt/slideMasters/slideMaster1.xml",
    data: Buffer.from(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr/></p:spTree></p:cSld><p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/><p:sldLayoutIdLst>${LAYOUT_DEFS.map((l) => `<p:sldLayoutId id="${2_147_483_648 + l.idx}" r:id="rId${l.idx}"/>`).join("")}</p:sldLayoutIdLst></p:sldMaster>`,
      "utf-8"
    ),
  },
  {
    name: "ppt/slideMasters/_rels/slideMaster1.xml.rels",
    data: Buffer.from(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${LAYOUT_DEFS.map((l) => `<Relationship Id="rId${l.idx}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout${l.idx}.xml"/>`).join("")}<Relationship Id="rId6" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/></Relationships>`,
      "utf-8"
    ),
  },
  {
    name: "ppt/notesMasters/notesMaster1.xml",
    data: Buffer.from(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:notesMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr/></p:spTree></p:cSld><p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/></p:notesMaster>`,
      "utf-8"
    ),
  },
  {
    name: "ppt/notesMasters/_rels/notesMaster1.xml.rels",
    data: Buffer.from(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/></Relationships>`,
      "utf-8"
    ),
  },
  {
    name: "ppt/theme/theme1.xml",
    data: Buffer.from(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Global Fellowship Brand Theme"><a:themeElements><a:clrScheme name="Global Fellowship Living Nearness"><a:dk1><a:srgbClr val="${C.ink}"/></a:dk1><a:lt1><a:srgbClr val="${C.paper}"/></a:lt1><a:dk2><a:srgbClr val="${C.harborDeep}"/></a:dk2><a:lt2><a:srgbClr val="${C.linen}"/></a:lt2><a:accent1><a:srgbClr val="${C.harbor}"/></a:accent1><a:accent2><a:srgbClr val="${C.clay}"/></a:accent2><a:accent3><a:srgbClr val="${C.apricot}"/></a:accent3><a:accent4><a:srgbClr val="${C.slate}"/></a:accent4><a:accent5><a:srgbClr val="${C.forest}"/></a:accent5><a:accent6><a:srgbClr val="${C.crimson}"/></a:accent6><a:hlink><a:srgbClr val="${C.harbor}"/></a:hlink><a:folHlink><a:srgbClr val="${C.harborDeep}"/></a:folHlink></a:clrScheme><a:fontScheme name="Global Fellowship Type (Georgia and Calibri Offline Fallbacks)"><a:majorFont><a:latin typeface="Source Serif 4" panose="02040502050405020303" pitchFamily="18" charset="0"/><a:ea typeface="Noto Sans SC"/><a:cs typeface="Noto Sans Arabic"/></a:majorFont><a:minorFont><a:latin typeface="Plus Jakarta Sans" panose="020B0603020202020204" pitchFamily="34" charset="0"/><a:ea typeface="Noto Sans SC"/><a:cs typeface="Noto Sans Arabic"/></a:minorFont></a:fontScheme><a:fmtScheme name="Global Fellowship"><a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:fillStyleLst><a:lnStyleLst><a:ln w="9525"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln><a:ln w="19050"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln><a:ln w="28575"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln></a:lnStyleLst><a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst><a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:bgFillStyleLst></a:fmtScheme></a:themeElements></a:theme>`,
      "utf-8"
    ),
  },
  { name: "ppt/media/logo-reversed.png", data: logoReversedPng },
  { name: "ppt/media/logo-light.png", data: logoLightPng },
  { name: "ppt/media/logo-mono.png", data: logoMonoPng },
  { name: "ppt/media/cover-street-tea.jpg", data: coverStreetTeaJpg }
);

fs.writeFileSync(
  path.join(officeDir, "global-fellowship-deck-starter.pptx"),
  createZipBuffer(pptxEntries)
);

console.log(
  "Generated v15.0 OOXML starters dynamically hydrated from tokens.json: worker-prayer-letter-public-starter.docx, worker-prayer-letter-restricted-starter.docx, local-only-meeting-sheet-starter.docx, local-fellowship-brief-arabic-rtl-starter.docx, donor-receipt-and-redesignation-starter.docx, and global-fellowship-deck-starter.pptx (with embedded Slide 1 street photo)"
);
