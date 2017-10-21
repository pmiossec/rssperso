export namespace DateFormatter {
  const padDigits = (num: number, digits: number = 2): string => {
    return Array(Math.max(digits - String(num).length + 1, 0)).join('0') + num;
  };

  export const formatDate = (date: Date): string => {
    if (!date) {
      return '-';
    }
    const now = new Date();
    return (now.getDate() === date.getDate() && now.getMonth() === date.getMonth())
      ? `${padDigits(date.getHours())}:${padDigits(date.getMinutes())}`
      : `${padDigits(date.getDate())}/${padDigits(date.getMonth() + 1)}`;
  };
}
