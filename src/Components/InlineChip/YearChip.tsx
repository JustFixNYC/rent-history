import "./InlineChip.scss";

type YearChipProps = {
  year: number | string;
};

export const YearChip = ({ year }: YearChipProps) => (
  <span className="inline-chip" data-testid="year-chip">
    Year {year}
  </span>
);
