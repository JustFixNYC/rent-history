import { Trans } from "@lingui/react/macro";

import {
  RightsAccordionList,
  RightsCtaCard,
  RightsPageShell,
  RightsSection,
} from "../shared";
import { useKnowYourRightsSections } from "./knowYourRightsSections";
import "./KnowYourRightsPage.scss";

const KnowYourRightsPage: React.FC = () => {
  const { sections } = useKnowYourRightsSections();

  return (
    <RightsPageShell
      heroTitle={<Trans>Know your rights</Trans>}
      heroIntro={
        <p>
          <Trans>
            Whether you live in a rent stabilized apartment, have Good Cause
            protections, or rent anywhere in NYC, you have rights that protect
            you from unfair rent increases, unsafe conditions, and retaliation.
          </Trans>
        </p>
      }
    >
      {sections.map((section) => (
        <RightsSection
          key={section.sectionId}
          sectionId={section.sectionId}
          title={section.title}
          intro={section.intro}
        >
          {section.accordions?.length ? (
            <RightsAccordionList items={section.accordions} />
          ) : null}
          {section.ctas?.length ? (
            <div className="know-your-rights__section-ctas">
              {section.ctas.map((cta) => (
                <RightsCtaCard
                  key={cta.variant}
                  variant={cta.variant}
                  title={cta.title}
                  buttonLabel={cta.buttonLabel}
                >
                  {cta.body}
                </RightsCtaCard>
              ))}
            </div>
          ) : null}
        </RightsSection>
      ))}
    </RightsPageShell>
  );
};

export default KnowYourRightsPage;
