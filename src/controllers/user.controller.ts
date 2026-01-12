import { RequestHandler } from "express";

import { User } from "../models";

export const getAllUsers: RequestHandler = async (req, res) => {
  try {
    const { q = "", page = "1", limit = "20" } = req.query;

    const query: any = {};
    const skip = (Number(page) - 1) * Number(limit);

    if (q) {
      query.$or = [{ email: { $regex: q, $options: "i" } }];
    }

    const [users, total] = await Promise.all([
      User.find(query).skip(skip).limit(Number(limit)).lean(),
      User.countDocuments(query),
    ]);

    res.json({
      data: users,
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
