import { Response, Request, NextFunction } from "express";

import { FormSubmission } from "../models";

export const idempotencyCheck = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const idempotencyKey = req.headers["idempotency-key"] as string;

  if (!idempotencyKey) {
    res.status(400).json({ error: "Idempotency-Key header required" });
    return;
  }

  try {
    const existing = await FormSubmission.findOne({
      submissionHash: idempotencyKey,
    });

    if (existing) {
      res.status(200).json({
        message: "Duplicate submission prevented",
        data: existing,
        duplicate: true,
      });
      return;
    }

    req.idempotencyKey = idempotencyKey;
    next();
  } catch (error) {
    next(error);
  }
};
