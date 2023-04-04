import { NextFunction, Request, Response } from "express";
import { NotAuthorizedError } from "../../common/errors/not-authorized-error";
import { PouDoc } from "../../models/pou";
import { checkFoodStatus } from "./src/status";

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

    res.send({ name, userId, food, foodCapacity });
  }
);

export { router as statusRouter };
