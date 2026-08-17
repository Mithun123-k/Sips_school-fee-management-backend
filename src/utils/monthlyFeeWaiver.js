const ACADEMIC_MONTHS = [
  "APRIL",
  "MAY",
  "JUNE",
  "JULY",
  "AUGUST",
  "SEPTEMBER",
  "OCTOBER",
  "NOVEMBER",
  "DECEMBER",
  "JANUARY",
  "FEBRUARY",
  "MARCH",
];

const MONTH_NUMBER_BY_NAME = {
  JANUARY: 1,
  FEBRUARY: 2,
  MARCH: 3,
  APRIL: 4,
  MAY: 5,
  JUNE: 6,
  JULY: 7,
  AUGUST: 8,
  SEPTEMBER: 9,
  OCTOBER: 10,
  NOVEMBER: 11,
  DECEMBER: 12,
};

const MONTH_KEY_PATTERN =
  /^\d{4}-(0[1-9]|1[0-2])$/;

// =====================================================
// Normalize Academic Year
// =====================================================

const normalizeAcademicYear = (
  academicYear
) => {
  const value = String(
    academicYear || ""
  ).trim();

  const match = value.match(
    /^(\d{4})-(\d{4})$/
  );

  if (!match) {
    throw new Error(
      "Academic year must be in YYYY-YYYY format"
    );
  }

  const startYear =
    Number(match[1]);

  const endYear =
    Number(match[2]);

  if (
    endYear !==
    startYear + 1
  ) {
    throw new Error(
      "Academic year end must be the next year"
    );
  }

  return {
    value:
      `${startYear}-${endYear}`,
    startYear,
    endYear,
  };
};

// =====================================================
// Normalize Month Name
// =====================================================

const normalizeAcademicMonth = (
  month
) => {
  const monthName = String(
    month || ""
  )
    .trim()
    .toUpperCase();

  if (
    !ACADEMIC_MONTHS.includes(
      monthName
    )
  ) {
    throw new Error(
      `Invalid academic month: ${month}`
    );
  }

  return monthName;
};

// =====================================================
// Build Calendar Month Key For Academic Year
// =====================================================

const getAcademicMonthKey = ({
  academicYear,
  monthName,
}) => {
  const normalizedYear =
    normalizeAcademicYear(
      academicYear
    );

  const normalizedMonth =
    normalizeAcademicMonth(
      monthName
    );

  const monthNumber =
    MONTH_NUMBER_BY_NAME[
      normalizedMonth
    ];

  const calendarYear =
    monthNumber >= 4
      ? normalizedYear.startYear
      : normalizedYear.endYear;

  return `${calendarYear}-${String(
    monthNumber
  ).padStart(2, "0")}`;
};

// =====================================================
// Get Month Key From Date
// =====================================================

const getCalendarMonthKey = (
  dateValue
) => {
  const date =
    new Date(dateValue);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    throw new Error(
      "Invalid month date"
    );
  }

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}`;
};

// =====================================================
// Normalize Waived Month Keys
// =====================================================

const normalizeWaivedMonthKeys = (
  waivedMonths = []
) => {
  return new Set(
    (
      Array.isArray(waivedMonths)
        ? waivedMonths
        : []
    )
      .map((month) =>
        String(month || "").trim()
      )
      .filter((month) =>
        MONTH_KEY_PATTERN.test(
          month
        )
      )
  );
};

module.exports = {
  ACADEMIC_MONTHS,
  MONTH_NUMBER_BY_NAME,
  MONTH_KEY_PATTERN,
  normalizeAcademicYear,
  normalizeAcademicMonth,
  getAcademicMonthKey,
  getCalendarMonthKey,
  normalizeWaivedMonthKeys,
};
