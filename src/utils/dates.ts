/** Calendar dates as YYYY-MM-DD strings, the format Todoist uses for `due.date`. */

/** Today's date in the given IANA timezone (e.g. the account's `tz_info.timezone`). */
export function todayIn(timeZone: string) {
  // en-CA formats dates as YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

/** Adds whole days to a YYYY-MM-DD date, independent of any timezone. */
export function addDays(isoDate: string, days: number) {
  const [year, month, day] = isoDate.split('-').map(Number) as [number, number, number];
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
}
