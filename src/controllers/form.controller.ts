import { Request, Response } from "express";
import { FormSubmission } from "../models";
import { SubmitFormBody } from "../types";

export const submitForm = async (
  req: Request<{}, {}, SubmitFormBody>,
  res: Response
): Promise<void> => {
  try {
    const submission = new FormSubmission({
      userId: req.user?.id,
      formData: req.body.formData,
      submissionHash: req.idempotencyKey,
    });

    await submission.save();

    res.status(201).json({
      message: "Form submitted successfully",
      data: submission,
      duplicate: false,
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
