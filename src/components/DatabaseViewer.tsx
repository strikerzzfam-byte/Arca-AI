import React from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { apiService } from '../lib/api';
import { useRealTimeData } from '../hooks/useRealTimeData';

interface Chat {
  id: number;
  message: string;
  created_at: string;
}

interface Frame {
  id: number;
  design_code: string;
  created_at: string;
}

export const DatabaseViewer: React.FC = () => {
  const { data: chats = [], loading: chatsLoading, refetch: refetchChats } = useRealTimeData(
    () => apiService.getChats(),
    3000
  );
  
  const { data: frames = [], loading: framesLoading, refetch: refetchFrames } = useRealTimeData(
    () => apiService.getFrames(),
    3000
  );

  const loading = chatsLoading || framesLoading;

  const fetchData = async () => {
    await Promise.all([refetchChats(), refetchFrames()]);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Database Viewer</h1>
        <Button onClick={fetchData} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4">Chats Table ({chats.length} records)</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {chats.map((chat) => (
              <div key={chat.id} className="p-2 border rounded text-sm">
                <div className="font-medium">ID: {chat.id}</div>
                <div className="text-gray-600">{chat.message}</div>
                <div className="text-xs text-gray-400">{new Date(chat.created_at).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4">Frames Table ({frames.length} records)</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {frames.map((frame) => (
              <div key={frame.id} className="p-2 border rounded text-sm">
                <div className="font-medium">ID: {frame.id}</div>
                <pre className="text-gray-600 text-xs overflow-x-auto">{frame.design_code.substring(0, 100)}...</pre>
                <div className="text-xs text-gray-400">{new Date(frame.created_at).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};