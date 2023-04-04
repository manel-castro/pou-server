import { Request } from "express";
import { NotAuthorizedError } from "./common/errors/not-authorized-error";
import { errorHandler } from "./common/middlewares/error-handler";
import { Reservation } from "./models/reservation";

/**
 * 1) Send all catalog (es un buen comienzo)
 * ideally:
 * 2) Send all catalog for menú
 * 3) Send catalog item by ID
 *
 * CMS ... later
 *
 */

import cors from "cors";
import { catalogRouter } from "./routes/catalog";
import cookieSession from "cookie-session";
import { userRouter } from "./routes/user";
import { currentUser } from "./common/middlewares/current-user";

const express = require("express");

const app = express();

const whitelist = ["http://localhost:3001", "http://localhost:8080"];

app.use(cors({ origin: whitelist }));
app.use(express.json());
app.set("trust proxy", true);

app.use(
  cookieSession({
    signed: false,
    secure: false && process.env.NODE_ENV !== "test", // test run in plain HTTP, not HTTPS // TODO: enable this
  })
);

app.use(currentUser);

app.use(catalogRouter);
app.use(userRouter);

app.get("/admin/reservations", (req: Request, res: any, next: any) => {
  // TESTING

  return next(new NotAuthorizedError());
});
// app.get("/admin/reservations/:clientId", (req: any, res: any) => {
//   /** Input DATA
//    * Bearer Token
//    * Client id
//    */
//   /** Return DATA
//    * Array of Reservation instances
//    */
//   // Authenticate user
//   // Read database
//   // Return value
// });
app.get(
  "/admin/reservations/:reservationId",
  async (req: any, res: any, next: any) => {
    const clientId = "431test",
      storeId = "432test2",
      reservationId = "434124as";

    console.log("req.params:", req.params);

    const reservation = Reservation.build({ clientId, reservationId, storeId });

    console.log("reservation is: ", reservation);

    await reservation.save();

    res.send("reservaton created");
    /** Input DATA
     * Bearer Token
     * Reservation id
     */
    /** Return DATA
     * Reservation instance
     */
    // Authenticate user
    // Read database

    // Filter

    // Return value
  }
);
app.post("/admin/reservations/:clientId", async (req: any, res: any) => {
  /** Input DATA
   * Bearer Token
   * Client id
   * Store id
   * Message (optional - default)
   * Time to schedule
   * Time created
   * Status
   */
  /** Return Data
   * Reservation id
   */
  // Authenticate user
  // Write database
  // Return value
});

// Client requests
app.get("/reservations/:reservationId", (req: any, res: any) => {
  /** Input DATA
   * Reservation id
   */
  /** Return DATA
   * Reservation instance
   */
  // Authenticate user
  // Read database
  // Return value
});

app.use(errorHandler);

export { app };
