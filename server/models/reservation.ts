import mongoose from "mongoose";

// Attrs required for creating a new reservation
interface ReservationAttrs {
  clientId: string;
  storeId: string;
  reservationId: string;
}

// the properties that Reservation Model has, we the build method
interface ReservationModel extends mongoose.Model<ReservationDoc> {
  build(attrs: ReservationAttrs): ReservationDoc;
}

//describes the properties that reservation document has
interface ReservationDoc extends mongoose.Document {
  clientId: string;
  storeId: string;
  reservationId: string;
}

const reservationSchema = new mongoose.Schema(
  {
    clientId: {
      type: String,
      required: true,
    },
    storeId: {
      type: String,
      required: true,
    },
    reservationId: {
      type: String,
      required: true,
    },
  },
  {
    optimisticConcurrency: true,

    // DDBB compatibility concerns:
    versionKey: "version",

    toObject: {},
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;

        console.log(doc);
        console.log(ret);
      },
    },
  }
);

// reservationSchema.virtual("id").get(function () {
//   return this._id.toHexString();
// });
// // Ensure virtual fields are serialised.
// reservationSchema.set("toJSON", {
//   virtuals: true,
// });

// Interesting to implement in case
// userSchema.pre("save", async function (done) {
//   // why to use function instead of () => : 166 Mongoose presaved hooks: min 2
//   // the reason is that we need to access to methods with .this
//   if (this.isModified("password")) {
//     const hashed = await Password.toHash(this.get("password"));
//     this.set("password", hashed);
//   }

//   done();
// });

reservationSchema.statics.build = (attrs: ReservationAttrs) => {
  return new Reservation(attrs);
};

const Reservation = mongoose.model<ReservationDoc, ReservationModel>(
  "Reservation",
  reservationSchema
);

export { Reservation };
