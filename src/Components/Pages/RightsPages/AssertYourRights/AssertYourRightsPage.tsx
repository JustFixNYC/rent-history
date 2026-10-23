import { Trans } from "@lingui/react/macro";

import {
  RightsAccordionList,
  RightsCtaCard,
  RightsPageShell,
  RightsSection,
} from "../shared";
import { useAssertYourRightsSections } from "./assertYourRightsSections";
import "./AssertYourRightsPage.scss";

const AssertYourRightsPage: React.FC = () => {
  const { sections, bottomCtas } = useAssertYourRightsSections();

  return (
    <RightsPageShell
      heroTitle={<Trans>Assert your rights</Trans>}
      heroIntro={
        <p>
          <Trans>
            Whether you’ve analyzed your rent history or simply have questions
            about what you’re being charged, there are steps you can take to
            learn more and decide what to do next.
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
          infoCallout={section.infoCallout}
        >
          {section.accordions?.length ? (
            <RightsAccordionList items={section.accordions} />
          ) : null}
        </RightsSection>
      ))}

      <div className="assert-your-rights__bottom-ctas">
        {bottomCtas.map((cta) => (
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
    </RightsPageShell>
  );
};

export default AssertYourRightsPage;
