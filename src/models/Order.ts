import mongoose from "mongoose";
import { IOrderSchema, IOrderModel } from "../types/order/order_model_type";

const order_schema = new mongoose.Schema<IOrderSchema, IOrderModel>(
  {
    user_id: {
      type: String,
      required: [true, "User id is required!"],
      trim: true,
    },

    products: {
      type: [
        {
          order_id: {
            type: String,
            required: [true, "Order id is required!"],
          },

          ordered_at: {
            type: Date,
            default: Date.now,
          },

          product_id: {
            type: String,
            required: [true, "Product id is required!"],
            trim: true,
          },

          product_uid: {
            type: String,
            required: [true, "Product unique id is required!"],
            trim: true,
          },

          name: {
            type: String,
            required: [true, "Product name is required!"],
            trim: true,
          },

          slug: {
            type: String,
            required: [true, "Product slug is required!"],
            trim: true,
          },

          image: {
            type: {
              key: {
                type: String,
                required: true,
                trim: true,
              },

              url: {
                type: String,
                required: true,
                trim: true,
              },
            },
            required: [true, "Product image is required!"],
          },

          description: {
            type: String,
            required: true,
            trim: [true, "Product description is required!"],
          },

          price: {
            type: Number,
            required: [true, "Product price is required!"],
          },

          quantity: {
            type: Number,
            required: [true, "Product quantity is required!"],
          },

          color: {
            type: String,
            required: [true, "Product color is required!"],
            trim: true,
          },

          size: {
            type: String,
            enum: ["S", "M", "L", "XL"],
            trim: [true, "Product size is required!"],
          },

          brand: {
            type: String,
            required: [true, "Product brand is required!"],
            trim: true,
          },

          category: {
            type: String,
            required: [true, "Product category is required!"],
            enum: ["men", "women", "boy", "girl", "sports"],
            trim: true,
          },

          product_type: {
            type: String,
            required: [true, "Product type is required!"],
            trim: true,
          },

          gender: {
            type: String,
            required: [true, "Gender is required!"],
            enum: ["man", "woman", "unisex"],
            trim: true,
          },
        },
      ],
      required: [true, "Products is required!"],
    },

    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "completed"],
      default: "pending",
    },

    total_cost: {
      type: Number,
      required: [true, "Total cost is required!"],
    },

    payment_intent: {
      type: String,
      required: [true, "Payment intent is required!"],
      trim: true,
    },

    client_secret: {
      type: String,
      required: [true, "Client secret is required!"],
      trim: true,
    },

    shipping_address: {
      type: {
        country: {
          type: String,
          required: [true, "Country is required!"],
          trim: true,
        },

        city: {
          type: String,
          required: [true, "City is required!"],
          trim: true,
        },

        house_number_or_name: {
          type: String,
          required: [true, "House number or name is required!"],
          trim: true,
        },

        phone: {
          type: String,
          required: [true, "Phone number is required!"],
          trim: true,
        },

        post_code: {
          type: Number,
          required: [true, "Postal code is required!"],
        },
      },
      required: [true, "Shipping address is required!"],
    },
  },
  { timestamps: true }
);

order_schema.index({ user_id: 1, status: 1 });

export const Order: IOrderModel = mongoose.model<IOrderSchema, IOrderModel>(
  "Order",
  order_schema
);
