import { faker } from "@faker-js/faker";

export const LEASE_REASONS_CHANGE = [
  "LEAS/RNL",
  "VAC/LEAS",
  "IMPRVMNT",
  "OTHER",
  "",
] as const;
export const LEASE_APT_STAT = [
  "RS",
  "RS-V",
  "PE",
  "RC",
  "*RENT CONTROL - REG NOT REQUIRED*",
  "*REG NOT FOUND FOR SUBJECT PREMISES*",
  "*EXEMPT APARTMENT - REG NOT REQUIRED*",
] as const;

// These statuses disable all other fields in the row
export const EXEMPT_APT_STAT: readonly (typeof LEASE_APT_STAT)[number][] = [
  "*RENT CONTROL - REG NOT REQUIRED*",
  "*REG NOT FOUND FOR SUBJECT PREMISES*",
  "*EXEMPT APARTMENT - REG NOT REQUIRED*",
];

export type LeaseData = {
  filingDate: string;
  legalRent: number;
  prefRent: number;
  paidRent: number;
  reasonsChange: (typeof LEASE_REASONS_CHANGE)[number];
  leaseStart: string;
  leaseEnd: string;
};

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
  savedData?: LeaseData; // Stores original data when exempt status is selected
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

// Page 1: 1984-1993
const rentHistoryPage1: Lease[] = [
  {
    regYear: "1984",
    aptStat: "RS",
    filingDate: "",
    legalRent: 266.87,
    prefRent: 0,
    paidRent: 0,
    reasonsChange: "OTHER",
    leaseStart: "",
    leaseEnd: "",
    hasErrors: false,
  },
  {
    regYear: "1985",
    aptStat: "RS",
    filingDate: "",
    legalRent: 266.87,
    prefRent: 0,
    paidRent: 0,
    reasonsChange: "OTHER",
    leaseStart: "",
    leaseEnd: "1986-11-15",
    hasErrors: false,
  },
  {
    regYear: "1986",
    aptStat: "RS",
    filingDate: "1992-09-28",
    legalRent: 266.87,
    prefRent: 0,
    paidRent: 0,
    reasonsChange: "",
    leaseStart: "",
    leaseEnd: "1986-11-15",
    hasErrors: false,
  },
  {
    regYear: "1987",
    aptStat: "RS",
    filingDate: "1988-06-16",
    legalRent: 320.18,
    prefRent: 0,
    paidRent: 0,
    reasonsChange: "",
    leaseStart: "1986-12-01",
    leaseEnd: "1987-11-30",
    hasErrors: false,
  },
  {
    regYear: "1988",
    aptStat: "*REG NOT FOUND FOR SUBJECT PREMISES*",
    filingDate: "",
    legalRent: 0,
    prefRent: 0,
    paidRent: 0,
    reasonsChange: "",
    leaseStart: "",
    leaseEnd: "",
    hasErrors: false,
  },
  {
    regYear: "1989",
    aptStat: "RS",
    filingDate: "1992-09-28",
    legalRent: 380.84,
    prefRent: 0,
    paidRent: 0,
    reasonsChange: "",
    leaseStart: "1989-12-01",
    leaseEnd: "1991-11-30",
    hasErrors: true,
  },
  {
    regYear: "1990",
    aptStat: "RS",
    filingDate: "1992-09-28",
    legalRent: 380.84,
    prefRent: 0,
    paidRent: 0,
    reasonsChange: "",
    leaseStart: "1989-12-01",
    leaseEnd: "1991-11-30",
    hasErrors: false,
  },
  {
    regYear: "1991",
    aptStat: "RS",
    filingDate: "1991-09-05",
    legalRent: 380.84,
    prefRent: 0,
    paidRent: 0,
    reasonsChange: "",
    leaseStart: "1989-12-01",
    leaseEnd: "1991-11-30",
    hasErrors: false,
  },
  {
    regYear: "1992",
    aptStat: "RS",
    filingDate: "1992-07-31",
    legalRent: 405.59,
    prefRent: 0,
    paidRent: 0,
    reasonsChange: "",
    leaseStart: "1991-12-01",
    leaseEnd: "1993-11-30",
    hasErrors: false,
  },
  {
    regYear: "1993",
    aptStat: "*REG NOT FOUND FOR SUBJECT PREMISES*",
    filingDate: "",
    legalRent: 0,
    prefRent: 0,
    paidRent: 0,
    reasonsChange: "",
    leaseStart: "",
    leaseEnd: "",
    hasErrors: false,
  },
];

