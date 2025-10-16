"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  XCircle,
  MoreHorizontal,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Notification } from "@/types/dashboard";

interface NotificationsPanelProps {
  notifications: Notification[];
}

export function NotificationsPanel({ notifications: initialNotifications }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState(initialNotifications);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "WARNING":
        return AlertTriangle;
      case "ERROR":
        return XCircle;
      case "SUCCESS":
        return CheckCircle;
      case "INFO":
      default:
        return Info;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "WARNING":
        return "text-yellow-600 bg-yellow-50";
      case "ERROR":
        return "text-red-600 bg-red-50";
      case "SUCCESS":
        return "text-green-600 bg-green-50";
      case "INFO":
      default:
        return "text-blue-600 bg-blue-50";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "WARNING":
        return "bg-yellow-100 text-yellow-800";
      case "ERROR":
        return "bg-red-100 text-red-800";
      case "SUCCESS":
        return "bg-green-100 text-green-800";
      case "INFO":
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const dismissNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Bell className="mr-2 h-5 w-5" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          {notifications.length > 0 && (
            <Button variant="ghost" size="sm">
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-sm text-gray-500">No notifications</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {notifications.map((notification) => {
              const IconComponent = getNotificationIcon(notification.type);
              const colorClasses = getNotificationColor(notification.type);
              
              return (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border transition-all ${
                    notification.read ? "bg-gray-50" : "bg-white border-l-4"
                  } ${!notification.read ? colorClasses.split(' ')[1] : ""}`}
                  style={{
                    borderLeftColor: !notification.read ? 
                      notification.type === 'WARNING' ? '#eab308' :
                      notification.type === 'ERROR' ? '#ef4444' :
                      notification.type === 'SUCCESS' ? '#22c55e' : '#3b82f6'
                      : undefined
                  }}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 p-1 rounded-full ${colorClasses}`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <p className={`text-sm font-medium ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}>
                              {notification.title}
                            </p>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getTypeColor(notification.type)}`}
                            >
                              {notification.type}
                            </Badge>
                          </div>
                          <p className={`text-sm mt-1 ${notification.read ? 'text-gray-500' : 'text-gray-700'}`}>
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {formatTimestamp(notification.timestamp)}
                          </p>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {!notification.read && (
                              <DropdownMenuItem onClick={() => markAsRead(notification.id)}>
                                Mark as read
                              </DropdownMenuItem>
                            )}
                            {notification.actionUrl && (
                              <DropdownMenuItem>
                                View details
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={() => dismissNotification(notification.id)}
                              className="text-red-600"
                            >
                              Dismiss
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {notification.actionUrl && !notification.read && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => markAsRead(notification.id)}
                        >
                          Take Action
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}