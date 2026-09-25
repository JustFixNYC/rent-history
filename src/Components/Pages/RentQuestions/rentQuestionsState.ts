import { z } from "zod";

import {
  getRhSessionStepState,
  setRhSessionStepState,
} from "../../../session/rhSessionStorage";

export type RentQuestionsState = {
  livesInApt: boolean | null;
  monthlyRent: string;
};

const DEFAULT_STATE: RentQuestionsState = {
  livesInApt: null,
  monthlyRent: "",
};

const rentQuestionsStateSchema = z.object({
  livesInApt: z.boolean().nullable(),
  monthlyRent: z.string(),
});

export const RENT_QUESTIONS_STEP_STATE_KEY = "rentQuestions";

export const readRentQuestionsState = (): RentQuestionsState => {
  const stored = getRhSessionStepState(
    RENT_QUESTIONS_STEP_STATE_KEY,
    rentQuestionsStateSchema
  );
  if (!stored) {
    return DEFAULT_STATE;
  }
  return {
    livesInApt: stored.livesInApt ?? null,
    monthlyRent: stored.monthlyRent,
  };
};

export const writeRentQuestionsState = (state: RentQuestionsState): void =>
  setRhSessionStepState(RENT_QUESTIONS_STEP_STATE_KEY, state);

export const getInitialRentQuestionsSubstep = (
  state: RentQuestionsState
): 0 | 1 => (state.livesInApt === true ? 1 : 0);
