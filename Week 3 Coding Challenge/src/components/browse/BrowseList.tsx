"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useMemo, useRef, useState } from "react";
import type { Card } from "@/actions/view";
import AppLink from "@/components/AppLink";
import OpportunityCard from "@/components/conversation/OpportunityCard";
import { QUESTIONS } from "@/components/conversation/questions";
import { filterOpportunities, NO_FILTERS, type Filters } from "@/domain/browse";

export type BrowseItem = Card & { goals: string[]; experienceLevels: string[] };

type Props = { items: BrowseItem[]; sample: boolean };

const optionsFor = (field: "goal" | "experience" | "availability") =>
  QUESTIONS.find((q) => q.field === field)!.options.filter((o) => o.value !== "not_sure");

const FILTERS: { key: keyof Filters; label: string; any: string; field: "goal" | "experience" | "availability" }[] = [
  { key: "area", label: "What you're looking for", any: "Any area", field: "goal" },
  { key: "level", label: "Your experience", any: "Any experience level", field: "experience" },
  { key: "hours", label: "Hours a week you can give", any: "Any amount of time", field: "availability" },
];

export default function BrowseList({ items, sample }: Props) {
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const firstFilter = useRef<HTMLSelectElement>(null);
  const shown = useMemo(() => filterOpportunities(items, filters), [items, filters]);
  const filtered = Object.values(filters).some(Boolean);

  function clearFilters() {
    setFilters(NO_FILTERS);
    firstFilter.current?.focus();
  }

  return (
    <>
      <Box component="section" aria-labelledby="filters-heading" sx={{ mb: 3 }}>
        <Typography id="filters-heading" variant="h2" sx={{ fontSize: "1.25rem", mb: 2 }}>
          Filter the list
        </Typography>
        <Stack spacing={2}>
          {FILTERS.map(({ key, label, any, field }, index) => (
            <TextField
              key={key}
              select
              id={`filter-${key}`}
              label={label}
              value={filters[key]}
              onChange={(event) => setFilters({ ...filters, [key]: event.target.value })}
              slotProps={{
                select: { native: true },
                inputLabel: { shrink: true },
                htmlInput: index === 0 ? { ref: firstFilter } : undefined,
              }}
            >
              <option value="">{any}</option>
              {optionsFor(field).map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </TextField>
          ))}
        </Stack>
        {filtered && (
          <Button onClick={clearFilters} sx={{ mt: 1.5, minHeight: 44 }}>
            Clear filters
          </Button>
        )}
      </Box>

      <Box component="section" aria-labelledby="results-heading">
        <Typography id="results-heading" variant="h2" sx={{ fontSize: "1.25rem", mb: 1 }}>
          Opportunities
        </Typography>
        <Typography role="status" sx={{ mb: 2 }}>
          {filtered
            ? `Showing ${shown.length} of ${items.length} opportunities.`
            : `Showing all ${items.length} opportunities.`}
        </Typography>

        {shown.length === 0 ? (
          <Paper variant="outlined" sx={{ p: 2.5 }}>
            <Typography sx={{ fontWeight: 700, mb: 1 }}>
              Nothing fits all of these filters.
            </Typography>
            <Typography sx={{ mb: 2 }}>
              Try a different experience level or amount of time, or clear the
              filters to see everything.
            </Typography>
            <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: "wrap", alignItems: "center" }}>
              <Button variant="contained" onClick={clearFilters} sx={{ minHeight: 44 }}>
                Clear filters
              </Button>
              <AppLink href="/" color="primary.dark">
                Answer 3 questions instead
              </AppLink>
              <AppLink href="/talk-to-a-person" color="primary.dark">
                Email a person
              </AppLink>
            </Stack>
          </Paper>
        ) : (
          <Stack component="ul" spacing={2} sx={{ listStyle: "none", m: 0, p: 0 }}>
            {shown.map((item) => (
              <li key={item.id}>
                <OpportunityCard card={item} sample={sample} headingLevel="h3" />
              </li>
            ))}
          </Stack>
        )}
      </Box>
    </>
  );
}
