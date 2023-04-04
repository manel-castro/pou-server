/**
 * UPDATES CONSUMABLES
 */

import { PouDoc } from "../../../models/pou";

export interface historicInterface {
  date: number;
  increase: number;
  consumable: number;
}

export const updateLastHistoricValue = async ({
  pou,
  key,
  increase,
}: {
  pou: PouDoc;
  key: string;
  increase: number;
}) => {
  const history = pou.get(key) as historicInterface[];

  let sortedHistory = history.sort((a, b) => a.date - b.date);

  const lastHistory = sortedHistory[sortedHistory.length - 1]!;

  // sortedHistory.push({
  //   date: Date.now(),
  //   increase,
  //   consumable: lastHistory.consumable + increase,
  // });
  console.log("increase", increase);

  sortedHistory = [
    {
      date: Date.now(),
      increase: increase,
      consumable: lastHistory.consumable + increase,
    },
  ];

  console.log("lastHistory.consumable:", lastHistory.consumable);
  console.log("consumable:", lastHistory.consumable + increase);

  console.log("sortedHistory");
  console.log(JSON.stringify(sortedHistory));

  pou.set(key, sortedHistory);
  // await pou.save();
};

/**
 * POU FOOD UPDATERS
 */
export const updatePouFood = async (pou: PouDoc, amountFeeded: number) => {
  await updateLastHistoricValue({ pou, key: "food", increase: amountFeeded });
};
export const updatePouFoodCapacity = async (
  pou: PouDoc,
  amountCapacity: number
) => {
  await updateLastHistoricValue({
    pou,
    key: "foodCapacity",
    increase: amountCapacity,
  });
};

/**
 * POU CLEAN UPDATERS
 */
export const updatePouClean = async (pou: PouDoc, amountFeeded: number) => {
  await updateLastHistoricValue({ pou, key: "clean", increase: amountFeeded });
};
export const updatePouCleanCapacity = async (
  pou: PouDoc,
  amountCapacity: number
) => {
  await updateLastHistoricValue({
    pou,
    key: "cleanCapacity",
    increase: amountCapacity,
  });
};
