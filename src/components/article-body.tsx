import React from "react";

function inline(text: string, keyPrefix: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={`${keyPrefix}-b-${i}`} className="font-semibold text-ink">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <React.Fragment key={`${keyPrefix}-t-${i}`}>{part}</React.Fragment>;
  });
}

export function ArticleBody({ content }: { content: string }) {
  const lines = content.split("\n");
  const blocks: React.ReactNode[] = [];
  let list: string[] = [];
  let ordered = false;
  let key = 0;

  const flush = () => {
    if (list.length === 0) return;
    const items = list.map((item, i) => (
      <li key={`li-${key}-${i}`}>{inline(item, `li-${key}-${i}`)}</li>
    ));
    blocks.push(
      ordered ? (
        <ol key={`ol-${key++}`}>{items}</ol>
      ) : (
        <ul key={`ul-${key++}`}>{items}</ul>
      )
    );
    list = [];
  };

  for (const raw of lines) {
    const line = raw.trim();

    if (!line) {
      flush();
      continue;
    }

    if (line.startsWith("## ")) {
      flush();
      blocks.push(<h2 key={`h2-${key++}`}>{line.slice(3)}</h2>);
      continue;
    }

    if (line.startsWith("### ")) {
      flush();
      blocks.push(<h3 key={`h3-${key++}`}>{line.slice(4)}</h3>);
      continue;
    }

    if (line.startsWith("- ")) {
      if (list.length > 0 && ordered) flush();
      ordered = false;
      list.push(line.slice(2));
      continue;
    }

    const numbered = line.match(/^\d+\.\s+(.*)$/);
    if (numbered) {
      if (list.length > 0 && !ordered) flush();
      ordered = true;
      list.push(numbered[1]);
      continue;
    }

    flush();
    blocks.push(<p key={`p-${key++}`}>{inline(line, `p-${key}`)}</p>);
  }

  flush();

  return <div className="prose-wc">{blocks}</div>;
}
