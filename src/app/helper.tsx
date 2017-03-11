import { Link } from './feeds/news';
import { BlobRemoteStorage } from './readingList/blobRemoteStorage';

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

export const ReadingListKey: string = 'ReadingList';
export const ArchiveListKey: string = 'ArchiveList';

export namespace Storage {

  const readListStorage: BlobRemoteStorage = new BlobRemoteStorage('4013cc1f-0657-11e7-a0ba-8deb10d7638f');
  const archiveListStorage: BlobRemoteStorage = new BlobRemoteStorage('1a115a19-06a3-11e7-a0ba-399ae9b7d9b1');
  var stateChanged: boolean = true;
  const dateTimeReviver = (key: string, value: string): any => {
    if (key === 'publicationDate') {
      return new Date(value);
    }
    return value;
  };

  const loadReadingList = (storeName: string): Link[] => {
    return JSON.parse(localStorage.getItem(storeName), dateTimeReviver) || [];
  };

  export const loadReadingListIfChanged = (storeName: string): Link[] => {
    if (!stateChanged) {
      return null;
    }
    stateChanged = false;
    return loadReadingList(storeName);
  };

  export const remove = (storeName: string, i: number): Link[] => {
    var readList: Link[] = loadReadingList(storeName);
    readList.splice(i, 1);

    localStorage.setItem(storeName, JSON.stringify(readList));
    return readList;
  };

  export const elementAt = (storeName: string, i: number): Link => {
    return loadReadingList(storeName)[i];
  };

  export const addToStoredList = (storeName: string, link: Link): void => {
    stateChanged = true;
    var readList: Link[] = loadReadingList(storeName);
    readList.push(link);
    localStorage.setItem(storeName, JSON.stringify(readList));
    readListStorage.saveListToRemote(readList);
  };
}
