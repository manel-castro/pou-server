import { NextFunction, Request, Response } from "express";
import { NotAuthorizedError } from "../../common/errors/not-authorized-error";
import { ServerError } from "../../common/errors/server-error";
import { checkPou, RequestPou } from "../../common/middlewares/check-pou";
import { Inventory } from "../../models/inventory";
import { PouDoc } from "../../models/pou";
import { defaultResponse } from "./pou";
import { checkFoodStatus } from "./src/status";

const express = require("express");

const router = express.Router();

router.post(
  "/pou/petting",
  checkPou,
  async (req: RequestPou, res: Response, next: NextFunction) => {
    const COINS_TO_ADD = 30;
    const PETTINGS_MODULUS = 2;

    const { currentUser } = req;
    if (!currentUser) {
      return next(new NotAuthorizedError());
    }

    const { pou } = req;
    console.log("got here 1", pou.pettings);

    pou.pettings = pou.pettings + 1;
    console.log("got here 2");

    await pou.save();

    console.log("got here 3");

    /**
     * ACTION: gives money every twice petting
     */
    /**
     * Find users inventory
     */
    const inventory = await Inventory.findOne({ userId: currentUser.id })!;

    if (!inventory) {
      return next(new ServerError("Inventory not found for user"));
    }

    if (pou.pettings % PETTINGS_MODULUS !== 0) {
    } else {
      inventory.coins = inventory.coins + COINS_TO_ADD;
      await inventory.save();
    }

    res.send({ pou, inventory });
  }
);

export { router as activitiesRouter };
