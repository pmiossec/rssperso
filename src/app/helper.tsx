import { Link } from './feeds/news';
import { BlobRemoteStorage } from './readingList/blobRemoteStorage';

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

export const ReadingListKey: string = 'ReadingList';
export const ArchiveListKey: string = 'ArchiveList';

export namespace Storage {

  const readListStorage: BlobRemoteStorage = new BlobRemoteStorage('4013cc1f-0657-11e7-a0ba-8deb10d7638f');
  const archiveListStorage: BlobRemoteStorage = new BlobRemoteStorage('1a115a19-06a3-11e7-a0ba-399ae9b7d9b1');
  var stateChanged: boolean = true;
  const dateTimeReviver = (key: string, value: string): Date | string => {
    if (key === 'publicationDate') {
      return new Date(value);
    }
    return value;
  };

  const GetStore = (storeName: string): BlobRemoteStorage => {
    if (storeName === ReadingListKey) {
      return readListStorage;
    }
    return archiveListStorage;
  };

  const loadReadingList = (storeName: string): Promise<Link[]> => {
    var p = new Promise<Link[]>((resolve, reject) => {
      const remoteStore = GetStore(storeName);
      if (!remoteStore.dataFetched) {
        remoteStore.getDataFromRemote()
          .then((data: Link[]) => {
            localStorage.setItem(storeName, JSON.stringify(data));
            resolve(data);
          })
          .catch(() => {
            resolve([]);
          });
      } else {
        const item = localStorage.getItem(storeName);
        if (item == null) {
          resolve([]);
        } else {
          resolve(JSON.parse(item, dateTimeReviver) || []);
        }
      }
    });
    return p;
  };

  export const loadReadingListIfChanged = (storeName: string): Promise<Link[]> => {
    if (!stateChanged) {
      return new Promise<Link[]>((resolve, reject) => { resolve(Link[0]); });
    }
    stateChanged = false;
    return loadReadingList(storeName);
  };

  export const remove = (storeName: string, i: number): Promise<Link[]> => {
    return loadReadingList(storeName).then((linkList: Link[]) => {
      linkList.splice(i, 1);

      localStorage.setItem(storeName, JSON.stringify(linkList));

      GetStore(storeName).saveDataToRemote(linkList);
      return linkList;
    });
  };

  export const elementAt = (storeName: string, i: number): Promise<Link> => {
    return loadReadingList(storeName).then((linkList: Link[]) => {
      // console.log('here', linkList, linkList[i]);
      return linkList[i];
    });
  };

  export const addToStoredList = (storeName: string, link: Link): void => {
    stateChanged = true;
    loadReadingList(storeName).then((linkList: Link[]) => {
      linkList.push(link);
      localStorage.setItem(storeName, JSON.stringify(linkList));
      GetStore(storeName).saveDataToRemote(linkList);
    });
  };
}
