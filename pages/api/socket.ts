import { Server as NetServer } from 'http'
import { NextApiRequest, NextApiResponse } from 'next'
import { Server as SocketIOServer } from 'socket.io'
import { supportEmitter, messageEmitter } from '@/lib/events'

export const config = {
  api: {
    bodyParser: false,
  },
}

const ioHandler = (req: NextApiRequest, res: NextApiResponse & { socket: { server: NetServer & { io?: SocketIOServer } } }) => {
  if (!res.socket.server.io) {
    const httpServer: NetServer = res.socket.server as unknown as NetServer
    const io = new SocketIOServer(httpServer, {
      path: '/api/socket',
      addTrailingSlash: false,
    })
    res.socket.server.io = io

    io.on('connection', (socket) => {
      socket.on('join-ticket', (ticketId: string) => {
        socket.join(`ticket-${ticketId}`)
      })

      socket.on('leave-ticket', (ticketId: string) => {
        socket.leave(`ticket-${ticketId}`)
      })

      socket.on('join-conversation', (userId: string) => {
        socket.join(`user-${userId}`)
      })

      socket.on('leave-conversation', (userId: string) => {
        socket.leave(`user-${userId}`)
      })
    })

    supportEmitter.on('new-reply', ({ ticketId, reply }: { ticketId: string; reply: unknown }) => {
      io.to(`ticket-${ticketId}`).emit('new-reply', { ticketId, reply })
    })

    supportEmitter.on('ticket-updated', ({ ticketId, ticket }: { ticketId: string; ticket: unknown }) => {
      io.to(`ticket-${ticketId}`).emit('ticket-updated', { ticketId, ticket })
    })

    messageEmitter.on('new-message', ({ message }: { message: { senderId: string; receiverId: string } }) => {
      io.to(`user-${message.receiverId}`).emit('new-message', { message })
      io.to(`user-${message.senderId}`).emit('new-message', { message })
    })
  }
  res.end()
}

export default ioHandler
