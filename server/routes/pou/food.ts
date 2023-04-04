import { NextFunction, Request, Response } from "express";
import { NotAuthorizedError } from "../../common/errors/not-authorized-error";
import { PouDoc } from "../../models/pou";
import { foodRefiller } from "./src/refills";
import { checkFoodStatus } from "./src/status";

const express = require("express");

const router = express.Router();

router.post(
  "/pou/feed",
  async (req: Request, res: Response, next: NextFunction) => {
    const { currentUser } = req;
    if (!currentUser) {
      return next(new NotAuthorizedError());
    }

    const pou = (await checkFoodStatus(currentUser.id, next)) as PouDoc;
    foodRefiller({ pou });

    await pou.save();

    const { food, name, userId, foodCapacity } = pou;

    res.send({ name, userId, food, foodCapacity });
  }
);

export { router as foodRouter };
