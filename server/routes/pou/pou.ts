import { NextFunction, Request, Response } from "express";
import { body } from "express-validator";
import { BadRequestError } from "../../common/errors/bad-request-error";
import { NotAuthorizedError } from "../../common/errors/not-authorized-error";
import { validateRequest } from "../../common/middlewares/validate-request";
import { mockData } from "../../mockData/catalog";
import { Pou, PouDoc } from "../../models/pou";

const express = require("express");

const router = express.Router();

export const defaultResponse = ({ pou }: { pou: PouDoc }) => {
  const { clean, name, userId, cleanCapacity, food, foodCapacity } = pou;

  return { name, userId, clean, cleanCapacity, food, foodCapacity };
};

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
      pettings: 0,
      foodCapacity: [{ consumable: 10, increase: 10, date: Date.now() }],
      food: [{ consumable: 100, increase: 100, date: Date.now() }],
      cleanCapacity: [{ consumable: 10, increase: 10, date: Date.now() }],
      clean: [{ consumable: 100, increase: 100, date: Date.now() }],
    };
    const pouData = {
      name: "",
      userId: "",
      pettings: 0,
      foodCapacity: [],
      food: [],
      cleanCapacity: [],
      clean: [],
    };
    const isEditable = {
      name: true,
      userId: false,
      pettings: false,
      foodCapacity: false,
      food: false,
      cleanCapacity: false,
      clean: false,
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

    res.send(pouData);
  }
);

export { router as pouRouter };
