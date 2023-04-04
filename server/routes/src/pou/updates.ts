/**
 * UPDATES CONSUMABLES
 */

import { PouDoc } from "../../../models/pou";

export interface historicInterface {
  date: number;
  increase: number;
  consumable: number;
}

const updateLastHistoricValue = async ({
  pou,
  key,
  increase,
}: {
  pou: PouDoc;
  key: string;
  increase: number;
}) => {
  const history = pou.get(key) as historicInterface[];

  const sortedHistory = history.sort((a, b) => a.date - b.date);

  const lastHistory = sortedHistory[sortedHistory.length - 1]!;

  sortedHistory.push({
    date: Date.now(),
    increase,
    consumable: lastHistory.consumable + increase,
  });

  pou.set(key, sortedHistory);
  // await pou.save();
};

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
