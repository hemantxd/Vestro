import { Response, NextFunction } from "express";
import { AuthRequest } from "../../common/types/index.js";
import { postService } from "./post.service.js";

export const postController = {
  async createPost(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ status: "error", message: "Not authenticated" });
        return;
      }

      const { text, currency } = req.body;

      // Accept an array of tickers (JSON / multiple multipart fields) or a
      // single comma/space separated string. Symbols like "$" are stripped
      // later in the service — tickers never include a currency.
      let tickers: string[] = [];
      if (req.body.tickers !== undefined) {
        const raw = Array.isArray(req.body.tickers)
          ? req.body.tickers
          : [String(req.body.tickers)];
        tickers = raw.flatMap((t: unknown) => String(t).split(/[,; ]+/)).filter(Boolean);
      }

      let mediaUrls: { url: string; type: "image" | "video" }[] | undefined;
      const files = (req as any).files as Express.Multer.File[] | undefined;

      if (files && files.length > 0) {
        mediaUrls = files.map((file: any) => ({
          url: file.path,
          type: file.mimetype.startsWith("video/") ? "video" : "image",
        }));
      }

      const post = await postService.createPost(req.user.userId, { text, tickers, currency }, mediaUrls);
      res.status(201).json({ status: "success", data: post });
    } catch (error) {
      next(error);
    }
  },

  async getPostById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { postId } = req.params;
      const post = await postService.getPostById(postId as string, req.user?.userId);
      res.status(200).json({ status: "success", data: post });
    } catch (error) {
      next(error);
    }
  },

  async getFeed(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ status: "error", message: "Not authenticated" });
        return;
      }

      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;

      const feed = await postService.getFeed(req.user.userId, { limit, page });
      res.status(200).json({ status: "success", data: feed });
    } catch (error) {
      next(error);
    }
  },

  async getUserPosts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;

      const posts = await postService.getUserPosts(userId as string, req.user?.userId, { limit: limit as any, page: page as any });
      res.status(200).json({ status: "success", data: posts });
    } catch (error) {
      next(error);
    }
  },

  async getPostsByTicker(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { ticker } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;

      const posts = await postService.getPostsByTicker(ticker as string, req.user?.userId, { limit: limit as any, page: page as any });
      res.status(200).json({ status: "success", data: posts });
    } catch (error) {
      next(error);
    }
  },

  async deletePost(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ status: "error", message: "Not authenticated" });
        return;
      }

      const { postId } = req.params;
      await postService.deletePost(postId as string, req.user.userId);
      res.status(200).json({ status: "success", message: "Post deleted" });
    } catch (error) {
      next(error);
    }
  },
};