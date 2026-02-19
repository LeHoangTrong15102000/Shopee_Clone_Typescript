import { useState, useCallback, useEffect } from 'react'
import useSocket from './useSocket'
import { SocketEvent, NotificationPayload } from 'src/types/socket.types'
import { toast } from 'react-toastify'

const useNotifications = () => {
  const { socket, isConnected } = useSocket()
  const [notifications, setNotifications] = useState<NotificationPayload[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!socket) return

    const handleNotification = (data: NotificationPayload) => {
      setNotifications((prev) => [data, ...prev])
      setUnreadCount((prev) => prev + 1)
      toast.info(data.title, { autoClose: 3000 })
    }

    socket.on(SocketEvent.NOTIFICATION, handleNotification)

    return () => {
      socket.off(SocketEvent.NOTIFICATION, handleNotification)
    }
  }, [socket])

  const markAsRead = useCallback(
    (notificationId: string) => {
      if (!socket || !isConnected) return
      socket.emit(SocketEvent.NOTIFICATION_READ, { notification_id: notificationId })
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId))
      setUnreadCount((prev) => Math.max(0, prev - 1))
    },
    [socket, isConnected]
  )

  const clearAll = useCallback(() => {
    setNotifications([])
    setUnreadCount(0)
  }, [])

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    clearAll
  }
}

export default useNotifications

