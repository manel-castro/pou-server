import { PouDoc } from "../../../models/pou";
import { updatePouFood, updatePouFoodCapacity } from "./updates";

export const foodRefiller = async ({ pou }: { pou: PouDoc }) => {
  const { foodCapacity } = pou;
  const lastFoodCapacity = foodCapacity[foodCapacity.length - 1];

  const DEFAULT_FEED_AMOUNT = 10;

  if (lastFoodCapacity.consumable >= DEFAULT_FEED_AMOUNT) {
    await updatePouFood(pou, DEFAULT_FEED_AMOUNT);
    await updatePouFoodCapacity(pou, -DEFAULT_FEED_AMOUNT);
  }
};
