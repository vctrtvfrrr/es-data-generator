async function forEachMinute(startDate, callback) {
  const start = new Date(startDate);
  const end = new Date();
  for (
    let loop = new Date(start), index = 0;
    loop <= end;
    loop.setMinutes(loop.getMinutes() + 1), index++
  ) {
    // Business hours only
    const d = loop.getDay();
    const h = loop.getHours();
    if (d > 0 && d < 6 && h >= 9 && h < 18) await callback(loop, index);
  }
}

export default forEachMinute;
