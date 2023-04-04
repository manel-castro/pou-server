import { PouDoc } from "../../../models/pou";
import {
  updateLastHistoricValue,
  updatePouFood,
  updatePouFoodCapacity,
} from "./updates";

export const foodRefiller = async ({
  pou,
  feedAmount,
}: {
  pou: PouDoc;
  feedAmount: number;
}) => {
  const { foodCapacity } = pou;
  const lastFoodCapacity = foodCapacity[foodCapacity.length - 1];

  await updateLastHistoricValue({
    pou,
    increase: feedAmount,
    key: "food",
  });

  // await updateLastHistoricValue({
  //   pou,
  //   increase: -DEFAULT_FEED_AMOUNT,
  //   key: "foodCapacity",
  // });
};

export const cleanRefiller = async ({ pou }: { pou: PouDoc }) => {
  const { cleanCapacity } = pou;
  const lastCleanCapacity = cleanCapacity[cleanCapacity.length - 1];

  const DEFAULT_CLEAN_AMOUNT = 10;

  if (lastCleanCapacity.consumable >= DEFAULT_CLEAN_AMOUNT) {
    await updateLastHistoricValue({
      pou,
      increase: DEFAULT_CLEAN_AMOUNT,
      key: "clean",
    });

    await updateLastHistoricValue({
      pou,
      increase: -DEFAULT_CLEAN_AMOUNT,
      key: "cleanCapacity",
    });
  }
};
