import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";

import type { RightsSectionConfig } from "../shared";
import {
  KyrAccordionContentStub,
  RsRentIncreaseLimitsContent,
} from "./content";

export type KnowYourRightsPageConfig = {
  sections: RightsSectionConfig[];
};

export function useKnowYourRightsSections(): KnowYourRightsPageConfig {
  const { _ } = useLingui();

  const sections: RightsSectionConfig[] = [
    {
      sectionId: "kyr-rent-stabilized",
      title: <Trans>Protections for rent stabilized tenants</Trans>,
      intro: (
        <p>
          <Trans>
            If you live in a rent stabilized apartment, you have protections
            that limit how much your rent can increase and how your landlord can
            treat your tenancy.
          </Trans>
        </p>
      ),
      accordions: [
        {
          id: "rs-rent-increase-limits",
          title: <Trans>Your right to limited rent increases</Trans>,
          content: <RsRentIncreaseLimitsContent />,
          triggerClassName: "know-your-rights__rs-rent-increase-trigger",
          contentClassName: "know-your-rights__rs-rent-increase-content",
          figmaNodeId: "6859-60257",
        },
        {
          id: "rs-lease-renewal",
          title: <Trans>Your right to a lease renewal</Trans>,
          content: <KyrAccordionContentStub />,
          figmaNodeId: "6854-59897",
        },
        {
          id: "rs-stabilized-lease",
          title: <Trans>Your right to a rent stabilized lease</Trans>,
          content: <KyrAccordionContentStub />,
          figmaNodeId: "6854-59898",
        },
        {
          id: "rs-succession",
          title: <Trans>Your right to succession</Trans>,
          content: <KyrAccordionContentStub />,
          figmaNodeId: "6859-64661",
        },
        {
          id: "rs-resources",
          title: <Trans>Additional resources</Trans>,
          content: <KyrAccordionContentStub />,
          figmaNodeId: "6854-59899",
        },
      ],
      ctas: [
        {
          variant: "analyze",
          title: <Trans>Suspect an overcharge?</Trans>,
          body: (
            <p>
              <Trans>
                Analyzing your rent history can help you understand how your
                rent has changed over time and identify things that may need a
                closer look.
              </Trans>
            </p>
          ),
        },
      ],
    },
    {
      sectionId: "kyr-good-cause",
      title: <Trans>Good Cause</Trans>,
      intro: (
        <p>
          <Trans>
            Good Cause Eviction protections may apply to your home depending on
            your building and tenancy.
          </Trans>
        </p>
      ),
      accordions: [
        {
          id: "gce-rent-increase-limits",
          title: <Trans>Your right to limited rent increases</Trans>,
          content: <KyrAccordionContentStub />,
          figmaNodeId: "6859-65347",
        },
        {
          id: "gce-stay-in-home",
          title: <Trans>Your right to stay in your home</Trans>,
          content: <KyrAccordionContentStub />,
          figmaNodeId: "6859-65696",
        },
        {
          id: "gce-learn-more",
          title: (
            <Trans>Learn more about Good Cause Eviction Law protections</Trans>
          ),
          content: <KyrAccordionContentStub />,
          figmaNodeId: "6854-59913",
        },
      ],
      ctas: [
        {
          variant: "goodCause",
          title: <Trans>Check if Good Cause applies to you</Trans>,
          body: (
            <p>
              <Trans>
                Good Cause Eviction Law may protect you from large rent
                increases and certain evictions. Learn more about eligibility
                and your rights.
              </Trans>
            </p>
          ),
          buttonLabel: _(msg`Check your eligibility`),
        },
      ],
    },
    {
      sectionId: "kyr-all-nyc",
      title: <Trans>All NYC tenants</Trans>,
      intro: (
        <p>
          <Trans>
            No matter what type of housing you live in, all NYC tenants have
            basic rights related to habitability, discrimination, and
            organizing.
          </Trans>
        </p>
      ),
      accordions: [
        {
          id: "nyc-eviction-protections",
          title: <Trans>Your eviction protections</Trans>,
          content: <KyrAccordionContentStub />,
          figmaNodeId: "6854-59933",
        },
        {
          id: "nyc-livable-home",
          title: <Trans>Your right to a liveable home</Trans>,
          content: <KyrAccordionContentStub />,
          figmaNodeId: "6854-59934",
        },
        {
          id: "nyc-discrimination",
          title: (
            <Trans>Your rights if you’re being discriminated against</Trans>
          ),
          content: <KyrAccordionContentStub />,
          figmaNodeId: "6854-59935",
        },
        {
          id: "nyc-organize",
          title: <Trans>Your right to organize</Trans>,
          content: <KyrAccordionContentStub />,
          figmaNodeId: "6854-59936",
        },
        {
          id: "nyc-resources",
          title: (
            <Trans>More resources about your rights as an NYC tenant</Trans>
          ),
          content: <KyrAccordionContentStub />,
          figmaNodeId: "6854-59937",
        },
      ],
    },
    {
      sectionId: "kyr-nycha",
      title: <Trans>NYCHA</Trans>,
      intro: (
        <p>
          <Trans>
            If you live in public housing managed by NYCHA, you have specific
            rights related to repairs, rent, and grievance procedures.
          </Trans>
        </p>
      ),
      accordions: [
        {
          id: "nycha-repairs",
          title: <Trans>Your right to repairs</Trans>,
          content: <KyrAccordionContentStub />,
          figmaNodeId: "6854-59943",
        },
        {
          id: "nycha-income-based-rent",
          title: <Trans>Your right to income-based rent</Trans>,
          content: <KyrAccordionContentStub />,
          figmaNodeId: "6854-59944",
        },
        {
          id: "nycha-grieve",
          title: <Trans>Your right to grieve management decisions</Trans>,
          content: <KyrAccordionContentStub />,
          figmaNodeId: "6854-59945",
        },
        {
          id: "nycha-right-to-counsel",
          title: (
            <Trans>Your right to legal representation if facing eviction</Trans>
          ),
          content: <KyrAccordionContentStub />,
          figmaNodeId: "6854-59946",
        },
        {
          id: "nycha-learn-more",
          title: <Trans>Learn more about NYCHA’s tenant protections</Trans>,
          content: <KyrAccordionContentStub />,
          figmaNodeId: "6854-59947",
        },
      ],
    },
  ];

  return { sections };
}
