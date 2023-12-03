import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenvconfig from "../config/dotenvconfig";
import { IStaffSchema, IStaffModel } from "../types/staff/staff_model_type";
import { IStaffMethods } from "../types/user_and_staff/document_methods_type";
import { IStaffDocument } from "./../types/staff/staff_document_type";

const staff_schema = new mongoose.Schema<
  IStaffSchema,
  IStaffModel,
  IStaffMethods
>(
  {
    name: {
      type: String,
      required: [true, "Name is required!"],
      trim: true,
      minlength: 6,
      maxlength: 30,
    },

    email: {
      type: String,
      required: [true, "E-mail is required!"],
      trim: true,
      unique: true,
      lowercase: true,
      validate: {
        validator: function (v: string) {
          return /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/.test(
            v
          );
        },
        message: ({ value }: { value: string }) => `Invalid email: ${value}`,
      },
    },

    password: {
      type: String,
      required: [true, "Password is required!"],
      trim: true,
      minlength: 8,
    },

    gender: {
      type: String,
      enum: ["man", "woman", "custom"],
      default: "custom",
    },

    phone: {
      type: String,
      default: "",
    },

    image: {
      type: {
        isChangedSelf: {
          type: Boolean,
        },

        key: {
          type: String,
          trim: true,
        },

        url: {
          type: String,
          trim: true,
        },
      },

      default: {
        isChangedSelf: false,
        key: "profile_avatar.png",
        url: `${dotenvconfig.AMAZON_S3_CLOUDFRONT_DOMAIN_NAME}/profile_avatar.png`,
      },
    },

    role: {
      type: String,
      enum: ["admin", "editor", "guest"],
      default: "guest",
    },

    country: {
      type: String,
      default: "",
    },

    city: {
      type: String,
      default: "",
    },

    house_number_or_name: {
      type: String,
      default: "",
    },

    post_code: {
      type: Number,
      default: 1111,
    },
  },
  {
    timestamps: true,
  }
);

staff_schema.methods.validatePassword = async function ({ password }) {
  return await bcrypt.compare(password, this.password);
};

staff_schema.methods.createAuthToken = async ({
  payload,
  secretKey,
  expiresIn,
}) => {
  return jwt.sign(payload, secretKey, { expiresIn });
};

staff_schema.pre<IStaffDocument>("save", async function () {
  if (!this.password || !this.isModified("password")) {
    return;
  } else {
    const salt = await bcrypt.genSalt(14);
    this.password = await bcrypt.hash(this.password, salt);
  }
});

staff_schema.index({ email: 1 });

export const Staff: IStaffModel = mongoose.model<IStaffSchema, IStaffModel>(
  "Staff",
  staff_schema
);
