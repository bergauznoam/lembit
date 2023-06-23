export const calculateTimePassed = (dateString: string): string => {
  const givenDate = new Date(dateString);
  const currentDate = new Date();

  const timeDifference = Math.abs(currentDate.getTime() - givenDate.getTime());
  const minutes = Math.floor(timeDifference / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(months / 12);

  if (minutes < 60) {
    return `${minutes}m`;
  } else if (hours < 24) {
    return `${hours}h`;
  } else if (days < 30) {
    const remainingHours = hours % 24;
    return `${days}d ${remainingHours}h`;
  } else if (months < 12) {
    const remainingDays = days % 30;
    return `${months}mo ${remainingDays}d`;
  } else {
    const remainingMonths = months % 12;
    return `${years}y ${remainingMonths}mo`;
  }
}