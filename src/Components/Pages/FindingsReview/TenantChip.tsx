type TenantChipProps = {
  tenant: string;
};

export const TenantChip = ({ tenant }: TenantChipProps) => (
  <span className="findings-review-chip" data-testid="tenant-chip">
    {tenant}
  </span>
);
