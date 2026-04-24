'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

export default function LobbyPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [roomName, setRoomName] = useState('');

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomName.trim()) {
      router.push(`/room/${encodeURIComponent(roomName.trim())}`);
    }
  };

  const trendingRooms = ['General', 'Gaming', 'Dev-Talk', 'Memes'];

  return (
    <div className="min-h-screen bg-yellow-50 p-6 font-mono text-black">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex justify-between items-center p-6 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-black">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter text-black">Lobby</h1>
            <p className="font-bold text-black text-black">Welcome, <span className="text-red-600 underline">{user?.username}</span></p>
          </div>
          <button
            onClick={() => {
              logout();
              router.push('/login');
            }}
            className="px-6 py-2 font-bold uppercase border-4 border-black hover:bg-black hover:text-white transition-colors text-black hover:text-white"
          >
            Logout
          </button>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Join/Create Room */}
          <section className="p-8 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6 text-black">
            <h2 className="text-2xl font-black uppercase text-black">Enter the Void</h2>
            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <label className="block text-sm font-bold uppercase mb-2 text-black">Room Name</label>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="e.g. secret-garden"
                  className="w-full px-4 py-3 border-4 border-black focus:outline-none focus:bg-yellow-100 transition-colors font-bold text-black placeholder:text-black/30"
                />
              </div>
              <button
                type="submit"
                className="w-full py-4 text-xl font-black uppercase border-4 border-black bg-black text-white hover:bg-yellow-400 hover:text-black transition-all active:translate-x-1 active:translate-y-1 active:shadow-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
              >
                Join Room
              </button>
            </form>
          </section>

          {/* Trending Rooms */}
          <section className="p-8 bg-green-100 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6 text-black">
            <h2 className="text-2xl font-black uppercase text-black">Active Channels</h2>
            <div className="grid grid-cols-1 gap-4">
              {trendingRooms.map((room) => (
                <button
                  key={room}
                  onClick={() => router.push(`/room/${room.toLowerCase()}`)}
                  className="p-4 bg-white border-4 border-black font-black uppercase text-left hover:translate-x-2 transition-transform relative group overflow-hidden text-black"
                >
                  <span className="relative z-10 text-black">#{room}</span>
                  <div className="absolute inset-0 bg-yellow-400 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
