import React, { useState, useRef, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Copy, Eye, Code, Maximize2, ExternalLink } from 'lucide-react';

interface CodeRendererProps {
  code: string;
}

export const CodeRenderer: React.FC<CodeRendererProps> = ({ code }) => {
  const [view, setView] = useState<'split' | 'preview' | 'code'>('split');
  const [copied, setCopied] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const createFullHTML = (bodyContent: string) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Code Preview</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.2.0/flowbite.min.css" rel="stylesheet" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <link rel="stylesheet" href="https://unpkg.com/swiper@8/swiper-bundle.min.css">
    <script src="https://unpkg.com/swiper@8/swiper-bundle.min.js"></script>
    <script src="https://unpkg.com/@popperjs/core@2"></script>
    <script src="https://unpkg.com/tippy.js@6"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: '#3B82F6',
                        'primary-50': '#EFF6FF',
                        'primary-100': '#DBEAFE',
                        'primary-500': '#3B82F6',
                        'primary-600': '#2563EB',
                        'primary-700': '#1D4ED8',
                    }
                }
            }
        }
    </script>
</head>
${bodyContent}
<script src="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.2.0/flowbite.min.js"></script>
</html>`;
  };

  useEffect(() => {
    if (iframeRef.current && code) {
      const fullHTML = createFullHTML(code);
      const iframe = iframeRef.current;
      iframe.srcdoc = fullHTML;
    }
  }, [code]);

  const openInNewTab = () => {
    const fullHTML = createFullHTML(code);
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(fullHTML);
      newWindow.document.close();
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="p-4 border-b bg-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold">HTML Code Preview</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border rounded-lg">
            <Button
              variant={view === 'split' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('split')}
              className="rounded-r-none"
            >
              Split
            </Button>
            <Button
              variant={view === 'preview' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('preview')}
              className="rounded-none"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              variant={view === 'code' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('code')}
              className="rounded-l-none"
            >
              <Code className="w-4 h-4" />
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={openInNewTab}
            className="flex items-center gap-1"
          >
            <ExternalLink className="w-4 h-4" />
            Open
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={copyCode}
            className="flex items-center gap-1"
          >
            <Copy className="w-4 h-4" />
            {copied ? 'Copied!' : 'Copy'}
          </Button>
        </div>
      </div>
      
      <div className="flex-1 p-4">
        <div className={`h-full ${
          view === 'split' ? 'grid grid-cols-2 gap-4' : 'flex flex-col'
        }`}>
          {(view === 'split' || view === 'code') && (
            <Card className="p-4 bg-white">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium">HTML Code</h4>
                <span className="text-xs text-gray-500">Tailwind + Flowbite</span>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <textarea
                  value={code}
                  readOnly
                  className="w-full h-[400px] p-4 font-mono text-sm bg-gray-50 border-0 resize-none focus:outline-none"
                  style={{
                    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                    fontSize: '14px',
                    lineHeight: '1.5'
                  }}
                />
              </div>
            </Card>
          )}
          
          {(view === 'split' || view === 'preview') && (
            <Card className="p-4 bg-white">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium">Live Preview</h4>
                <span className="text-xs text-gray-500">Interactive</span>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <iframe
                  ref={iframeRef}
                  className="w-full h-[400px] border-0"
                  title="Code Preview"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
                />
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};