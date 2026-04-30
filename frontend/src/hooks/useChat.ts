import { useState, useCallback, useEffect, useMemo } from 'react';
import { chatService } from '@/services/chatService';
import toast from 'react-hot-toast';

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
  hasAttachment?: boolean;
}

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<{ _id: string; sessionTitle: string; updatedAt: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Memoize rendered messages to avoid unnecessary re-renders
  const formattedMessages = useMemo(
    () =>
      messages.map((m) => ({
        ...m,
        isUser: m.role === 'user',
        timeStr: new Date(m.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      })),
    [messages]
  );

  const loadHistory = useCallback(async () => {
    try {
      const data = await chatService.getHistory();
      setSessions(data);
    } catch {
      // silently fail
    }
  }, []);

  const loadSession = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const session = await chatService.getSession(id);
      setSessionId(id);
      setMessages(
        session.messages.map((m: { role: 'user' | 'model'; content: string; timestamp: string }) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        }))
      );
    } catch {
      toast.error('Could not load session.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const data = await chatService.sendMessage(text, sessionId || undefined);
      setSessionId(data.sessionId);

      const aiMsg: ChatMessage = {
        role: 'model',
        content: data.response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to get response.';
      toast.error(errorMsg);
      // Remove the user message if failed
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsTyping(false);
    }
  }, [sessionId]);

  const deleteSession = useCallback(async (id: string) => {
    await chatService.deleteSession(id);
    setSessions((prev) => prev.filter((s) => s._id !== id));
    if (sessionId === id) {
      setSessionId(null);
      setMessages([]);
    }
  }, [sessionId]);

  const newSession = useCallback(() => {
    setSessionId(null);
    setMessages([]);
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  return {
    messages,
    formattedMessages,
    sessions,
    sessionId,
    isLoading,
    isTyping,
    sendMessage,
    loadSession,
    deleteSession,
    newSession,
    loadHistory,
  };
};
