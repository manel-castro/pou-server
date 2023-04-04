import { NextFunction } from "express";
import { BadRequestError } from "../../../common/errors/bad-request-error";
import { Pou, PouDoc } from "../../../models/pou";
import {
  historicInterface,
  updatePouFood,
  updatePouFoodCapacity,
} from "./updates";

const timeFunction = (timeDif: number, timeToUpdate: number) => {
  return parseInt(timeDif / timeToUpdate + "");
};

export const checkStatus = async ({
  pou,
  consumable,
  refiller,
  timeConsumable = 2000,
  timeRefiller = 2000,
}: {
  pou: PouDoc;
  consumable: historicInterface[];
  refiller: historicInterface[];
  timeConsumable?: number;
  timeRefiller?: number;
}) => {
  const lastFoodHistory = consumable[consumable.length - 1]!;
  const lastFoodCapacityHistory = refiller[refiller.length - 1]!;

  console.log("lastFoodHistory: ", lastFoodHistory);

  /**
   * TODO
   *  */
  const { date: dateConsumable } = lastFoodHistory;
  const { date: dateRefiller } = lastFoodCapacityHistory;

  const dateFoodDif = Date.now() - dateConsumable;
  if (dateFoodDif > timeConsumable) {
    const ammountOfUpdate = timeFunction(dateFoodDif, timeConsumable);
    await updatePouFood(pou, -10 * ammountOfUpdate);
  }

  const dateFoodCapacityDif = Date.now() - dateRefiller;
  if (dateFoodDif > timeRefiller) {
    const ammountOfUpdate = timeFunction(dateFoodCapacityDif, timeRefiller);
    await updatePouFoodCapacity(pou, +10 * ammountOfUpdate);
  }

  return pou;
};

export const checkFoodStatus = async (userId: string, next: NextFunction) => {
  const pou = await Pou.findOne({ userId });
  if (!pou) {
    return next(new BadRequestError("Pou not assigned yet"));
  }
  const { food, foodCapacity } = pou;

  return checkStatus({
    pou,
    consumable: food,
    refiller: foodCapacity,
  });
};
