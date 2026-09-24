import {
  TimelineElement,
  TIMELINE_PILL_TYPES,
} from "../../TimelineElement/TimelineElement";
import { mapTimelineItemToProps } from "../../TimelineElement/mapTimelineItem";
import {
  allTimelineFindingTypes,
  getCatalogMockTimelineItem,
  mockTimelineElements,
} from "../../TimelineElement/mockData";
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
      <h2 className="dev-page__section-title">Timeline analysis results</h2>
      <ol className="timeline">
        {mockTimelineElements.map((item, index) => (
          <li key={`${item.type}-${item.year}-${index}`}>
            <TimelineElement {...mapTimelineItemToProps(item)} />
          </li>
        ))}
      </ol>
    </article>

    <article className="dev-page__section">
      <h2 className="dev-page__section-title">Timeline elements by type</h2>
      <nav className="dev-page__type-nav" aria-label="Timeline finding types">
        <ul>
          {allTimelineFindingTypes.map((type) => (
            <li key={type}>
              <a href={`#${type}`}>{type}</a>
            </li>
          ))}
        </ul>
      </nav>
      <ol className="timeline dev-page__type-catalog">
        {allTimelineFindingTypes.map((type) => {
          const item = getCatalogMockTimelineItem(type);
          return (
            <li key={type} id={type} className="dev-page__type-entry">
              <h3 className="dev-page__type-label">
                <a href={`#${type}`}>{type}</a>
              </h3>
              <TimelineElement {...mapTimelineItemToProps(item)} />
            </li>
          );
        })}
      </ol>
    </article>
  </section>
);

export default DevPage;
