import mongoose from "mongoose";
import { Password } from "../services/password";

interface PouAttrs {
  userId: string;
  name: string;
  feedCapacity: number;
  feedHistory: { food: number; amountFeeded: number; date: number }[];
}

interface PouModel extends mongoose.Model<PouDoc> {
  build(attrs: PouAttrs): PouDoc;
}

export interface PouDoc extends mongoose.Document {
  userId: string;
  name: string;
  feedCapacity: number;
  feedHistory: { food: number; amountFeeded: number; date: number }[];
}

const pouSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    feedCapacity: {
      type: Number,
      required: true,
    },
    feedHistory: {
      type: Array,
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        delete ret.__v;
      },
    },
  }
);

// pouSchema.pre("save", async function (done) {
//   if (this.isModified("password")) {
//     const hashed = await Password.toHash(this.get("password"));
//     this.set("password", hashed);
//   }
//   done();
// });

pouSchema.statics.build = (attrs: PouAttrs) => {
  return new Pou(attrs);
};

const Pou = mongoose.model<PouDoc, PouModel>("Pou", pouSchema);

export { Pou };
