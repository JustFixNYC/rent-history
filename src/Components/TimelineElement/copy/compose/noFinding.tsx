import { NoFindingTitle } from "../titles/titles";
import type { TimelineComposer } from "./types";

export const composeNoFinding: TimelineComposer = () => {
  return {
    title: <NoFindingTitle />,
  };
};
