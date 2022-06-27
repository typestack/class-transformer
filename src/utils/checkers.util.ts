export function checkVersion(
  version: number | undefined,
  since: number | undefined,
  until: number | undefined
): boolean {
  if (version === undefined) return true;
  let decision = true;
  if (decision && since) decision = version >= since;
  if (decision && until) decision = version < until;

  return decision;
}

export function checkGroups(groups: string[], metadataGroups: string[] | undefined): boolean {
  if (!metadataGroups || !metadataGroups.length) return true;

  return groups.some(optionGroup => metadataGroups.includes(optionGroup));
}
