type YearChipProps = {
  year: number | string;
};

export const YearChip = ({ year }: YearChipProps) => (
  <span className="findings-review-chip" data-testid="year-chip">
    Year {year}
  </span>
);
