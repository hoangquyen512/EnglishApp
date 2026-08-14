export const COMPANION_COLLAPSED_SIZE = { width: 120, height: 120 } as const;
export const COMPANION_EXPANDED_SIZE = { width: 420, height: 560 } as const;

export function companionBounds(input: {
  expanded: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
}): { x: number; y: number; width: number; height: number } {
  const size = input.expanded ? COMPANION_EXPANDED_SIZE : COMPANION_COLLAPSED_SIZE;
  const right = input.x + input.width;
  return {
    x: right - size.width,
    y: input.y,
    width: size.width,
    height: size.height,
  };
}
