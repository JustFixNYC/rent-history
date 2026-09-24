import { Trans } from "@lingui/react/macro";

import { IaiLink } from "../../../GlossaryLink/glossaryTerms";

type IaiNeededParagraphProps = {
  /** When true, includes “also” before “document” (destab prehstpa wording). */
  includeAlso?: boolean;
};

export const IaiNeededParagraph = ({
  includeAlso = false,
}: IaiNeededParagraphProps) => {
  if (includeAlso) {
    return (
      <div className="timeline-element__copy-paragraph">
        <Trans id="timeline.copy.iai_needed.also">
          To reach the threshold, the landlord would have needed to also
          document <IaiLink />.
        </Trans>
      </div>
    );
  }

  return (
    <div className="timeline-element__copy-paragraph">
      <Trans id="timeline.copy.iai_needed.default">
        To reach the threshold, the landlord would have needed to document{" "}
        <IaiLink />.
      </Trans>
    </div>
  );
};
