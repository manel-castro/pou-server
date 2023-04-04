import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Pou, PouDoc } from "../../models/pou";
import { checkStatuses } from "../../routes/pou/src/status";

import { BadRequestError } from "../errors/bad-request-error";
import { NotAuthorizedError } from "../errors/not-authorized-error";

export interface RequestPou extends Request {
  pou: PouDoc;
}

/**
 * Always save Pou after using this middleware
 */
export const checkPou = async (
  req: RequestPou,
  res: Response,
  next: NextFunction
) => {
  const { currentUser } = req;
  if (!currentUser) {
    return next(new NotAuthorizedError());
  }

  const pou = await Pou.findOne({ userId: currentUser.id });
  if (!pou) {
    return next(new BadRequestError("Pou not assigned yet"));
  }

  await checkStatuses(pou);

  req.pou = pou;

  next();
};
