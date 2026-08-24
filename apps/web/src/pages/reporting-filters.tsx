import { MenuItem, Stack, TextField } from '@mui/material';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { InteractionOutcome, MembershipLevel, ResourceCategory } from '../generated/graphql';

export function useReportingFilters() {
  const [params, setParams] = useSearchParams();
  const [defaults] = useState(() => {
    const to = new Date(); const from = new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
    return { from: toInput(from), to: toInput(to) };
  });
  const values = {
    from: params.get('from') ?? defaults.from,
    to: params.get('to') ?? defaults.to,
    outcome: params.get('outcome') ?? '',
    membership: params.get('membership') ?? '',
    category: params.get('category') ?? '',
    resource: params.get('resource') ?? '',
    sort: params.get('sort') ?? '',
  };
  const set = (key: string, value: string) => setParams((current) => { const next = new URLSearchParams(current); if (value) next.set(key, value); else next.delete(key); return next; }, { replace: true });
  const variables = useMemo(() => ({
    window: { from: new Date(`${values.from}Z`).toISOString(), to: new Date(`${values.to}Z`).toISOString() },
    filter: {
      ...(values.outcome ? { outcomes: [values.outcome as InteractionOutcome] } : {}),
      ...(values.membership ? { membershipLevels: [values.membership as MembershipLevel] } : {}),
      ...(values.category ? { categories: [values.category as ResourceCategory] } : {}),
      ...(values.resource.trim() ? { resourceText: values.resource.trim() } : {}),
    },
  }), [values.from, values.to, values.outcome, values.membership, values.category, values.resource]);
  return { values, variables, set };
}

export function ReportingFilters({ values, set, includeOutcome = true }: { values: ReturnType<typeof useReportingFilters>['values']; set: ReturnType<typeof useReportingFilters>['set']; includeOutcome?: boolean }) {
  return <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} useFlexGap flexWrap="wrap">
    <TextField label="From (UTC)" type="datetime-local" value={values.from} onChange={(event) => { if (event.target.value) set('from', event.target.value); }} slotProps={{ inputLabel: { shrink: true } }} />
    <TextField label="To (UTC)" type="datetime-local" value={values.to} onChange={(event) => { if (event.target.value) set('to', event.target.value); }} slotProps={{ inputLabel: { shrink: true } }} />
    {includeOutcome && <TextField select label="Outcome" value={values.outcome} onChange={(event) => set('outcome', event.target.value)} sx={{ minWidth: 140 }}><MenuItem value="">All outcomes</MenuItem>{Object.values(InteractionOutcome).map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}</TextField>}
    <TextField select label="Membership at interaction" value={values.membership} onChange={(event) => set('membership', event.target.value)} sx={{ minWidth: 200 }}><MenuItem value="">All levels</MenuItem>{Object.values(MembershipLevel).map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}</TextField>
    <TextField select label="Resource category" value={values.category} onChange={(event) => set('category', event.target.value)} sx={{ minWidth: 180 }}><MenuItem value="">All categories</MenuItem>{Object.values(ResourceCategory).map((value) => <MenuItem key={value} value={value}>{value.replaceAll('_', ' ')}</MenuItem>)}</TextField>
    <TextField label="Resource code or name" value={values.resource} onChange={(event) => set('resource', event.target.value)} />
  </Stack>;
}

function toInput(value: Date) { return value.toISOString().slice(0, 16); }
