type FindingTenantNameProps = {
  name: string;
};

export const FindingTenantName = ({ name }: FindingTenantNameProps) => (
  <span className="finding-tenant-name" data-testid="finding-tenant-name">
    {name}
  </span>
);
