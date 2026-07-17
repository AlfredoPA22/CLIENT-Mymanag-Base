import { useMutation, useQuery } from "@apollo/client";
import { OverlayPanel } from "primereact/overlaypanel";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiBell, FiCheckCircle } from "react-icons/fi";
import {
  COUNT_UNREAD_NOTIFICATIONS,
  LIST_NOTIFICATIONS,
} from "../../graphql/queries/Notification";
import {
  MARK_ALL_NOTIFICATIONS_READ,
  MARK_NOTIFICATION_READ,
} from "../../graphql/mutations/Notification";
import { INotification } from "../../utils/interfaces/Notification";

const POLL_INTERVAL_MS = 45000;

interface NotificationBellProps {
  buttonClassName?: string;
}

const NotificationBell = ({ buttonClassName }: NotificationBellProps) => {
  const panelRef = useRef<OverlayPanel>(null);
  const navigate = useNavigate();

  const { data: countData } = useQuery<{ countUnreadNotifications: number }>(
    COUNT_UNREAD_NOTIFICATIONS,
    { pollInterval: POLL_INTERVAL_MS, fetchPolicy: "network-only" }
  );

  const { data: listData, refetch } = useQuery<{ listNotifications: INotification[] }>(
    LIST_NOTIFICATIONS,
    { fetchPolicy: "network-only" }
  );

  const [markRead] = useMutation(MARK_NOTIFICATION_READ, {
    refetchQueries: [{ query: COUNT_UNREAD_NOTIFICATIONS }],
  });
  const [markAllRead] = useMutation(MARK_ALL_NOTIFICATIONS_READ, {
    refetchQueries: [{ query: COUNT_UNREAD_NOTIFICATIONS }, { query: LIST_NOTIFICATIONS }],
  });

  const unreadCount = countData?.countUnreadNotifications ?? 0;
  const notifications = listData?.listNotifications ?? [];

  const handleOpen = (e: React.SyntheticEvent) => {
    refetch();
    panelRef.current?.toggle(e);
  };

  const handleClickNotification = async (notification: INotification) => {
    if (!notification.read) {
      await markRead({ variables: { notificationId: notification._id } });
    }
    panelRef.current?.hide();
    if (notification.link) {
      navigate(notification.link);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        aria-label="Notificaciones"
        className={
          buttonClassName ??
          "relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100 text-gray-600"
        }
      >
        <FiBell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <OverlayPanel ref={panelRef} className="w-80 max-w-[90vw]">
        <div className="flex items-center justify-between mb-2">
          <p className="font-semibold text-gray-800 text-sm">Notificaciones</p>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => markAllRead()}
              className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
            >
              <FiCheckCircle size={12} /> Marcar todas leídas
            </button>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
          {notifications.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-6">
              No tienes notificaciones.
            </p>
          ) : (
            notifications.map((notification) => (
              <button
                key={notification._id}
                type="button"
                onClick={() => handleClickNotification(notification)}
                className={`w-full text-left py-2.5 px-1 hover:bg-gray-50 transition-colors ${
                  notification.read ? "" : "bg-blue-50/60"
                }`}
              >
                <div className="flex items-start gap-2">
                  {!notification.read && (
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-800">{notification.title}</p>
                    <p className="text-xs text-gray-500 line-clamp-2">{notification.message}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {new Date(notification.createdAt).toLocaleString("es-ES", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </OverlayPanel>
    </>
  );
};

export default NotificationBell;
