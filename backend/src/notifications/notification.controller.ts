import type{Request, Response} from "express";

import { notificationQuerySchema } from "./notification.validation.js";
import {
  getMyNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "./notification.service.js";

interface AuthenticateRequest extends Request{
    user?: {
        id?: string;
    };
}
function requireUserId(
  req: AuthenticateRequest,
  res: Response
): string | null {
  const userId = req.user?.id;

    if(!userId){
        res.status(401).json({
            success:false,
            message:"authentication required",
        });
        return null;
    }
    return userId;
}
function getNotificationId(req: Request): string | null {
    const id= req.params.notificationId;

    if(Array.isArray(id)){
        return id[0]|| null;
    }
    return id|| null;
}
function handleError(res:Response, error:unknown):void{
    const message= error instanceof Error? error.message:"";

      const statusMap: Record<string, number> = {
        invalid_user_id:400,
        invalid_notification_id:400,
        notification_not_found:404,

    };
    const statusCode= statusMap[message]??500;

    res.status(statusCode).json({
        success:false,
        message:statusMap[message]!== undefined
        ? message.replace(/_/g, " ")
        :"inetrnal server error",
    });
}
export async function getMyNotificationsController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;

    const query = notificationQuerySchema.safeParse(req.query);

if (!query.success) {
  res.status(400).json({
    success: false,
    message: "Invalid notification query.",
    errors: query.error.flatten(),
  });
  return;
}

const result = await getMyNotifications(userId, query.data);

    res.status(200).json({
      success: true,
      data: result.notifications,
      pagination: result.pagination,
    });
  } catch (error: unknown) {
    handleError(res, error);
  }
}

export async function getUnreadNotificationCountController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;

    const count = await getUnreadNotificationCount(userId);

    res.status(200).json({
      success: true,
      data: { unreadCount: count },
    });
  } catch (error: unknown) {
    handleError(res, error);
  }
}

export async function markNotificationAsReadController(
    req:Request,
    res:Response
):Promise<void>{
    try{
        const userId= requireUserId(req,res);
        if(!userId) return;

        const notificationId= getNotificationId(req);
        if(!notificationId){
            res.status(400).json({
                success:false,
                message:"notification id is required",
            });
            return;
        }
        const notification= await markNotificationAsRead(
            userId,
            notificationId
        );

        res.status(200).json({
            success:true,
            message:"notification marked as read",
            data:notification,
        });
    }catch(error:unknown){
        handleError(res,error);
    }
}
export async function markAllNotificationsAsReadController(
    req:Request,
    res:Response

):Promise<void>{
    try{
        const userId= requireUserId(req,res);

          if(!userId) return;

          const result= await markAllNotificationsAsRead(userId);
        res.status(200).json ({
            
            success:true,
            message:"all notification marked as read",
            data:result,
        });
    }catch(error:unknown){
        handleError(res,error);
    }
}

export async function deleteNotificationController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;

    const notificationId = getNotificationId(req);

    if (!notificationId) {
      res.status(400).json({
        success: false,
        message: "Notification ID is required.",
      });
      return;
    }

    await deleteNotification(userId, notificationId);

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully.",
    });
  } catch (error: unknown) {
    handleError(res, error);
  }
}
