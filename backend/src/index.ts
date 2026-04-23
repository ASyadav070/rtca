import { Server } from 'socket.io';

export default {
  async bootstrap({ strapi }: { strapi: any }) {
    // Set permissions for Message API
    try {
      const roles = await strapi.query('plugin::users-permissions.role').findMany({
        where: { type: ['authenticated', 'public'] },
      });

      for (const role of roles) {
        const permissions = [
          { action: 'api::message.message.find', role: role.id },
          { action: 'api::message.message.create', role: role.id },
        ];

        for (const permission of permissions) {
          const existing = await strapi.query('plugin::users-permissions.permission').findOne({
            where: { action: permission.action, role: role.id },
          });

          if (!existing) {
            await strapi.query('plugin::users-permissions.permission').create({ data: permission });
          }
        }
      }
      console.log('Strapi permissions for Message API set successfully.');
    } catch (error) {
      console.error('Error setting Strapi permissions:', error);
    }

    const io = new Server(strapi.server.httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    strapi.io = io;

    // Room name -> Set of usernames
    const roomUsers = new Map<string, Set<string>>();
    // Socket ID -> { room, username }
    const socketData = new Map<string, { room: string; username: string }>();

    const emitUserList = (room: string) => {
      const users = Array.from(roomUsers.get(room) || []);
      io.to(room).emit('user-list', users);
    };

    io.on('connection', (socket) => {
      console.log('A user connected:', socket.id);

      socket.on('join-room', ({ room, username }) => {
        socket.join(room);
        
        // Add to tracking
        if (!roomUsers.has(room)) {
          roomUsers.set(room, new Set());
        }
        roomUsers.get(room)?.add(username);
        socketData.set(socket.id, { room, username });

        console.log(`User ${username} joined room: ${room}`);
        emitUserList(room);
      });

      socket.on('leave-room', ({ room, username }) => {
        socket.leave(room);
        
        roomUsers.get(room)?.delete(username);
        socketData.delete(socket.id);

        console.log(`User ${username} left room: ${room}`);
        emitUserList(room);
      });

      socket.on('send-message', async (data) => {
        // Persist to Strapi
        try {
          const user = await strapi.db.query('plugin::users-permissions.user').findOne({
            where: { username: data.username },
          });

          await strapi.entityService.create('api::message.message', {
            data: {
              text: data.text,
              room: data.room,
              sender: user?.id,
              publishedAt: new Date(),
            },
          });
        } catch (error) {
          console.error('Error persisting message:', error);
        }

        io.to(data.room).emit('new-message', data);
      });

      socket.on('disconnect', () => {
        const data = socketData.get(socket.id);
        if (data) {
          const { room, username } = data;
          roomUsers.get(room)?.delete(username);
          socketData.delete(socket.id);
          emitUserList(room);
        }
        console.log('A user disconnected');
      });
    });
  },
};
