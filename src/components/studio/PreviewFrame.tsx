type Props = {
  title: string;
  prompt: string;
  generatedCode?: string;
};

export default function PreviewFrame({ title, prompt, generatedCode }: Props) {
  const defaultHtml = `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>${escapeHtml(title)}</title>
      <style>
        body { margin:0; font-family: Inter, system-ui, sans-serif; background:#0b0d12; }
      </style>
    </head>
    <body></body>
  </html>`;

  const html = generatedCode && generatedCode.trim() ? generatedCode : defaultHtml;

  return (
    <iframe title="preview" srcDoc={html} className="w-full h-full rounded-md border" />
  );
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[ch] as string));
}


