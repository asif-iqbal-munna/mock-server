import { Schema, model } from 'mongoose';
import { IFormSubmission } from '../types';

const formSubmissionSchema = new Schema<IFormSubmission>({
  userId: { type: String, required: true },
  formData: { type: Schema.Types.Mixed, required: true },
  submissionHash: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

export const FormSubmission = model<IFormSubmission>('FormSubmission', formSubmissionSchema);