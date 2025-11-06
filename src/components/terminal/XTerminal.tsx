import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import '@xterm/xterm/css/xterm.css';

interface XTerminalProps {
  webContainer?: any;
  theme?: 'dark' | 'light';
  onReady?: (terminal: Terminal) => void;
  onData?: (data: string) => void;
  className?: string;
}

export const XTerminal: React.FC<XTerminalProps> = ({
  webContainer,
  theme = 'dark',
  onReady,
  onData,
  className = ''
}) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminal = useRef<Terminal | null>(null);
  const fitAddon = useRef<FitAddon | null>(null);
  const shellProcess = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);

  const themes = {
    dark: {
      background: '#1e1e1e',
      foreground: '#ffffff',
      cursor: '#ffffff',
      selection: '#ffffff40'
    },
    light: {
      background: '#ffffff',
      foreground: '#000000',
      cursor: '#000000',
      selection: '#00000040'
    }
  };

  useEffect(() => {
    if (!terminalRef.current) return;

    terminal.current = new Terminal({
      theme: themes[theme],
      fontFamily: 'monospace',
      fontSize: 14,
      cursorBlink: true,
      scrollback: 1000
    });

    fitAddon.current = new FitAddon();
    const webLinksAddon = new WebLinksAddon();

    terminal.current.loadAddon(fitAddon.current);
    terminal.current.loadAddon(webLinksAddon);
    terminal.current.open(terminalRef.current);
    fitAddon.current.fit();

    terminal.current.onData((data) => {
      onData?.(data);
      if (shellProcess.current) {
        shellProcess.current.input.getWriter().write(new TextEncoder().encode(data));
      }
    });

    setIsReady(true);
    onReady?.(terminal.current);

    return () => terminal.current?.dispose();
  }, [theme]);

  useEffect(() => {
    if (!isReady || !webContainer || !terminal.current) return;

    const startShell = async () => {
      try {
        shellProcess.current = await webContainer.spawn('sh', [], {
          terminal: {
            cols: terminal.current?.cols || 80,
            rows: terminal.current?.rows || 24
          }
        });

        shellProcess.current.output.pipeTo(new WritableStream({
          write(chunk) {
            terminal.current?.write(new TextDecoder().decode(chunk));
          }
        }));

        terminal.current.writeln('Terminal ready\r\n');
      } catch (error) {
        terminal.current?.writeln(`Error: ${error}\r\n`);
      }
    };

    startShell();
  }, [isReady, webContainer]);

  return <div ref={terminalRef} className={className} style={{ width: '100%', height: '100%' }} />;
};

export default XTerminal;