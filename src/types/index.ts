import { Document } from "mongoose";

export interface SubmitFormBody {
  formData: Record<string, any>;
}

export interface IUser extends Document {
  email: string;
  password: string;
  role: "user" | "admin";
  createdAt: Date;
}

export interface IFormSubmission extends Document {
  userId: string;
  formData: Record<string, any>;
  submissionHash: string;
  createdAt: Date;
}

export interface IProduct extends Document {
  name: string;
  description?: string;
  price: number;
  category: string;
  stock?: number;
  imageUrl?: string;
  createdAt: Date;
}

export interface IOrder extends Document {
  userId: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBlogPost extends Document {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  author: string;
  metaTitle?: string;
  metaDescription?: string;
  tags: string[];
  published: boolean;
  publishedAt?: Date;
  createdAt: Date;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: "user" | "admin";
  };
  idempotencyKey?: string;
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
}

export interface ProductSearchQuery extends PaginationQuery {
  q?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
}