// Page 2: 1994-2003
const rentHistoryPage2: Lease[] = [
  {
    regYear: "1994",
    aptStat: "RS",
    filingDate: "1994-07-15",
    legalRent: 600.0,
    prefRent: 0,
    paidRent: 0,
    reasonsChange: "",
    leaseStart: "1994-01-01",
    leaseEnd: "1994-12-31",
    hasErrors: false,
  },
  {
    regYear: "1995",
    aptStat: "RS",
    filingDate: "1995-06-16",
    legalRent: 446.48,
    prefRent: 0,
    paidRent: 0,
    reasonsChange: "VAC/LEAS",
    leaseStart: "1995-03-01",
    leaseEnd: "1996-02-28",
    hasErrors: false,
  },
  {
    regYear: "1996",
    aptStat: "RS",
    filingDate: "1996-07-09",
    legalRent: 464.34,
    prefRent: 0,
    paidRent: 0,
    reasonsChange: "LEAS/RNL",
    leaseStart: "1996-03-01",
    leaseEnd: "1998-02-28",
    hasErrors: false,
  },
  {
    regYear: "1997",
    aptStat: "RS",
    filingDate: "1997-05-05",
    legalRent: 506.13,
    prefRent: 0,
    paidRent: 0,
    reasonsChange: "VAC/LEAS",
    leaseStart: "1996-12-01",
    leaseEnd: "1997-11-30",
    hasErrors: false,
  },
  {
    regYear: "1998",
    aptStat: "RS",
    filingDate: "1998-05-18",
    legalRent: 526.38,
    prefRent: 0,
    paidRent: 0,
    reasonsChange: "LEAS/RNL",
    leaseStart: "1997-12-01",
    leaseEnd: "1998-11-30",
    hasErrors: false,
  },
  {
    regYear: "1999",
    aptStat: "RS",
    filingDate: "1999-06-07",
    legalRent: 526.38,
    prefRent: 0,
    paidRent: 0,
    reasonsChange: "",
    leaseStart: "1998-12-01",
    leaseEnd: "1999-11-30",
    hasErrors: false,
  },
  {
    regYear: "2000",
    aptStat: "RS",
    filingDate: "2000-08-07",
    legalRent: 547.44,
    prefRent: 0,
    paidRent: 0,
    reasonsChange: "",
    leaseStart: "1999-12-01",
    leaseEnd: "2001-11-30",
    hasErrors: false,
  },
  {
    regYear: "2001",
    aptStat: "RS",
    filingDate: "2001-07-31",
    legalRent: 547.44,
    prefRent: 0,
    paidRent: 0,
    reasonsChange: "",
    leaseStart: "1999-12-01",
    leaseEnd: "2001-11-30",
    hasErrors: false,
  },
  {
    regYear: "2002",
    aptStat: "RS-V",
    filingDate: "2002-07-25",
    legalRent: 569.34,
    prefRent: 0,
    paidRent: 0,
    reasonsChange: "",
    leaseStart: "",
    leaseEnd: "",
    hasErrors: false,
  },
  {
    regYear: "2003",
    aptStat: "RS",
    filingDate: "2003-07-16",
    legalRent: 700.0,
    prefRent: 0,
    paidRent: 0,
    reasonsChange: "",
    leaseStart: "2002-05-01",
    leaseEnd: "2003-04-30",
    hasErrors: false,
  },
];

// Page 3: 2004-2010
const rentHistoryPage3: Lease[] = [
  {
    regYear: "2004",
    aptStat: "RS",
    filingDate: "2004-11-26",
    legalRent: 728.0,
    prefRent: 0,
    paidRent: 0,
    reasonsChange: "",
    leaseStart: "2003-05-01",
    leaseEnd: "2005-04-30",
    hasErrors: false,
  },
  {
    regYear: "2005",
    aptStat: "RS",
    filingDate: "2005-11-10",
    legalRent: 128.0,
    prefRent: 0,
    paidRent: 0,
    reasonsChange: "",
    leaseStart: "2003-05-01",
    leaseEnd: "2005-04-30",
    hasErrors: true,
  },
  {
    regYear: "2006",
    aptStat: "RS",
    filingDate: "2006-08-21",
    legalRent: 753.48,
    prefRent: 0,
    paidRent: 0,
    reasonsChange: "LEAS/RNL",
    leaseStart: "2005-05-01",
    leaseEnd: "2006-04-30",
    hasErrors: false,
  },
  {
    regYear: "2007",
    aptStat: "RS",
    filingDate: "2007-08-07",
    legalRent: 794.92,
    prefRent: 0,
    paidRent: 0,
    reasonsChange: "LEAS/RNL",
    leaseStart: "2006-05-01",
    leaseEnd: "2008-04-30",
    hasErrors: false,
  },
  {
    regYear: "2008",
    aptStat: "RS",
    filingDate: "2008-11-24",
    legalRent: 794.92,
    prefRent: 0,
    paidRent: 0,
    reasonsChange: "",
    leaseStart: "2005-07-31",
    leaseEnd: "2008-04-30",
    hasErrors: false,
  },
  {
    regYear: "2009",
    aptStat: "RS",
    filingDate: "2009-09-03",
    legalRent: 840.63,
    prefRent: 0,
    paidRent: 0,
    reasonsChange: "LEAS/RNL",
    leaseStart: "2008-05-01",
    leaseEnd: "2010-04-30",
    hasErrors: false,
  },
  {
    regYear: "2010",
    aptStat: "RS",
    filingDate: "2009-09-03",
    legalRent: 840.63,
    prefRent: 0,
    paidRent: 0,
    reasonsChange: "LEAS/RNL",
    leaseStart: "2008-05-01",
    leaseEnd: "2010-04-30",
    hasErrors: false,
  },
];

