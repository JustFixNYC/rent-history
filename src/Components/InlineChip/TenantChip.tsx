import "./InlineChip.scss";

type TenantChipProps = {
  tenant: string;
};

export const TenantChip = ({ tenant }: TenantChipProps) => (
  <span className="inline-chip" data-testid="tenant-chip">
    {tenant}
  </span>
);
