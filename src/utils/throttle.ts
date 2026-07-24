export function throttle<T extends (...args: never[]) => void>(
  fn: T,
  delay: number,
) {
  let waiting = false;

  return (...args: Parameters<T>) => {
    if (waiting) return;

    fn(...args);

    waiting = true;

    setTimeout(() => {
      waiting = false;
    }, delay);
  };
}