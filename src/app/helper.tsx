import {Link} from './feeds/news';

export namespace DateFormatter {
  const padDigits = (number: number, digits: number = 2): string => {
    return Array(Math.max(digits - String(number).length + 1, 0)).join('0') + number;
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

export namespace Storage {
  const dateTimeReviver = (key: string, value: string): any => {
    if (key === 'publicationDate') {
      return new Date(value);
    }
    return value;
  };

  export const loadReadingList = (storeName: string) : Link[] => {
    return JSON.parse(localStorage.getItem(storeName), dateTimeReviver) || [];
  };

  export const remove = (storeName: string, i: number): Link[] => {
    console.log('i:', i);
    var readList : Link[] = loadReadingList(storeName);
    readList.splice(i, 1);

    localStorage.setItem(storeName, JSON.stringify(readList));
    return readList;
  };

  export const addToReadList = (storeName: string, link: Link) : void => {
    var readList : Link[] = loadReadingList(storeName);
    readList.push(link);
    localStorage.setItem(storeName, JSON.stringify(readList));
  };
}
