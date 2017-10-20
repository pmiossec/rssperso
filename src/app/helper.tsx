import { Link } from './feeds/news';
import { BlobRemoteStorage } from './readingList/blobRemoteStorage';
import { GistRemoteStorage } from './readingList/gistRemoteStorage';

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

interface Gist {
  feeds: FeedData[];
  state: State;
  readList: ReadListItem[];
}

interface FeedData {
  id: string;
  name: string;
  url: string;
  icon: string;
}
interface Feeds {
  feeds: FeedData[];
}

interface FeedState {
  id: string;
  date: Date | null;
}

interface State {
  last_update: Date;
  updates: { [feedid: string]: FeedState};
}

interface ReadListItem {
  id: string | null;
  title: string;
  url: string;
  publicationDate: Date;
}

interface GistFileContent {
  filename: string;
  type: string;
  language: string;
  raw_url: string;
  size: string;
  truncated: string;
  content: string;
}

interface GistStorage {
  files: { [fileId: string]: GistFileContent; };
}

export namespace Storage {

  const gistStorage: GistRemoteStorage = new GistRemoteStorage();
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

  const loadGist = (): Axios.IPromise<Gist> => {
    return gistStorage.getDataFromRemote().then((data: GistStorage) => {
      var feeds = (JSON.parse(data.files['feed.json'].content) as Feeds).feeds;
      var state = JSON.parse(data.files['state.json'].content) as State;
      var readList = JSON.parse(data.files['readlist.json'].content) as ReadListItem[];
      // var archive = JSON.parse(data.files['archive.json'].content) as ReadList;
      return {feeds, state, readList};
    });
  };

  const loadReadingList = async (storeName: string): Promise<Link[]> => {
    const gist = await loadGist();
    // tslint:disable
    console.log('gist', gist);

    console.log(gist.readList[9].title);
    console.log(gist.feeds[9].id);
    console.log(gist.state.last_update);
    console.log(gist.state.updates[gist.feeds[9].url]);

    // tslint:enable

    var p = new Promise<Link[]>((resolve, reject) => {
      const remoteStore = GetStore(storeName);
      if (!remoteStore.dataFetched) {
        remoteStore.getDataFromRemote()
          .then((links: Link[]) => {
            const linksSorted = links.sort((n1, n2) => n2.publicationDate.getTime() - n1.publicationDate.getTime());
            localStorage.setItem(storeName, JSON.stringify(linksSorted));
            resolve(linksSorted);
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
