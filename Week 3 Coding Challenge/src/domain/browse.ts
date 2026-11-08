// Filters for the browse page, shared with chat matching.
// Pure rules with no imports, so the browser can run them without extra code.

/** The most hours a week each availability answer allows. */
export const HOUR_LIMITS: Readonly<Record<string, number>> = {
  under_5: 4,
  "5_to_10": 10,
  "10_to_20": 20,
  more_than_20: 40,
};

/** An empty string means "any". */
export type Filters = { area: string; level: string; hours: string };

export const NO_FILTERS: Filters = { area: "", level: "", hours: "" };

type Filterable = {
  title: string;
  goals: readonly string[];
  experienceLevels: readonly string[];
  minHours: number;
};

export function fitsHours(minHours: number, hours: string) {
  const limit = HOUR_LIMITS[hours];
  return limit !== undefined && minHours <= limit;
}

export const byFewestHours = (a: Filterable, b: Filterable) =>
  a.minHours - b.minHours || a.title.localeCompare(b.title);

/** Every item that fits all chosen filters, fewest hours first. */
export function filterOpportunities<T extends Filterable>(items: readonly T[], filters: Filters): T[] {
  return items
    .filter(
      (item) =>
        (!filters.area || item.goals.includes(filters.area)) &&
        (!filters.level || item.experienceLevels.includes(filters.level)) &&
        (!filters.hours || fitsHours(item.minHours, filters.hours)),
    )
    .sort(byFewestHours);
}
