
import { Types, type ClientSession } from "mongoose";
import { Notification } from "./notification.model.js";
import type {
  CreateNotificationInput,
  NotificationQueryInput,
} from "./notification.validation.js";


function getObjectId(id: string, errorMessage: string): Types.ObjectId {
  if (!Types.ObjectId.isValid(id)){

    throw new Error(errorMessage);

  }
  return new Types.ObjectId(id);
}


export async function createNotification(
  input: CreateNotificationInput,
  session?: ClientSession
) {
  const notificationData = {
    ...input,
    userId: getObjectId(input.userId, "invalid_user_id"),
    relatedBooking: input.relatedBooking
      ? getObjectId(input.relatedBooking, "invalid_booking_id")
      : undefined,
    relatedFlight: input.relatedFlight
      ? getObjectId(input.relatedFlight, "invalid_flight_id")
      : undefined,
  };

  if (session) {
    const [notification] = await Notification.create(
      [notificationData],
      { session }
    );
    return notification;
  }

  return Notification.create(notificationData);
}


export async function getMyNotifications (

  userId: string,
  query: NotificationQueryInput

){
  const userObjectId = getObjectId(userId, "invalid_user_id");
  const {page,limit,isRead,type } =query;

  const filter: Record<string, unknown> = {
    userId: userObjectId,
  };

  if (isRead !==undefined) {
    filter.isRead =isRead;
  }

  if (type)  {

    filter.type = type;

  }

  const skip = (page - 1) *limit;
  const [notifications, total] = await Promise.all([
    Notification.find(filter)
        .select("-__v")
       .sort({ createdAt: -1 })
      .skip(skip)

        .limit(limit)
      .lean(),
    Notification.countDocuments(filter),
  ]);

  return {

    notifications,
    pagination:{
      total,
      page,
      limit,
       totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    },
  };
}

export async function getUnreadNotificationCount(userId: string) {
  const userObjectId = getObjectId(userId, "invalid_user_id");

  return Notification.countDocuments({
    userId: userObjectId,
    isRead: false,
  });
}

export async function markNotificationAsRead(
  userId: string,
  notificationId: string
) {
  const userObjectId = getObjectId(userId, "invalid_user_id");
  const notificationObjectId = getObjectId(
    notificationId,
    "invalid_notification_id"
  );

  const updatedNotification = await Notification.findOneAndUpdate(
    {
      _id: notificationObjectId,
      userId: userObjectId,
      isRead: false,
    },
    {
      $set: {
        isRead: true,
        readAt: new Date(),
      },
    },
    {
      new: true,
      runValidators: true,
    }
  ).select("-__v");

  if (updatedNotification) {
    return updatedNotification;
  }

  const existingNotification = await Notification.findOne({
    _id: notificationObjectId,
    userId: userObjectId,
  }).select("-__v");

  if (!existingNotification) {
    throw new Error("notification_not_found");
  }

  return existingNotification;
}

export async function markAllNotificationsAsRead(userId: string) {
  const userObjectId = getObjectId(userId, "invalid_user_id");

  const result = await Notification.updateMany(
    {
      userId: userObjectId,
      isRead: false,
    },
    {
      $set: {
        isRead: true,
        readAt: new Date(),
      },
    },
    {
      runValidators: true,
    }
  );

  return {
    modifiedCount: result.modifiedCount,
  };
}

export async function deleteNotification(
  userId: string,
  notificationId: string
) {
  const userObjectId = getObjectId(userId, "invalid_user_id");
  const notificationObjectId = getObjectId(
    notificationId,
    "invalid_notification_id"
  );

  const notification = await Notification.findOneAndDelete({
    _id: notificationObjectId,
    userId: userObjectId,
  });

  if (!notification) {
    throw new Error("notification_not_found");
  }
  return notification;
}
