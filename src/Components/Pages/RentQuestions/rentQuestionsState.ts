import { z } from "zod";

import {
  getRhSessionStepState,
  setRhSessionStepState,
} from "../../../session/rhSessionStorage";

export type RentQuestionsState = {
  monthlyRent: string;
};

const DEFAULT_STATE: RentQuestionsState = {
  monthlyRent: "",
};

const rentQuestionsStateSchema = z.object({
  monthlyRent: z.string(),
});

export const RENT_QUESTIONS_STEP_STATE_KEY = "rentQuestions";

export const readRentQuestionsState = (): RentQuestionsState =>
  getRhSessionStepState(
    RENT_QUESTIONS_STEP_STATE_KEY,
    rentQuestionsStateSchema
  ) ?? DEFAULT_STATE;

export const writeRentQuestionsState = (state: RentQuestionsState): void =>
  setRhSessionStepState(RENT_QUESTIONS_STEP_STATE_KEY, state);
