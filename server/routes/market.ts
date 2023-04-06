import { NextFunction, Response } from "express";
import { body } from "express-validator";
import mongoose from "mongoose";
import { BadRequestError } from "../common/errors/bad-request-error";
import { NotAuthorizedError } from "../common/errors/not-authorized-error";
import { checkPou, RequestPou } from "../common/middlewares/check-pou";
import { validateRequest } from "../common/middlewares/validate-request";
import { Inventory, InventoryDoc } from "../models/inventory";
import { defaultResponse } from "./pou/pou";

const express = require("express");

const router = express.Router();

const itemsStore = [
  {
    name: "cherry",
    feedCapacity: 20,
    price: 6,
  },
];

router.get(
  "/market/inventory",
  async (req: RequestPou, res: Response, next: NextFunction) => {
    const { currentUser } = req;
    if (!currentUser) {
      return next(new NotAuthorizedError());
    }
    let userInventory = (await Inventory.findOne({
      userId: currentUser.id,
    })) as InventoryDoc;

    res.send(userInventory);
  }
);
router.post(
  "/market/buy",
  checkPou,
  [body("item").isString()],
  validateRequest,
  async (req: RequestPou, res: Response, next: NextFunction) => {
    const { currentUser } = req;
    if (!currentUser) {
      return next(new NotAuthorizedError());
    }
    let userInventory = (await Inventory.findOne({
      userId: currentUser.id,
    })) as InventoryDoc;

    // const { pou } = req;
    // foodRefiller({ pou });
    // await pou.save();

    const { item: itemName } = req.body;

    const foundItemInStore = itemsStore.find((item) => item.name === itemName);

    if (!foundItemInStore) {
      return next(new BadRequestError("Invalid item name"));
    }

    const coins = userInventory.get("coins");
    userInventory.set("coins", coins - foundItemInStore.price);

    const foodInventory = userInventory.get("foodInventory");
    userInventory.set("foodInventory", [
      ...foodInventory,
      {
        name: foundItemInStore.name,
        feedCapacity: foundItemInStore.feedCapacity,
      },
    ]);

    await userInventory.save();

    res.send(userInventory);
  }
);

export { router as marketRouter };
