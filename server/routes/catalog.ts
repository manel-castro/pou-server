import { NextFunction, Request, Response } from "express";
import { body } from "express-validator";
import { BadRequestError } from "../common/errors/bad-request-error";
import { NotAuthorizedError } from "../common/errors/not-authorized-error";
import { validateRequest } from "../common/middlewares/validate-request";
import { mockData } from "../mockData/catalog";
import { Pou, PouDoc } from "../models/pou";
import { checkFoodStatus } from "./src/pou/status";
import { updatePouFood, updatePouFoodCapacity } from "./src/pou/updates";

const express = require("express");

const router = express.Router();

router.get(
  "/pou/stats",
  async (req: Request, res: Response, next: NextFunction) => {
    const { currentUser } = req;
    if (!currentUser) {
      return next(new NotAuthorizedError());
    }

    const pou = await checkFoodStatus(currentUser.id, next);

    const { food, name, userId, foodCapacity } = pou as PouDoc;

    res.send(JSON.stringify({ name, userId, food, foodCapacity }));
  }
);

router.post(
  "/pou/feed",
  async (req: Request, res: Response, next: NextFunction) => {
    const { currentUser } = req;
    if (!currentUser) {
      return next(new NotAuthorizedError());
    }

    const pou = (await checkFoodStatus(currentUser.id, next)) as PouDoc;

    const { food, name, userId, foodCapacity } = pou;
    const lastFoodCapacity = foodCapacity[foodCapacity.length - 1];

    const DEFAULT_FEED_AMOUNT = 10;

    if (lastFoodCapacity.consumable >= DEFAULT_FEED_AMOUNT) {
      await updatePouFood(pou, DEFAULT_FEED_AMOUNT);
      await updatePouFoodCapacity(pou, -DEFAULT_FEED_AMOUNT);
      await pou.save();
    }

    res.send(JSON.stringify({ name, userId, food, foodCapacity }));
  }
);

router.post(
  "/pou",
  [body("name").optional().isString()],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    const { currentUser } = req;
    if (!currentUser) {
      return next(new NotAuthorizedError());
    }
    const existingPou = await Pou.findOne({ userId: currentUser.id });
    if (existingPou) {
      return next(new BadRequestError("Already assigned Pou"));
    }

    /**
     * Next algorithm gives pouData as a result array.
     * In case editable=true it overwrites defaults by body data, otherwise it leaves defaults.
     */
    const defaultPouData = {
      name: "Pou",
      userId: currentUser.id,
      foodCapacity: [{ consumable: 10, increase: 10, date: Date.now() }],
      food: [{ consumable: 100, increase: 100, date: Date.now() }],
    };
    const pouData = {
      name: "",
      userId: "",
      foodCapacity: [],
      food: [],
    };
    const isEditable = {
      name: true,
      userId: false,
      foodCapacity: false,
      food: false,
    };

    Object.assign(pouData, defaultPouData);
    Object.keys(req.body).forEach((key) => {
      if (isEditable[key as never]) {
        Object.assign(pouData, { [key]: req.body[key] });
      }
    });

    // Update db
    (mockData as any).unshift(pouData);

    console.log("pouData: ", JSON.stringify(pouData));

    const newPou = Pou.build(pouData);
    await newPou.save();

    res.send(JSON.stringify(pouData));
  }
);

export { router as catalogRouter };
