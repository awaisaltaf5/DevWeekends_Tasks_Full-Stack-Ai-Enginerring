import { type Request, type Response } from 'express';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../middleware/errorHandler';
import { AppError } from '../utils/AppError';
import { Notification } from '../models';

/** Normalize a notification to JSON with `id`. */
function toJson(n: any): any {
  const { _id, ...rest } = n;
  return { ...rest, id: String(_id) };
}

/** GET /api/notifications — the authenticated user's in-app notifications. */
export const myNotifications = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const { user } = req as { user?: { id: string } };
    if (!user?.id) {
      throw new AppError(401, 'Authentication required.');
    }

    const onlyUnread = req.query.unread === 'true';
    const query: Record<string, unknown> = { recipient: user.id };
    if (onlyUnread) query.read = false;

    const page = typeof req.query.page === 'string' ? Number(req.query.page) : 1;
    const rawLimit = typeof req.query.limit === 'string' ? Number(req.query.limit) : 20;
    const limit = Math.min(Math.max(rawLimit, 1), 50);
    const skip = (Math.max(page, 1) - 1) * limit;

    const [total, items, unreadCount] = await Promise.all([
      Notification.countDocuments(query),
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments({ recipient: user.id, read: false }),
    ]);

    return sendSuccess(res, 200, 'Notifications retrieved', {
      notifications: items.map((n) => toJson(n)),
      unreadCount,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  },
);

/** PATCH /api/notifications/read — mark one or all of the user's notifications as read. */
export const markNotificationsRead = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const { user } = req as { user?: { id: string } };
    if (!user?.id) {
      throw new AppError(401, 'Authentication required.');
    }

    const id = typeof req.body?.id === 'string' ? req.body.id : '';
    const all = req.body?.all === true;

    if (all) {
      await Notification.updateMany(
        { recipient: user.id, read: false },
        { $set: { read: true } },
      );
    } else if (id) {
      await Notification.updateOne(
        { _id: id, recipient: user.id },
        { $set: { read: true } },
      );
    } else {
      throw new AppError(400, 'Provide a notification id or set all=true.');
    }

    return sendSuccess(res, 200, 'Notifications marked as read');
  },
);