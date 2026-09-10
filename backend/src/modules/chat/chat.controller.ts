import { Response, NextFunction } from "express";
import { AuthRequest } from "../../common/types/index.js";
import { chatService } from "./chat.service.js";

export const chatController = {
  async createConversation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ status: "error", message: "Not authenticated" });
        return;
      }
      const conversation = await chatService.createConversation(req.user.userId, req.body);
      res.status(201).json({ status: "success", data: conversation });
    } catch (error) {
      next(error);
    }
  },

  async listConversations(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ status: "error", message: "Not authenticated" });
        return;
      }
      const conversations = await chatService.listConversations(req.user.userId);
      res.status(200).json({ status: "success", data: conversations });
    } catch (error) {
      next(error);
    }
  },

  async getConversation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ status: "error", message: "Not authenticated" });
        return;
      }
      const conversation = await chatService.getConversation(req.user.userId, req.params.id as string);
      res.status(200).json({ status: "success", data: conversation });
    } catch (error) {
      next(error);
    }
  },

  async getMessages(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ status: "error", message: "Not authenticated" });
        return;
      }
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const messages = await chatService.getMessages(
        req.user.userId,
        req.params.id as string,
        { limit, page }
      );
      res.status(200).json({ status: "success", data: messages });
    } catch (error) {
      next(error);
    }
  },

  async sendMessage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ status: "error", message: "Not authenticated" });
        return;
      }
      const message = await chatService.sendMessage(
        req.user.userId,
        req.params.id as string,
        req.body
      );
      res.status(201).json({ status: "success", data: message });
    } catch (error) {
      next(error);
    }
  },

  async addMembers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ status: "error", message: "Not authenticated" });
        return;
      }
      const conversation = await chatService.addMembers(
        req.user.userId,
        req.params.id as string,
        req.body.participantIds || []
      );
      res.status(200).json({ status: "success", data: conversation });
    } catch (error) {
      next(error);
    }
  },

  async removeMember(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ status: "error", message: "Not authenticated" });
        return;
      }
      const result = await chatService.removeMember(
        req.user.userId,
        req.params.id as string,
        req.params.userId as string
      );
      res.status(200).json({ status: "success", data: result });
    } catch (error) {
      next(error);
    }
  },

  async leaveGroup(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ status: "error", message: "Not authenticated" });
        return;
      }
      const result = await chatService.leaveGroup(req.user.userId, req.params.id as string);
      res.status(200).json({ status: "success", data: result });
    } catch (error) {
      next(error);
    }
  },

  async markRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ status: "error", message: "Not authenticated" });
        return;
      }
      const result = await chatService.markRead(req.user.userId, req.params.id as string);
      res.status(200).json({ status: "success", data: result });
    } catch (error) {
      next(error);
    }
  },
};