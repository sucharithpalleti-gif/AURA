import type { ReactNode } from "react";

const inlinePattern =
  /(\*\*[^*]+\*\*|__[^_]+__|~~[^~]+~~|`[^`]+`|\*[^*\n]+\*|_[^_\n]+_)/g;

function renderInline(text: string): ReactNode[] {
  return text.split(inlinePattern).map((piece, index) => {
    const key = `${index}-${piece}`;

    if (
      (piece.startsWith("**") && piece.endsWith("**")) ||
      (piece.startsWith("__") && piece.endsWith("__"))
    ) {
      return (
        <strong
          key={key}
          className="font-semibold text-slate-900 dark:text-white"
        >
          {piece.slice(2, -2)}
        </strong>
      );
    }

    if (piece.startsWith("~~") && piece.endsWith("~~")) {
      return (
        <del key={key} className="text-slate-400">
          {piece.slice(2, -2)}
        </del>
      );
    }

    if (piece.startsWith("`") && piece.endsWith("`")) {
      return (
        <code
          key={key}
          className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[0.9em] text-violet-700 dark:bg-slate-800 dark:text-violet-300"
        >
          {piece.slice(1, -1)}
        </code>
      );
    }

    if (
      (piece.startsWith("*") && piece.endsWith("*")) ||
      (piece.startsWith("_") && piece.endsWith("_"))
    ) {
      return <em key={key}>{piece.slice(1, -1)}</em>;
    }

    return piece;
  });
}

function isThematicBreak(line: string): boolean {
  return /^(?:-{3,}|_{3,}|\*{3,})$/.test(line.trim());
}

function isBlockStart(line: string): boolean {
  return (
    /^\s*```/.test(line) ||
    /^#{1,6}\s+/.test(line.trim()) ||
    /^\s*>/.test(line) ||
    /^\s*[-*+]\s+/.test(line) ||
    /^\s*\d+[.)]\s+/.test(line) ||
    isThematicBreak(line)
  );
}

function renderHeading(
  level: number,
  text: string,
  key: string
): ReactNode {
  const content = renderInline(text);

  switch (level) {
    case 1:
      return (
        <h1
          key={key}
          className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white"
        >
          {content}
        </h1>
      );
    case 2:
      return (
        <h2
          key={key}
          className="text-xl font-semibold tracking-tight text-slate-950 dark:text-white"
        >
          {content}
        </h2>
      );
    case 3:
      return (
        <h3
          key={key}
          className="text-lg font-semibold text-slate-900 dark:text-white"
        >
          {content}
        </h3>
      );
    case 4:
      return (
        <h4
          key={key}
          className="text-base font-semibold text-slate-900 dark:text-white"
        >
          {content}
        </h4>
      );
    case 5:
      return (
        <h5
          key={key}
          className="text-sm font-semibold text-slate-900 dark:text-white"
        >
          {content}
        </h5>
      );
    default:
      return (
        <h6
          key={key}
          className="text-sm font-medium text-slate-800 dark:text-slate-200"
        >
          {content}
        </h6>
      );
  }
}

export default function MarkdownPreview({ content }: { content: string }) {
  if (!content.trim()) {
    return (
      <p className="text-sm italic text-slate-400 dark:text-slate-500">
        This entry is still empty.
      </p>
    );
  }

  const lines = content.replace(/\r\n?/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (/^\s*```/.test(line)) {
      index += 1;
      const codeLines: string[] = [];

      while (index < lines.length && !/^\s*```/.test(lines[index])) {
        codeLines.push(lines[index]);
        index += 1;
      }

      if (index < lines.length) {
        index += 1;
      }

      blocks.push(
        <pre
          key={`code-${blocks.length}`}
          className="overflow-x-auto rounded-xl bg-slate-950 p-4 text-sm leading-6 text-slate-100"
        >
          <code>{codeLines.join("\n")}</code>
        </pre>
      );
      continue;
    }

    const headingMatch = /^(#{1,6})\s+(.*)$/.exec(line.trim());

    if (headingMatch) {
      blocks.push(
        renderHeading(
          headingMatch[1].length,
          headingMatch[2],
          `heading-${blocks.length}`
        )
      );
      index += 1;
      continue;
    }

    if (isThematicBreak(line)) {
      blocks.push(
        <hr
          key={`rule-${blocks.length}`}
          className="border-slate-200 dark:border-slate-700"
        />
      );
      index += 1;
      continue;
    }

    if (/^\s*>/.test(line)) {
      const quoteLines: string[] = [];

      while (index < lines.length && /^\s*>/.test(lines[index])) {
        quoteLines.push(lines[index].replace(/^\s*>\s?/, ""));
        index += 1;
      }

      blocks.push(
        <blockquote
          key={`quote-${blocks.length}`}
          className="space-y-2 border-l-2 border-violet-300 pl-4 text-slate-500 dark:border-violet-700 dark:text-slate-400"
        >
          {quoteLines.map((quoteLine, quoteIndex) => (
            <p key={`quote-line-${quoteIndex}`}>{renderInline(quoteLine)}</p>
          ))}
        </blockquote>
      );
      continue;
    }

    const unorderedMatch = /^\s*[-*+]\s+(.*)$/.exec(line);
    const orderedMatch = /^\s*\d+[.)]\s+(.*)$/.exec(line);

    if (unorderedMatch || orderedMatch) {
      const isOrdered = Boolean(orderedMatch);
      const items: string[] = [];

      while (index < lines.length) {
        const itemMatch = isOrdered
          ? /^\s*\d+[.)]\s+(.*)$/.exec(lines[index])
          : /^\s*[-*+]\s+(.*)$/.exec(lines[index]);

        if (!itemMatch) {
          break;
        }

        items.push(itemMatch[1]);
        index += 1;
      }

      if (isOrdered) {
        blocks.push(
          <ol
            key={`list-${blocks.length}`}
            className="list-decimal space-y-1 pl-5 marker:text-violet-500"
          >
            {items.map((item, itemIndex) => (
              <li key={`list-item-${itemIndex}`}>{renderInline(item)}</li>
            ))}
          </ol>
        );
      } else {
        blocks.push(
          <ul
            key={`list-${blocks.length}`}
            className="list-disc space-y-1 pl-5 marker:text-violet-500"
          >
            {items.map((item, itemIndex) => (
              <li key={`list-item-${itemIndex}`}>{renderInline(item)}</li>
            ))}
          </ul>
        );
      }

      continue;
    }

    const paragraphLines: string[] = [];

    while (
      index < lines.length &&
      lines[index].trim() &&
      !isBlockStart(lines[index])
    ) {
      paragraphLines.push(lines[index].trim());
      index += 1;
    }

    if (paragraphLines.length === 0) {
      paragraphLines.push(line.trim());
      index += 1;
    }

    blocks.push(
      <p key={`paragraph-${blocks.length}`}>
        {renderInline(paragraphLines.join(" "))}
      </p>
    );
  }

  return (
    <div className="space-y-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
      {blocks}
    </div>
  );
}