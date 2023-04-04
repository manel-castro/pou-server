import { NextFunction, Request, Response } from "express";
import { NotAuthorizedError } from "../../common/errors/not-authorized-error";
import { checkPou, RequestPou } from "../../common/middlewares/check-pou";
import { PouDoc } from "../../models/pou";
import { defaultResponse } from "./pou";
import { checkFoodStatus } from "./src/status";

const express = require("express");

const router = express.Router();

router.get(
  "/pou/petting",
  checkPou,
  async (req: RequestPou, res: Response, next: NextFunction) => {
    const { currentUser } = req;
    if (!currentUser) {
      return next(new NotAuthorizedError());
    }

    const { pou } = req;
    await pou.save();

    res.send(defaultResponse({ pou }));
  }
);

export { router as statusRouter };
