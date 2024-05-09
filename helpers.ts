export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function min(x: bigint, y: bigint): bigint {
  if (x < y) {
    return x;
  } else {
    return y;
  }
}