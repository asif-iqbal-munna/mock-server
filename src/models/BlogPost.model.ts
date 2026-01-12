import { Schema, model } from 'mongoose';
import { IBlogPost } from '../types';

const blogPostSchema = new Schema<IBlogPost>({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  excerpt: String,
  author: { type: String, required: true },
  metaTitle: String,
  metaDescription: String,
  tags: [String],
  published: { type: Boolean, default: false },
  publishedAt: Date,
  createdAt: { type: Date, default: Date.now }
});

export const BlogPost = model<IBlogPost>('BlogPost', blogPostSchema);