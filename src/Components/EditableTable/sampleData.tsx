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
  filingDate: string;
  legalRent: number;
  prefRent: number;
  paidRent: number;
  reasonsChange: (typeof LEASE_REASONS_CHANGE)[number];
  leaseStart: string;
  leaseEnd: string;
  hasErrors: boolean;
};

const range = (len: number) => {
  const arr: number[] = [];
  for (let i = 0; i < len; i++) {
    arr.push(i);
  }
  return arr;
};

const newLease = (year?: number): Lease => {
  const regYear = year ? year.toString() : "";
  return {
    regYear,
    aptStat: faker.helpers.shuffle(LEASE_APT_STAT)[0],
    filingDate: faker.date.past().toISOString().slice(0, 10),
    legalRent: faker.number.float({ min: 100, max: 2700, fractionDigits: 2 }),
    prefRent: faker.number.float({ min: 100, max: 2700, fractionDigits: 2 }),
    paidRent: faker.number.float({ min: 100, max: 2700, fractionDigits: 2 }),
    reasonsChange: faker.helpers.shuffle(LEASE_REASONS_CHANGE)[0],
    leaseStart: faker.date.past().toISOString().slice(0, 10),
    leaseEnd: faker.date.past().toISOString().slice(0, 10),
    hasErrors: faker.datatype.boolean({ probability: 0.2 }),
  };
};

export function makeData(...lens: number[]) {
  let currentYear = 1983;
  const makeDataLevel = (depth = 0): Lease[] => {
    const len = lens[depth]!;
    return range(len).map((): Lease => {
      const lease = newLease(currentYear);
      currentYear++;
      return lease;
    });
  };

  return makeDataLevel();
}
