import { Request, Response } from "express";
import { BlogPost } from "../models";
import { PaginationQuery } from "../types";

export const getAllPosts = async (
  req: Request<{}, {}, {}, PaginationQuery>,
  res: Response
): Promise<void> => {
  try {
    const { page = "1", limit = "10" } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [posts, total] = await Promise.all([
      BlogPost.find({ published: true })
        .select("title slug excerpt author tags publishedAt")
        .populate("author", "email")
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      BlogPost.countDocuments({ published: true }),
    ]);

    res.json({
      posts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getPostBySlug = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const post = await BlogPost.findOne({
      slug: req.params.slug,
      published: true,
    })
      .populate("author", "email")
      .lean();

    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
