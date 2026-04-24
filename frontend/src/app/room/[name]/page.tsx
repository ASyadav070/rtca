'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useSocket } from '@/hooks/useSocket';
import { cn } from '@/lib/utils';
import { messagesApi } from '@/lib/apiClient';

import { Message, StrapiMessage } from '@/types';

/**
 * RoomPage Component
 *
 * Handles the real-time chat interface for a specific room.
 * Includes chat history, real-time messaging, and active user presence.
 */
export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomName = params.name as string;
  const { user } = useAuthStore();
  const [inputText, setInputText] = useState('');
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [showMobileUsers, setShowMobileUsers] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const {
    isConnected,
    isReconnecting,
    messages,
    activeUsers,
    isBotTyping,
    sendMessage,
    setMessages,
  } = useSocket(roomName, user?.username || 'Anonymous');

  // Fetch History on Mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
      
        const response = await messagesApi.getByRoom(roomName);
        const history = response.data
          .map((item: any) => {
            const attributes = item.attributes;
            
            const senderData = attributes.sender?.data;
            const senderAttrs = senderData?.attributes || attributes.sender;
            
            let username = senderAttrs?.username;
            
            // If sender is explicitly null (our bot persistence logic)
            if (!senderData && !attributes.sender) {
              username = 'SYSTEM_BOT';
            }

            return {
              username: username || 'Anonymous',
              text: attributes.text,
              timestamp: attributes.createdAt,
              room: attributes.room,
            } as Message;
          })
          .reverse();

        setMessages(history);
        setHistoryLoaded(true);
      } catch (error) {
        console.error('Failed to fetch history:', error);
        setHistoryLoaded(true);
      }
    };

    fetchHistory();
  }, [roomName, setMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, historyLoaded]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      sendMessage(inputText.trim());
      setInputText('');
    }
  };

  return (
    <div className="flex h-screen bg-blue-50 font-mono overflow-hidden text-black">
      {/* Sidebar - Active Users */}
      <aside
        className={cn(
          'bg-white border-r-4 border-black p-6 flex flex-col gap-6 z-40 transition-all duration-300',
          'fixed inset-y-0 left-0 w-64 translate-x-[-100%] lg:relative lg:translate-x-0',
          showMobileUsers &&
            'translate-x-0 shadow-[8px_0px_0px_0px_rgba(0,0,0,1)]',
        )}
      >
        <div className="flex justify-between items-center border-b-4 border-black pb-2">
          <h2 className="text-2xl font-black uppercase tracking-tighter text-black">
            Active Users
          </h2>
          <button
            onClick={() => setShowMobileUsers(false)}
            className="lg:hidden font-black text-xl"
          >
            ×
          </button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-3">
          {activeUsers.map((username) => (
            <div
              key={username}
              className="flex items-center gap-3 p-3 bg-yellow-50 border-2 border-black font-bold uppercase text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:-translate-y-1 transition-transform text-black"
            >
              <div className="w-3 h-3 bg-green-500 border-2 border-black rounded-full" />
              {username}
            </div>
          ))}
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative h-full">
        {/* Reconnecting Overlay */}
        {isReconnecting && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="bg-red-500 border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center animate-bounce">
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
                Connection Lost
              </h2>
              <p className="text-white font-bold mt-2 uppercase">
                Reconnecting to the void...
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <header className="p-4 bg-white border-b-4 border-black flex justify-between items-center z-10 transition-colors">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/lobby')}
              className="p-2 border-4 border-black hover:bg-black hover:text-white transition-colors font-black uppercase text-black overflow-hidden relative group"
            >
              <span className="relative z-10">← Back</span>
              <div className="absolute inset-0 bg-black translate-y-full group-hover:translate-y-0 transition-transform" />
            </button>
            <div>
              <h1 className="text-2xl font-black uppercase text-black">
                #{roomName}
              </h1>
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'w-3 h-3 rounded-full border-2 border-black',
                    isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500',
                  )}
                />
                <span className="text-xs font-bold uppercase text-black">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMobileUsers(true)}
              className="lg:hidden p-2 border-4 border-black font-black bg-yellow-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              {activeUsers.length} MEMBERS
            </button>
            <div className="hidden lg:block px-3 py-1 bg-yellow-300 border-2 border-black font-black uppercase text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black">
              {activeUsers.length} ACTIVE
            </div>
          </div>
        </header>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px] bg-blue-50/50"
        >
          {!historyLoaded ? (
            <div className="flex items-center justify-center h-full">
              <div className="p-4 bg-white border-4 border-black font-black uppercase animate-pulse text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                Fetching History...
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full opacity-50 text-center">
              <p className="text-xl font-black uppercase text-black">
                The void is silent...
              </p>
              <p className="font-bold uppercase text-black">
                Be the first to speak.
              </p>
            </div>
          ) : (
            messages.map((msg: Message, i) => {
              const isMe = msg.username === user?.username;
              return (
                <div
                  key={i}
                  className={cn(
                    'flex flex-col max-w-[85%] sm:max-w-[80%] space-y-1',
                    isMe ? 'ml-auto items-end' : 'mr-auto items-start',
                  )}
                >
                  <span className="text-xs font-black uppercase px-2 text-black opacity-70 tracking-tighter">
                    {msg.username}
                  </span>
                  <div
                    className={cn(
                      'p-3 sm:p-4 border-4 border-black text-base sm:text-lg font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all text-black break-words',
                      msg.username === 'SYSTEM_BOT' ? 'bg-zinc-900 text-white border-zinc-500' : 
                      isMe ? 'bg-yellow-100' : 'bg-green-100',
                    )}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] font-bold opacity-40 px-2 uppercase text-black">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              );
            })
          )}

          {/* Bot Thinking Indicator */}
          {isBotTyping && (
            <div className="flex flex-col items-start space-y-1 animate-pulse">
              <span className="text-xs font-black uppercase px-2 text-black opacity-70 tracking-tighter">
                SYSTEM_BOT
              </span>
              <div className="p-3 sm:p-4 border-4 border-black bg-zinc-900 text-white font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="ml-2 uppercase text-xs tracking-widest">Thinking...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <footer className="p-4 bg-white border-t-4 border-black sticky bottom-0">
          <form
            onSubmit={handleSend}
            className="max-w-4xl mx-auto flex gap-2 sm:gap-4"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Spit your bars here..."
              className="flex-1 px-4 py-3 border-4 border-black focus:outline-none focus:ring-0 focus:bg-yellow-50 font-bold text-base sm:text-lg text-black placeholder:text-black/30"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || !isConnected}
              className="px-4 sm:px-8 py-3 bg-black text-white border-4 border-black font-black uppercase hover:bg-yellow-400 hover:text-black transition-all active:translate-x-1 active:translate-y-1 active:shadow-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
}
