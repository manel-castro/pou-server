import { NextFunction, Request, Response } from "express";
import { body } from "express-validator";
import { BadRequestError } from "../../common/errors/bad-request-error";
import { NotAuthorizedError } from "../../common/errors/not-authorized-error";
import { ServerError } from "../../common/errors/server-error";
import { checkPou, RequestPou } from "../../common/middlewares/check-pou";
import { validateRequest } from "../../common/middlewares/validate-request";
import { Inventory } from "../../models/inventory";
import { PouDoc } from "../../models/pou";
import { defaultResponse } from "./pou";
import { cleanRefiller, foodRefiller } from "./src/refills";
import { checkFoodStatus, checkStatuses } from "./src/status";

const express = require("express");

const router = express.Router();

router.post(
  "/pou/feed",
  [body("item").isString()],
  validateRequest,
  checkPou,
  async (req: RequestPou, res: Response, next: NextFunction) => {
    const { currentUser } = req;
    if (!currentUser) {
      return next(new NotAuthorizedError());
    }

    const { pou } = req;

    const { item } = req.body;

    /**
     * Find users inventory
     */
    // try {
    const inventory = await Inventory.findOne({ userId: currentUser.id })!;

    if (!inventory) {
      return next(new ServerError("Inventory not found for user"));
    }
    const { foodInventory } = inventory;

    /**
     * get item and update inventory
     */
    const itemFoundInInventoryIndex = foodInventory.findIndex(
      (storeItem) => storeItem.name === item
    );
    if (itemFoundInInventoryIndex === -1) {
      return next(new BadRequestError("Item not found in inventory"));
    }

    const itemToUse = foodInventory[itemFoundInInventoryIndex];

    foodInventory.splice(itemFoundInInventoryIndex, 1);
    inventory.foodInventory = foodInventory;
    await inventory.save();

    /**
     * Use item for feed pou
     */

    foodRefiller({ pou, feedAmount: itemToUse.feedCapacity });

    try {
      await pou.save();
    } catch (e) {
      console.log("error:", e);
    }

    res.send({ pou, inventory });
    // } catch (e) {
    //   console.log("error: ", e);
    // }
  }
);
router.post(
  "/pou/clean",
  checkPou,
  async (req: RequestPou, res: Response, next: NextFunction) => {
    const { pou } = req;

    cleanRefiller({ pou });

    await pou.save();

    res.send(defaultResponse({ pou }));
  }
);

export { router as foodRouter };
