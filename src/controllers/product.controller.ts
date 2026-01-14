import { Request, Response } from "express";
import { Product } from "../models";
import { ProductSearchQuery } from "../types";
import { redis } from "../config/redis";

export const searchProducts = async (
  req: Request<{}, {}, {}, ProductSearchQuery>,
  res: Response
): Promise<void> => {
  try {
    const {
      q = "",
      page = "1",
      limit = "20",
      category,
      minPrice,
      maxPrice,
      fetchAll = true,
    } = req.query;

    const query: any = {};

    if (q) {
      query.$or = [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }

    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const skip = (Number(page) - 1) * Number(limit);
    if (fetchAll) {
      const CACHE_KEY = "all_products_cache";
      const cachedData = await redis.get(CACHE_KEY);
      if (cachedData) {
        const responseData = JSON.parse(cachedData);
        res.setHeader("Content-Type", "application/json");
        responseData.cached = true;
        res.json(responseData);
      } else {
        const products = await Product.find({})
          .select("name category price _id")
          .lean();

        const responseData = { data: products, total: products.length };

        await redis.set(CACHE_KEY, JSON.stringify(responseData), "EX", 3600);

        res.json(responseData);
      }
    } else {
      const [products, total] = await Promise.all([
        Product.find(query).skip(skip).limit(Number(limit)).lean(),
        Product.countDocuments(query),
      ]);

      res.json({
        data: products,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      });
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getProductById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id).lean();

    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    const shouldSimulateInconsistency = Math.random() > 0.7;

    if (shouldSimulateInconsistency) {
      delete (product as any).imageUrl;
      delete (product as any).description;
    }

    res.json({
      ...product,
      imageUrl: product.imageUrl || null,
      description: product.description || null,
      stock: product.stock ?? 0,
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const createProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