// Page 4: 2011-2017
const rentHistoryPage4: Lease[] = [
  {
    regYear: "2011",
    aptStat: "RS",
    filingDate: "2011-07-27",
    legalRent: 870.63,
    prefRent: 0,
    paidRent: 0,
    reasonsChange: "LEAS/RNL",
    leaseStart: "2010-05-01",
    leaseEnd: "2011-04-30",
    hasErrors: false,
  },
  {
    regYear: "2012",
    aptStat: "RS",
    filingDate: "2012-05-04",
    legalRent: 900.89,
    prefRent: 0,
    paidRent: 0,
    reasonsChange: "LEAS/RNL",
    leaseStart: "2011-05-01",
    leaseEnd: "2012-04-30",
    hasErrors: false,
  },
  {
    regYear: "2013",
    aptStat: "RS",
    filingDate: "2013-06-17",
    legalRent: 1300.0,
    prefRent: 0,
    paidRent: 0,
    reasonsChange: "VAC/LEAS",
    leaseStart: "2012-09-01",
    leaseEnd: "2013-08-31",
    hasErrors: false,
  },
  {
    regYear: "2014",
    aptStat: "RS",
    filingDate: "2014-05-29",
    legalRent: 1352.0,
    prefRent: 0,
    paidRent: 0,
    reasonsChange: "LEAS/RNL",
    leaseStart: "2013-09-01",
    leaseEnd: "2015-08-31",
    hasErrors: false,
  },
  {
    regYear: "2015",
    aptStat: "RS",
    filingDate: "2015-07-27",
    legalRent: 1352.0,
    prefRent: 0,
    paidRent: 0,
    reasonsChange: "",
    leaseStart: "2013-09-01",
    leaseEnd: "2015-08-31",
    hasErrors: false,
  },
  {
    regYear: "2016",
    aptStat: "RS",
    filingDate: "2016-07-18",
    legalRent: 1389.18,
    prefRent: 0,
    paidRent: 0,
    reasonsChange: "LEAS/RNL",
    leaseStart: "2015-09-01",
    leaseEnd: "2017-08-31",
    hasErrors: false,
  },
  {
    regYear: "2017",
    aptStat: "RS",
    filingDate: "2017-05-25",
    legalRent: 1389.18,
    prefRent: 0,
    paidRent: 0,
    reasonsChange: "",
    leaseStart: "2015-09-01",
    leaseEnd: "2017-08-31",
    hasErrors: false,
  },
];

// Page 5: 2018-2023
const rentHistoryPage5: Lease[] = [
  {
    regYear: "2018",
    aptStat: "RS",
    filingDate: "2018-06-07",
    legalRent: 266.87,
    prefRent: 0,
    paidRent: 0,
    reasonsChange: "LEAS/RNL",
    leaseStart: "2017-09-01",
    leaseEnd: "2019-08-31",
    hasErrors: false,
  },
  {
    regYear: "2019",
    aptStat: "*REG NOT FOUND FOR SUBJECT PREMISES*",
    filingDate: "",
    legalRent: 0,
    prefRent: 0,
    paidRent: 0,
    reasonsChange: "",
    leaseStart: "",
    leaseEnd: "",
    hasErrors: false,
  },
  {
    regYear: "2020",
    aptStat: "*REG NOT FOUND FOR SUBJECT PREMISES*",
    filingDate: "",
    legalRent: 0,
    prefRent: 0,
    paidRent: 0,
    reasonsChange: "",
    leaseStart: "",
    leaseEnd: "",
    hasErrors: false,
  },
  {
    regYear: "2021",
    aptStat: "*REG NOT FOUND FOR SUBJECT PREMISES*",
    filingDate: "",
    legalRent: 0,
    prefRent: 0,
    paidRent: 0,
    reasonsChange: "",
    leaseStart: "",
    leaseEnd: "",
    hasErrors: false,
  },
  {
    regYear: "2022",
    aptStat: "*REG NOT FOUND FOR SUBJECT PREMISES*",
    filingDate: "",
    legalRent: 0,
    prefRent: 0,
    paidRent: 0,
    reasonsChange: "",
    leaseStart: "",
    leaseEnd: "",
    hasErrors: false,
  },
  {
    regYear: "2023",
    aptStat: "*REG NOT FOUND FOR SUBJECT PREMISES*",
    filingDate: "",
    legalRent: 0,
    prefRent: 0,
    paidRent: 0,
    reasonsChange: "",
    leaseStart: "",
    leaseEnd: "",
    hasErrors: false,
  },
];

// Combined array of all rent history
export const exampleRentHistory: Lease[] = [
  ...rentHistoryPage1,
  ...rentHistoryPage2,
  ...rentHistoryPage3,
  ...rentHistoryPage4,
  ...rentHistoryPage5,
];

// Pages array for pagination
export const exampleRentHistoryPages: Lease[][] = [
  rentHistoryPage1,
  rentHistoryPage2,
  rentHistoryPage3,
  rentHistoryPage4,
  rentHistoryPage5,
];
