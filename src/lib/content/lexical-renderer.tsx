import Link from "next/link";
import type { ReactNode } from "react";

import {
  isJsonArray,
  isJsonNumber,
  isJsonObject,
  isJsonString,
  sanitizePublicHref,
} from "./core-schema";
import type { JsonObject, JsonValue } from "./types";
import { toInternalUrlObject } from "./url-object";

const FORMAT_BOLD = 1;
const FORMAT_ITALIC = 2;
const FORMAT_STRIKETHROUGH = 4;
const FORMAT_UNDERLINE = 8;
const FORMAT_CODE = 16;

type MinHeadingLevel = 2 | 3 | 4;

const hasBitFlag = (mask: number, flag: number): boolean =>
  Math.floor(mask / flag) % 2 === 1;

const extractChildObjects = (value: JsonValue | undefined): JsonObject[] => {
  if (!isJsonArray(value)) {
    return [];
  }

  const nodes: JsonObject[] = [];

  for (const item of value) {
    if (isJsonObject(item)) {
      nodes.push(item);
    }
  }

  return nodes;
};

const extractRootChildren = (document: JsonValue | undefined): JsonObject[] => {
  if (!isJsonObject(document)) {
    return [];
  }

  if (isJsonObject(document.root)) {
    return extractChildObjects(document.root.children);
  }

  return extractChildObjects(document.children);
};

const renderTextNode = (node: JsonObject, key: string): ReactNode => {
  const rawText = isJsonString(node.text) ? node.text : "";

  if (rawText.length === 0) {
    return null;
  }

  const mask = isJsonNumber(node.format) ? node.format : 0;
  let content: ReactNode = rawText;

  if (hasBitFlag(mask, FORMAT_CODE)) {
    content = (
      <code className="bg-linen text-foreground rounded-sm px-1.5 py-0.5 text-sm">
        {content}
      </code>
    );
  }

  if (hasBitFlag(mask, FORMAT_BOLD)) {
    content = (
      <strong className="text-foreground font-semibold">{content}</strong>
    );
  }

  if (hasBitFlag(mask, FORMAT_ITALIC)) {
    content = <em>{content}</em>;
  }

  if (hasBitFlag(mask, FORMAT_UNDERLINE)) {
    content = <span className="underline underline-offset-4">{content}</span>;
  }

  if (hasBitFlag(mask, FORMAT_STRIKETHROUGH)) {
    content = <span className="line-through">{content}</span>;
  }

  return <span key={key}>{content}</span>;
};

const parseHeadingLevel = (tag: JsonValue | undefined): number => {
  if (!isJsonString(tag)) {
    return 4;
  }

  switch (tag) {
    case "h1":
    case "h2": {
      return 2;
    }

    case "h3": {
      return 3;
    }

    default: {
      return 4;
    }
  }
};

const renderHeading = (
  tag: JsonValue | undefined,
  children: ReactNode[],
  key: string,
  minHeadingLevel: MinHeadingLevel
): ReactNode => {
  const resolvedLevel = Math.max(parseHeadingLevel(tag), minHeadingLevel);

  if (resolvedLevel === 2) {
    return (
      <h2
        className="text-foreground mt-8 font-sans text-2xl font-semibold tracking-tight first:mt-0"
        key={key}
      >
        {children}
      </h2>
    );
  }

  if (resolvedLevel === 3) {
    return (
      <h3
        className="text-foreground mt-6 font-sans text-xl font-semibold tracking-tight first:mt-0"
        key={key}
      >
        {children}
      </h3>
    );
  }

  return (
    <h4
      className="text-foreground mt-5 font-sans text-base font-semibold tracking-tight first:mt-0"
      key={key}
    >
      {children}
    </h4>
  );
};

