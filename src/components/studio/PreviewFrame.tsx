type Props = {
  title: string;
  prompt: string;
};

export default function PreviewFrame({ title, prompt }: Props) {
  const html = `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>${escapeHtml(title)}</title>
      <style>
        :root { color-scheme: dark; }
        body { margin:0; font-family: Inter, system-ui, sans-serif; background:#0b0d12; color:#e8e9ea; }
        .hero { padding:48px 24px; text-align:center; }
        h1 { font-size: 32px; margin: 0 0 12px; }
        p { opacity:.8; max-width: 720px; margin: 0 auto; }
        .box { margin: 24px auto; max-width: 880px; border-radius: 14px; border:1px solid #2a2f3a; background:linear-gradient(180deg,#141823,#0b0d12); padding:24px }
      </style>
    </head>
    <body>
      <div class="hero">
        <h1>Preview</h1>
        <p>This is a lightweight preview scaffold for: <strong>${escapeHtml(prompt)}</strong></p>
        <div class="box">Project files will render here once connected to a real build.</div>
      </div>
    </body>
  </html>`;

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


