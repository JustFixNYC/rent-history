/**
 * Router-aware wrappers for JFCL link components (React Router v6).
 *
 * | Link type                           | Use                                          |
 * | ----------------------------------- | -------------------------------------------- |
 * | External URL                        | JFCL Link / ButtonStyledLink with href       |
 * | Internal SPA (full path known)      | RouterJfclLink / RouterButtonStyledLink      |
 * | Internal SPA (locale-relative path) | LocaleLink / LocaleButtonStyledLink          |
 * | Site chrome with active state       | React Router NavLink (unchanged)              |
 * | Wizard / form continue              | Button + useNavigate() (unchanged)           |
 *
 * Products on React Router v5 should use `<RouterLink component={JfclLink} />`
 * until migrated; see JFCL Link README.
 */
export { LocaleButtonStyledLink } from "./LocaleButtonStyledLink";
export type { LocaleButtonStyledLinkProps } from "./LocaleButtonStyledLink";
export { LocaleLink } from "./LocaleLink";
export type { LocaleLinkProps } from "./LocaleLink";
export { RouterButtonStyledLink } from "./RouterButtonStyledLink";
export type { RouterButtonStyledLinkProps } from "./RouterButtonStyledLink";
export { RouterJfclLink } from "./RouterJfclLink";
export type { RouterJfclLinkProps } from "./RouterJfclLink";
export { useRouterAnchorProps } from "./useRouterAnchorProps";
export type { RouterAnchorOptions } from "./useRouterAnchorProps";
