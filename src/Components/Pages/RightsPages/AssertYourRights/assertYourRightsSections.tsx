import { Trans } from "@lingui/react/macro";

import type { RightsCtaCardConfig, RightsSectionConfig } from "../shared";
import { AssertPhase2InfoCallout } from "./AssertPhase2InfoCallout";
import {
  AyrAskLandlordContent,
  AyrNeighborsContent,
  AyrRentReductionCheckContent,
  AyrTenantOrgContent,
  RightsAccordionContentStub,
} from "./content";

export type AssertYourRightsPageConfig = {
  sections: RightsSectionConfig[];
  bottomCtas: RightsCtaCardConfig[];
};

export function useAssertYourRightsSections(): AssertYourRightsPageConfig {
  const sections: RightsSectionConfig[] = [
    {
      sectionId: "assert-phase-1",
      title: <Trans>Phase 1: Gather information</Trans>,
      intro: (
        <p>
          <Trans>
            You don’t have to take formal action right away. Gathering more
            information can help you understand your apartment and building
            history, and decide what, if anything, you want to do next.
          </Trans>
        </p>
      ),
      accordions: [
        {
          id: "ayr-neighbors",
          title: <Trans>Talk to your neighbors</Trans>,
          stepBadge: 1,
          content: <AyrNeighborsContent />,
          figmaNodeId: "6785-17341",
        },
        {
          id: "ayr-rent-reduction-check",
          title: <Trans>Learn if there is an existing rent reduction</Trans>,
          stepBadge: 2,
          content: <AyrRentReductionCheckContent />,
          figmaNodeId: "6785-17342",
        },
        {
          id: "ayr-tenant-org",
          title: <Trans>Consult a tenant organization</Trans>,
          stepBadge: 3,
          content: <AyrTenantOrgContent />,
          figmaNodeId: "6785-17343",
        },
        {
          id: "ayr-ask-landlord",
          title: <Trans>Contact to your landlord</Trans>,
          stepBadge: 4,
          content: <AyrAskLandlordContent />,
          contentClassName: "assert-your-rights__ask-landlord-content",
          figmaNodeId: "6785-17344",
        },
      ],
    },
    {
      sectionId: "assert-phase-2",
      title: <Trans>Phase 2: Take formal action</Trans>,
      intro: (
        <p>
          <Trans>
            If you believe your landlord has violated your rights, you may be
            able to take formal action.
          </Trans>
        </p>
      ),
      infoCallout: <AssertPhase2InfoCallout />,
      accordions: [
        {
          id: "ayr-dhcr-complaint",
          title: <Trans>File a DHCR overcharge complaint</Trans>,
          content: <RightsAccordionContentStub />,
          figmaNodeId: "6785-17351",
        },
        {
          id: "ayr-withhold-rent",
          title: <Trans>Withhold rent</Trans>,
          content: <RightsAccordionContentStub />,
          figmaNodeId: "6785-17352",
        },
        {
          id: "ayr-supreme-court",
          title: <Trans>Take your case to Supreme Court</Trans>,
          content: <RightsAccordionContentStub />,
          figmaNodeId: "6785-17353",
        },
      ],
    },
    {
      sectionId: "assert-other-ways",
      title: <Trans>Other ways to reduce your rent</Trans>,
      intro: (
        <p>
          <Trans>
            If you live in a rent stabilized apartment, there are additional
            programs you can use to try to reduce or limit your rent.
          </Trans>
        </p>
      ),
      accordions: [
        {
          id: "ayr-decreased-services",
          title: <Trans>Rent reduction for decreased services</Trans>,
          content: <RightsAccordionContentStub />,
          figmaNodeId: "6785-17359",
        },
        {
          id: "ayr-scrie-drie",
          title: <Trans>SCRIE and DRIE</Trans>,
          content: <RightsAccordionContentStub />,
          figmaNodeId: "6785-17360",
        },
      ],
    },
  ];

  const bottomCtas: RightsCtaCardConfig[] = [
    {
      variant: "analyze",
      title: <Trans>Suspect an overcharge?</Trans>,
      body: (
        <p>
          <Trans>
            Analyzing your rent history can help you understand how your rent
            has changed over time and identify things that may need a closer
            look.
          </Trans>
        </p>
      ),
    },
    {
      variant: "rentHistoryRequest",
      title: <Trans>Don’t have your rent history?</Trans>,
      body: (
        <p>
          <Trans>
            Receive your rent history by mail. Take the first step to learning
            about your stabilized status and whether you’re paying too much
            rent.
          </Trans>
        </p>
      ),
    },
  ];

  return { sections, bottomCtas };
}
