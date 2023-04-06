import { PouDoc } from "../../../models/pou";
import { historicInterface, updateLastHistoricValue } from "./updates";

/**
 * Things todo:
 * -) Front-end
 */

/**
 * TODO
 * Status decreasings not working right.
 * Dates should be compared to the last negative increase value in the historic
 */

const timeFunction = (timeDif: number, timeToUpdate: number) => {
  return parseInt(timeDif / timeToUpdate + "");
};

export const checkStatus = async ({
  pou,
  consumable,
  consumableKey,
  refiller,
  refillerKey,
  timeConsumable = 2000,
  timeRefiller = 2000,
}: {
  pou: PouDoc;
  consumable: historicInterface[];
  consumableKey: string;
  refiller: historicInterface[];
  refillerKey: string;
  timeConsumable?: number;
  timeRefiller?: number;
}) => {
  const lastConsumableHistory = consumable[consumable.length - 1]!;
  const lastRefillerHistory = refiller[refiller.length - 1]!;

  console.log("lastConsumableHistory: ", lastConsumableHistory);

  /**
   * TODO
   *  */
  const { date: dateConsumable } = lastConsumableHistory;
  const { date: dateRefiller } = lastRefillerHistory;

  const dateConsumableDif = Date.now() - dateConsumable;
  if (dateConsumableDif > timeConsumable) {
    const ammountOfUpdate = timeFunction(dateConsumableDif, timeConsumable);
    console.log("Consumable ammountOfUpdate", ammountOfUpdate);

    await updateLastHistoricValue({
      pou,
      key: consumableKey,
      increase: -10 * ammountOfUpdate,
    });
  }

  const dateRefillerDif = Date.now() - dateRefiller;
  if (dateRefillerDif > timeRefiller) {
    const ammountOfUpdate = timeFunction(dateRefillerDif, timeRefiller);
    console.log("Refiller ammountOfUpdate", ammountOfUpdate);

    await updateLastHistoricValue({
      pou,
      key: refillerKey,
      increase: 20 * ammountOfUpdate,
    });
  }

  return pou;
};

export const checkFoodStatus = async (pou: PouDoc) => {
  const { food, foodCapacity } = pou;

  return checkStatus({
    pou,
    consumable: food,
    consumableKey: "food",
    refiller: foodCapacity,
    refillerKey: "foodCapacity",
  });
};
export const checkCleanStatus = async (pou: PouDoc) => {
  const { clean, cleanCapacity } = pou;

  return checkStatus({
    pou,
    consumable: clean,
    consumableKey: "clean",
    refiller: cleanCapacity,
    refillerKey: "cleanCapacity",
  });
};

export const checkStatuses = async (pou: PouDoc) => {
  await checkFoodStatus(pou);
  await checkCleanStatus(pou);

  return pou;
};
