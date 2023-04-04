import mongoose from "mongoose";
import { historicInterface } from "../routes/pou/src/updates";

interface FoodInventoryInterface {
  name: string;
  feedCapacity: number;
}

interface InventoryAttrs {
  userId: string;
  coins: number;
  foodInventory: FoodInventoryInterface[];
}

interface InventoryModel extends mongoose.Model<InventoryDoc> {
  build(attrs: InventoryAttrs): InventoryDoc;
}

export interface InventoryDoc extends mongoose.Document {
  userId: string;
  coins: number;
  foodInventory: FoodInventoryInterface[];
}

const inventorySchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    coins: {
      type: Number,
      required: true,
    },
    foodInventory: {
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

// InventorySchema.pre("save", async function (done) {
//   if (this.isModified("password")) {
//     const hashed = await Password.toHash(this.get("password"));
//     this.set("password", hashed);
//   }
//   done();
// });

inventorySchema.statics.build = (attrs: InventoryAttrs) => {
  return new Inventory(attrs);
};

const Inventory = mongoose.model<InventoryDoc, InventoryModel>(
  "Inventory",
  inventorySchema
);

export { Inventory };
