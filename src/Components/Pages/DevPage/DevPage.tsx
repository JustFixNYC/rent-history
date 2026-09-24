import {
  TimelineElement,
  TIMELINE_PILL_TYPES,
} from "../../TimelineElement/TimelineElement";
import "./DevPage.scss";

/**
 * Temporary unauthenticated page for previewing UI components in development.
 * Not linked from production navigation.
 */
const DevPage: React.FC = () => (
  <section id="dev-page" className="preflow-section">
    <h1 className="preflow-title">UI preview</h1>
    <p className="dev-page__intro">
      Temporary development page for component previews. Not for production use.
    </p>

    <article className="dev-page__section">
      <h2 className="dev-page__section-title">TimelineElement pills</h2>
      <TimelineElement
        variant="secondary"
        year={2024}
        title="All pill types"
        pills={[...TIMELINE_PILL_TYPES]}
      />
    </article>

    <article className="dev-page__section">
      <h2 className="dev-page__section-title">TimelineElement</h2>
      <ol className="timeline">
        <li>
          <TimelineElement
            variant="secondary"
            year={2008}
            endYear={2015}
            title="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
          />
        </li>
        <li>
          <TimelineElement
            variant="primary"
            year={2000}
            title="Apartment listed as exempt from rent stabilization and may have been improperly destabilized."
            pills={["violation", "destabilized"]}
            description={
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
            }
            footnote="Ut enim ad minim veniam, quis nostrud exercitation."
            whatThisMeans="Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore."
          />
        </li>
        <li>
          <TimelineElement
            variant="primary"
            year={2000}
            title="Missing registration may indicate unofficial destabilization."
            pills={["violation", "missing_registration"]}
            defaultOpen
            description={
              <>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Integer nec odio. Praesent libero. Sed cursus ante dapibus
                  diam.
                </p>
                <p>
                  Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis
                  sagittis ipsum. Praesent mauris.
                </p>
              </>
            }
            footnote="Fusce nec tellus sed augue semper porta."
            whatThisMeans="Unless there is proof of legal destabilization, your apartment may still be rent stabilized."
          />
        </li>
        <li>
          <TimelineElement
            variant="secondary"
            year={2016}
            endYear={2026}
            title="No large rent increases were recorded during this period."
            pills={["currently_stabilized"]}
            description={
              <p>
                Mauris massa. Vestibulum lacinia arcu eget nulla. Class aptent
                taciti sociosqu ad litora torquent per conubia nostra.
              </p>
            }
          />
        </li>
        <li>
          <TimelineElement
            variant="secondary"
            year={1995}
            endYear={1999}
            title="Building was exempt from rent stabilization during this period."
          />
        </li>
      </ol>
    </article>
  </section>
);

export default DevPage;
