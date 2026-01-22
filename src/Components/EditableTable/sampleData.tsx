import { faker } from "@faker-js/faker";

export const LEASE_REASONS_CHANGE = [
  "LEAS/RNL",
  "VAC/LEAS",
  "IMPRVMNT",
  "",
] as const;
export const LEASE_APT_STAT = ["RS", "PE"] as const;

export type Lease = {
  regYear: string;
  aptStat: (typeof LEASE_APT_STAT)[number];
  filingDate: Date;
  legalRent: number;
  prefRent: number;
  paidRent: number;
  reasonsChange: (typeof LEASE_REASONS_CHANGE)[number];
  leaseStart: Date;
  leaseEnd: Date;
};

const range = (len: number) => {
  const arr: number[] = [];
  for (let i = 0; i < len; i++) {
    arr.push(i);
  }
  return arr;
};

const newLease = (): Lease => {
  return {
    regYear: faker.date.past().getFullYear().toString(),
    aptStat: faker.helpers.shuffle(LEASE_APT_STAT)[0],
    filingDate: faker.date.past(),
    legalRent: faker.number.float({ min: 100, max: 2700, fractionDigits: 2 }),
    prefRent: faker.number.float({ min: 100, max: 2700, fractionDigits: 2 }),
    paidRent: faker.number.float({ min: 100, max: 2700, fractionDigits: 2 }),
    reasonsChange: faker.helpers.shuffle(LEASE_REASONS_CHANGE)[0],
    leaseStart: faker.date.past(),
    leaseEnd: faker.date.past(),
  };
};

export function makeData(...lens: number[]) {
  const makeDataLevel = (depth = 0): Lease[] => {
    const len = lens[depth]!;
    return range(len).map((): Lease => {
      return {
        ...newLease(),
      };
    });
  };

  return makeDataLevel();
}
