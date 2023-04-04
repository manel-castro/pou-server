import mongoose from "mongoose";
import { historicInterface } from "../routes/src/pou/updates";

interface PouAttrs {
  userId: string;
  name: string;
  foodCapacity: historicInterface[];
  food: historicInterface[];
}

interface PouModel extends mongoose.Model<PouDoc> {
  build(attrs: PouAttrs): PouDoc;
}

export interface PouDoc extends mongoose.Document {
  userId: string;
  name: string;
  foodCapacity: historicInterface[];
  food: historicInterface[];
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
    foodCapacity: {
      type: Array,
      required: true,
    },
    food: {
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
