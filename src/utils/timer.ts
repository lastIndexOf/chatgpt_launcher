export const sleep = (timer: number) =>
  new Promise((resolve) => {
    setTimeout(() => resolve(null), timer);
  });
