'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Message } from '@/types';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';

/**
 * useSocket Hook
 * 
 * Manages the Socket.io lifecycle including connection, reconnection,
 * room joining, message broadcasting, and active user tracking.
 * 
 * @param roomName - The name of the room to join
 * @param username - The username of the current participant
 */
export function useSocket(roomName?: string, username?: string) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const [isBotTyping, setIsBotTyping] = useState(false);

  useEffect(() => {
    if (!roomName || !username) return;

    // Initialize socket
    const socket = io(SOCKET_URL, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      setIsReconnecting(false);
      console.log('Connected to socket server');
      socket.emit('join-room', { room: roomName, username });
    });

    socket.on('reconnect_attempt', () => {
      setIsReconnecting(true);
    });

    socket.on('reconnect', () => {
      setIsReconnecting(false);
    });

    socket.on('new-message', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on('user-list', (users) => {
      setActiveUsers(users);
    });

    socket.on('bot-typing', (isTyping) => {
      setIsBotTyping(isTyping);
    });

    socket.on('disconnect', (reason) => {
      setIsConnected(false);
      if (reason === 'io server disconnect' || reason === 'transport close') {
        setIsReconnecting(true);
      }
    });

    return () => {
      socket.emit('leave-room', { room: roomName, username });
      socket.disconnect();
    };
  }, [roomName, username]);

  const sendMessage = (text: string) => {
    if (socketRef.current && isConnected && roomName && username) {
      const messageData = {
        room: roomName,
        username,
        text,
        timestamp: new Date().toISOString(),
      };
      socketRef.current.emit('send-message', messageData);
    }
  };

  return { isConnected, isReconnecting, messages, activeUsers, isBotTyping, sendMessage, setMessages };
}
