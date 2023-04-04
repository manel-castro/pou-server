import { NextFunction, Request, Response } from "express";
import { body } from "express-validator";
import { Types } from "mongoose";
import { mock } from "node:test";
import { BadRequestError } from "../common/errors/bad-request-error";
import { NotAuthorizedError } from "../common/errors/not-authorized-error";
import { RequestValidationError } from "../common/errors/request-validation-error";
import { validateRequest } from "../common/middlewares/validate-request";
import { isEditable, metadataCatalog } from "../metadata/catalog";
import { mockData } from "../mockData/catalog";
import { Pou, PouDoc } from "../models/pou";

const express = require("express");

const router = express.Router();
// Store requests

const updatePouCapacity = async (pou: PouDoc, newCapacity: number) => {
  pou.set("feedCapacity", newCapacity);
  await pou.save();
};

const updatePouFood = async (pou: PouDoc, amountFeeded: number) => {
  console.log("pou.feedHistory: ", pou.feedHistory);
  const feedHistory = pou.feedHistory.sort((a, b) => a.date - b.date);

  const lastFeedHistory = feedHistory[feedHistory.length - 1]!;

  feedHistory.push({
    amountFeeded,
    date: Date.now(),
    food: lastFeedHistory.food + amountFeeded,
  });

  pou.set("feedHistory", feedHistory);
  await pou.save();

  return pou;
};

/**
 * Think how to:
 * Reusable Support different kinds of capacity/consumables
 * Reusable Support different functions of capacities/consumables
 */

const checkFeedStatus = async (userId: string, next: NextFunction) => {
  const pou = await Pou.findOne({ userId });
  if (!pou) {
    return next(new BadRequestError("Already assigned Pou"));
  }
  const sortedFeedHistory = pou.feedHistory.sort((a, b) => a.date - b.date);

  const lastFeedHistory = sortedFeedHistory[sortedFeedHistory.length - 1]!;

  console.log("lastFeedHistory: ", lastFeedHistory);
  const { amountFeeded, date, food } = lastFeedHistory;

  const TIME_TO_HUNGRY = 60000;
  if (Date.now() - date > TIME_TO_HUNGRY) {
    await updatePouFood(pou, -10);
  }

  const TIME_TO_CAPACITY = 30000;
  if (Date.now() - date > TIME_TO_HUNGRY) {
    await updatePouCapacity(pou, pou.feedCapacity + 10);
  }

  return pou;
  /*

  
   */
};

router.get(
  "/pou/stats",
  async (req: Request, res: Response, next: NextFunction) => {
    const { currentUser } = req;
    if (!currentUser) {
      return next(new NotAuthorizedError());
    }

    const pou = await checkFeedStatus(currentUser.id, next);

    const { feedHistory, name, userId, feedCapacity } = pou as PouDoc;

    res.send(JSON.stringify({ name, userId, feedHistory, feedCapacity }));
  }
);

router.post(
  "/pou/feed",
  async (req: Request, res: Response, next: NextFunction) => {
    const { currentUser } = req;
    if (!currentUser) {
      return next(new NotAuthorizedError());
    }

    const pou = (await checkFeedStatus(currentUser.id, next)) as PouDoc;

    const { feedHistory, name, userId, feedCapacity } = pou;

    const DEFAULT_FEED_AMOUNT = 10;

    if (feedCapacity >= DEFAULT_FEED_AMOUNT) {
      await updatePouFood(pou, DEFAULT_FEED_AMOUNT);
      await updatePouCapacity(pou, pou.feedCapacity - DEFAULT_FEED_AMOUNT);
    }

    res.send(JSON.stringify({ name, userId, feedHistory, feedCapacity }));
  }
);

router.get(
  "/pou/stats",
  async (req: Request, res: Response, next: NextFunction) => {
    const { currentUser } = req;
    if (!currentUser) {
      return next(new NotAuthorizedError());
    }

    const pou = await checkFeedStatus(currentUser.id, next)!;

    const { feedHistory, name, userId, feedCapacity } = pou as PouDoc;

    res.send(JSON.stringify({ name, userId, feedHistory, feedCapacity }));
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
      feedCapacity: 20,
      feedHistory: [{ food: 100, amountFeeded: 100, date: Date.now() }],
    };
    const pouData = {
      name: "",
      userId: "",
      feedCapacity: 0,
      feedHistory: [],
    };
    const isEditable = {
      name: true,
      userId: false,
      feedCapacity: false,
      feedHistory: false,
    };

    Object.assign(pouData, defaultPouData);
    Object.keys(req.body).forEach((key) => {
      if (isEditable[key as never]) {
        Object.assign(pouData, { [key]: req.body[key] });
      }
    });

    // Update db
    (mockData as any).unshift(pouData);

    const newPou = Pou.build(pouData);
    await newPou.save();

    res.send(JSON.stringify(pouData));
  }
);

export { router as catalogRouter };
