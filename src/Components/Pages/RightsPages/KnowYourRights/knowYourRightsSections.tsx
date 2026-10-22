import { Link } from "@justfixnyc/component-library";
import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";

import type { RightsSectionConfig } from "../shared";
import {
  GceLearnMoreContent,
  GceRentIncreaseLimitsContent,
  GceStayInHomeContent,
  KyrAccordionContentStub,
  RsLeaseRenewalContent,
  RsRentIncreaseLimitsContent,
  RsResourcesContent,
  RsStabilizedLeaseContent,
  RsSuccessionContent,
} from "./content";

const EXAMPLE_LEASE_RIDER_URL =
  "https://hcr.ny.gov/system/files/documents/2026/06/ra-lr1-06-2026-fillable.pdf";

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
        <>
          <p>
            <Trans>
              If you live in a rent-stabilized apartment, or think your
              apartment should be rent stabilized, you may have additional
              protections around your rent and ability to remain in your home.
            </Trans>
          </p>
          <p>
            <Trans>
              If your lease looks{" "}
              <Link
                className="know-your-rights__intro-example-link"
                href={EXAMPLE_LEASE_RIDER_URL}
                target="_blank"
                rel="noreferrer"
              >
                something like this
              </Link>
              , then your apartment is very likely rent stabilized. But even if
              your lease does not look like that, you may still be rent
              stabilized.
            </Trans>
          </p>
        </>
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
          content: <RsLeaseRenewalContent />,
          figmaNodeId: "6854-59897",
        },
        {
          id: "rs-stabilized-lease",
          title: <Trans>Your right to a rent stabilized lease</Trans>,
          content: <RsStabilizedLeaseContent />,
          figmaNodeId: "6854-59898",
        },
        {
          id: "rs-succession",
          title: <Trans>Your right to succession</Trans>,
          content: <RsSuccessionContent />,
          figmaNodeId: "6859-64661",
        },
        {
          id: "rs-resources",
          title: <Trans>Additional resources</Trans>,
          content: <RsResourcesContent />,
          figmaNodeId: "6854-59899",
        },
      ],
      ctas: [
        {
          variant: "analyze",
          title: <Trans>Not sure if your apartment is rent stabilized?</Trans>,
          body: (
            <p>
              <Trans>
                Analyzing your rent history can help you understand if your
                apartment is rent stabilized or should be.
              </Trans>
            </p>
          ),
        },
      ],
    },
    {
      sectionId: "kyr-good-cause",
      title: (
        <Trans>Not rent stabilized? You might be covered by Good Cause</Trans>
      ),
      intro: (
        <p>
          {/* TODO: Figma section intro still placeholder ("desc.") — confirm with design/legal */}
          <Trans>
            TODO: Good Cause section intro copy pending design/legal review.
          </Trans>
        </p>
      ),
      accordions: [
        {
          id: "gce-rent-increase-limits",
          title: <Trans>Your right to limited rent increases</Trans>,
          content: <GceRentIncreaseLimitsContent />,
          figmaNodeId: "6859-65347",
        },
        {
          id: "gce-stay-in-home",
          title: <Trans>Your right to stay in your home</Trans>,
          content: <GceStayInHomeContent />,
          figmaNodeId: "6859-65696",
        },
        {
          id: "gce-learn-more",
          title: (
            <Trans>Learn more about Good Cause Eviction Law protections</Trans>
          ),
          content: <GceLearnMoreContent />,
          figmaNodeId: "6854-59913",
        },
      ],
      ctas: [
        {
          variant: "goodCause",
          title: <Trans>Find out if you’re covered by Good Cause</Trans>,
          body: (
            <p>
              <Trans>
                Use JustFix’s eligibility screener and rent calculator to see if
                you have a legal right to renew your lease and to limited rent
                increases.
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
