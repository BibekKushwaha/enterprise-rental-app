"use client";

import React, { useRef, useState } from "react";
import { Bell, Check, CheckCheck, ExternalLink, Inbox } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
  useGetAuthUserQuery,
  useGetNotificationsQuery,
  useMarkAllReadMutation,
  useMarkNotificationReadMutation,
} from "@/state/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NotificationBell = () => {
  const router = useRouter();
  const { data: authUser } = useGetAuthUserQuery();
  const [isOpen, setIsOpen] = useState(false);

  const userId = authUser?.cognitoInfo?.userId;
  const userType = authUser?.userRole;

  const { data: notifications = [] } = useGetNotificationsQuery(
    { userId, userType },
    { skip: !userId || !userType, pollingInterval: 30000 } // poll every 30s
  );

  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead] = useMarkAllReadMutation();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleNotificationClick = async (notification: AppNotification) => {
    if (!notification.isRead) {
      await markRead(notification.id);
    }
    setIsOpen(false);
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const handleMarkAllRead = async () => {
    if (!userId || !userType) return;
    await markAllRead({ userId, userType });
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          id="notification-bell-trigger"
          className="relative focus:outline-none group"
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
        >
          <Bell className="h-5 w-5 text-primary-200 group-hover:text-white transition-colors duration-200" />
          {unreadCount > 0 && (
            <span
              className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-secondary-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-lg animate-pulse"
              aria-hidden="true"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={12}
        className="w-[380px] p-0 shadow-2xl border border-gray-100 rounded-2xl overflow-hidden bg-white"
        style={{ maxHeight: "520px" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-primary-700 to-primary-600">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-white" />
            <h3 className="text-sm font-semibold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <span className="bg-secondary-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 text-xs text-primary-200 hover:text-white transition-colors duration-200 font-medium"
              id="mark-all-read-btn"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </button>
          )}
        </div>

        {/* Notification List */}
        <div className="overflow-y-auto" style={{ maxHeight: "420px" }}>
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                <Inbox className="h-7 w-7 text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-500">All caught up!</p>
              <p className="text-xs text-gray-400 mt-1">No notifications yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  id={`notification-item-${notification.id}`}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full text-left px-5 py-4 hover:bg-gray-50 transition-all duration-150 flex items-start gap-3 group ${
                    !notification.isRead ? "bg-blue-50/50" : ""
                  }`}
                >
                  {/* Unread dot */}
                  <div className="flex-shrink-0 mt-1.5">
                    {notification.isRead ? (
                      <div className="w-2 h-2 rounded-full bg-gray-200" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-primary-600 shadow-sm shadow-primary-400" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={`text-sm leading-snug ${
                          notification.isRead
                            ? "text-gray-600 font-normal"
                            : "text-gray-900 font-semibold"
                        }`}
                      >
                        {notification.title}
                      </p>
                      {notification.link && (
                        <ExternalLink className="h-3.5 w-3.5 text-gray-300 group-hover:text-primary-400 flex-shrink-0 mt-0.5 transition-colors" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-1.5">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>

                  {/* Mark as read checkmark */}
                  {!notification.isRead && (
                    <div
                      role="button"
                      tabIndex={0}
                      aria-label="Mark as read"
                      onClick={(e) => {
                        e.stopPropagation();
                        markRead(notification.id);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.stopPropagation();
                          markRead(notification.id);
                        }
                      }}
                      className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-primary-100"
                      id={`mark-read-${notification.id}`}
                    >
                      <Check className="h-3 w-3 text-primary-600" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-3 bg-gray-50">
            <button
              onClick={() => {
                setIsOpen(false);
                router.push(
                  userType === "manager"
                    ? "/managers/applications"
                    : "/tenants/applications"
                );
              }}
              className="text-xs text-primary-600 hover:text-primary-800 font-medium transition-colors"
              id="view-all-notifications-btn"
            >
              View all applications →
            </button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;
