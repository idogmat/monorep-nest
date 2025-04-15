interface ParsedDate {
  days: number
  hours: number
  minutes: number
  seconds: number
  milliseconds: number
}
export function findDiffDate(expires: Date) {
  const date1: Date = new Date();
  const date2: Date = new Date(expires);

  const diffInMs = Math.abs(date2.getTime() - date1.getTime());

  // Конвертировать разницу в дни, часы, минуты и секунды
  const diff = {
    days: Math.floor(diffInMs / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diffInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diffInMs % (1000 * 60)) / 1000),
    milliseconds: diffInMs % 1000
  };
  return diff
}

// export function messageNotify(date: ParsedDate) {
//   if(date.days < 7)
//   if(date.days < 1)
// }


