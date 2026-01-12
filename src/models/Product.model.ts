import { Schema, model } from 'mongoose';
import { IProduct } from '../types';

const productSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  category: String,
  stock: Number,
  imageUrl: String,
  createdAt: { type: Date, default: Date.now }
});

export const Product = model<IProduct>('Product', productSchema);