const renderLinkNode = (
  node: JsonObject,
  children: ReactNode[],
  key: string
): ReactNode => {
  if (children.length === 0) {
    return null;
  }

  const fields = isJsonObject(node.fields) ? node.fields : null;
  const rawUrl = fields?.url ?? node.url;
  const safeHref = sanitizePublicHref(rawUrl);

  if (safeHref === null) {
    return <span key={key}>{children}</span>;
  }

  const openInNewTab = fields?.newTab === true || node.newTab === true;

  const isExternal =
    safeHref.startsWith("http://") || safeHref.startsWith("https://");

  if (openInNewTab) {
    return (
      <a
        className="text-primary decoration-border underline underline-offset-4 transition-opacity hover:opacity-80"
        href={safeHref}
        key={key}
        rel="noopener noreferrer"
        target="_blank"
      >
        {children}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    );
  }

  if (safeHref.startsWith("/") && !safeHref.startsWith("//")) {
    return (
      <Link
        className="text-primary decoration-border underline underline-offset-4 transition-opacity hover:opacity-80"
        href={toInternalUrlObject(safeHref)}
        key={key}
      >
        {children}
      </Link>
    );
  }

  return (
    <a
      className="text-primary decoration-border underline underline-offset-4 transition-opacity hover:opacity-80"
      href={safeHref}
      key={key}
      rel={isExternal ? "noopener noreferrer" : undefined}
    >
      {children}
    </a>
  );
};

const renderListNode = (
  node: JsonObject,
  children: ReactNode[],
  key: string
): ReactNode => {
  if (children.length === 0) {
    return null;
  }

  if (node.listType === "number") {
    return (
      <ol
        className="text-muted-foreground list-decimal space-y-2 pl-6 text-base leading-relaxed"
        key={key}
      >
        {children}
      </ol>
    );
  }

  return (
    <ul
      className="text-muted-foreground list-disc space-y-2 pl-6 text-base leading-relaxed"
      key={key}
    >
      {children}
    </ul>
  );
};

const renderNodes = (
  nodes: readonly JsonObject[],
  keyPrefix: string,
  minHeadingLevel: MinHeadingLevel
): ReactNode[] => {
  const rendered: ReactNode[] = [];

  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index];

    if (node === undefined) {
      continue;
    }

    const result = renderNode(
      node,
      `${keyPrefix}-${String(index)}`,
      minHeadingLevel
    );

    if (result !== null) {
      rendered.push(result);
    }
  }

  return rendered;
};

const renderNode = (
  node: JsonObject,
  key: string,
  minHeadingLevel: MinHeadingLevel
): ReactNode => {
  const nodeType = isJsonString(node.type) ? node.type : "";

  const children = renderNodes(
    extractChildObjects(node.children),
    key,
    minHeadingLevel
  );

  switch (nodeType) {
    case "text": {
      return renderTextNode(node, key);
    }

    case "linebreak": {
      return <br key={key} />;
    }

    case "horizontalrule": {
      return <hr className="border-border my-4" key={key} />;
    }

    case "paragraph": {
      return children.length === 0 ? null : (
        <p
          className="text-muted-foreground text-base leading-relaxed"
          key={key}
        >
          {children}
        </p>
      );
    }

    case "heading": {
      return children.length === 0
        ? null
        : renderHeading(node.tag, children, key, minHeadingLevel);
    }

    case "quote": {
      return children.length === 0 ? null : (
        <blockquote
          className="border-primary text-foreground border-l-2 pl-5 font-serif text-lg leading-relaxed"
          key={key}
        >
          {children}
        </blockquote>
      );
    }

    case "list": {
      return renderListNode(node, children, key);
    }

    case "listitem": {
      return children.length === 0 ? null : <li key={key}>{children}</li>;
    }

    case "link":
    case "autolink": {
      return renderLinkNode(node, children, key);
    }

    default: {
      return null;
    }
  }
};

interface LexicalRendererProps {
  readonly document: JsonValue | undefined;
  readonly className?: string;
  readonly minHeadingLevel?: MinHeadingLevel;
}

/**
 * Pure server-side allowlist renderer for Payload CMS v4 Lexical rich-text JSON.
 * Never invokes `dangerouslySetInnerHTML`, strips unsafe protocols, and demotes
 * embedded headings to at least `minHeadingLevel` (default `h2`) so every route
 * maintains a valid semantic heading tree.
 */
export const LexicalRenderer = ({
  document,
  className,
  minHeadingLevel = 2,
}: LexicalRendererProps) => {
  const children = extractRootChildren(document);

  if (children.length === 0) {
    return null;
  }

  return (
    <div className={className ?? "gf-measure flex flex-col gap-4"}>
      {renderNodes(children, "lex", minHeadingLevel)}
    </div>
  );
};
