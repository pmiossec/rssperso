import * as axios from 'axios';
import { NotificationManager } from 'react-notifications';

export interface Gist {
  feeds: FeedData[];
  state: State;
  readList: ReadListItem[];
}

export interface FeedData {
  id: number;
  name: string;
  url: string;
  icon: string;
  noCorsProxy?: boolean;
  notSecured?: boolean;
}

interface Feeds {
  feeds: FeedData[];
}

export interface State {
  last_update: Date;
  updates: { [feedid: string]: Date };
}

export interface ReadListItem {
  idFeed: number;
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

interface Storage {
  files: { [fileId: string]: GistFileContent; };
}
interface GistFileUpdate {
  content: string;
}
interface GistUpdate {
  description: string;
  files: { [fileId: string]: GistFileUpdate; };
}

const FeedStateFileKey: string = 'state.json';
const ReadingListFileKey: string = 'readlist.json';

export class GistStorage {
  public receivedPromise: axios.AxiosPromise<{}>;
  public dataFetched: boolean = false;

  private data: Gist;
  private gistUrl: string = 'aHR0cHM6Ly9hcGkuZ2l0aHViLmNvbS9naXN0cy8xZDgwMDQzOGMyZWRlZTNlMDdlNTQ3YTNkNGQ'
  + 'yMGVmMT9hY2Nlc3NfdG9rZW49MzAzNzJiMmNkOWQ5NDdmZjhjODg5MWIzMTUzNDA1MTNmMjJkMTEzNw=';

  private lastItemRemoved: ReadListItem | null;
  constructor() {
    this.gistUrl = this.goodOne(this.gistUrl);
  }

  private goodOne = (str: string): string => {
    return atob(str + '=');
  }

  public loadGist = (): Promise<Gist> => {
    return this.getDataFromRemote()
      .then((data: Storage) => {
        var feeds = (JSON.parse(data.files['feed.json'].content) as Feeds).feeds;
        var state = JSON.parse(data.files[FeedStateFileKey].content) as State;
        var readList = (JSON.parse(data.files[ReadingListFileKey].content) as ReadListItem[])
          .map(i => { return {
             idFeed: i.idFeed,
             title: i.title,
             url: i.url,
             publicationDate: new Date(i.publicationDate) }; })
          .sort((i1, i2) => {
             return i2.publicationDate.getTime() - i1.publicationDate.getTime();
          });
        this.data = { feeds, state, readList };
        this.saveDataInLocalStorage();
        return this.data;
      })
      .catch(err => {
        NotificationManager.error('Failed to load the gist. Loading previous data!!!!', 'Loading data', 5000);
        this.data = JSON.parse(localStorage.getItem('rssPerso')!) as Gist;
        return this.data;
      });
  }

  private getDataFromRemote = () => {
    return axios.default.get(this.gistUrl)
      .then((response: axios.AxiosResponse<{}>) => {
        this.dataFetched = true;
        const data = response.data;
        return data;
      })
      .catch(err => {
        // tslint:disable-next-line:no-console
        console.log('err fetching online state:', err);
        return {};
      });
  }

  private saveFileToGist = (content: GistUpdate) => {
    this.saveDataInLocalStorage();
    return axios.default.patch(this.gistUrl, content)
      .then((response: axios.AxiosResponse<{}>) => {
        // this.shouldBeSaved = false;
        NotificationManager.info('Successfully saved update', 'Update', 200);
      })
      .catch(err => {
        NotificationManager.error('Failed to save update', 'Update', 3000);
        // tslint:disable-next-line:no-console
        console.error('err saving state:', err);
        throw err;
      });
  }

  public updateFeedState = (feedId: number, date: Date) => {
    this.data.state.updates[feedId] = date;
  }

  public saveFeedsState = (feedId: number, title: string, date: Date) => {
    this.updateFeedState(feedId, date);
    this.data.state.last_update = new Date();
    this.saveFileToGist({
      description : `Update publication date for feed "${title}"`,
      files: {
        [FeedStateFileKey]: { content: JSON.stringify(this.data.state)}
      }
    });
  }

  private saveReadingList = (readingList: ReadListItem[], description: string, state: State | null = null) => {
    let filesToSave = {[ReadingListFileKey] : { content: JSON.stringify(readingList) }};

    if (state !== null) {
      this.data.state.last_update = new Date();
      filesToSave[FeedStateFileKey] = { content: JSON.stringify(this.data.state) };
    }
    return this.saveFileToGist({
          description: description && 'Update reading list',
          files: filesToSave
        });
  }

  public addItemToReadingList = (item: ReadListItem, saveAlsoFeedState: boolean) => {
    NotificationManager.info('Adding to reading list', 'Reading list', 200);

    if (this.data.readList.findIndex(i => i.url === item.url) > 0) {
      NotificationManager.warning('Link already in the reading list...', 'Add link', 1000);
      return;
    }

    this.data.readList.push(item);
    this.saveReadingList(this.data.readList, 'Add item "' + item.title + '"',
                         saveAlsoFeedState ? this.data.state : null)
      // tslint:disable-next-line:no-empty
      .catch(() => { });
  }

  public removeItemFromReadingList = (item: ReadListItem): void => {
    NotificationManager.info('Removing from reading list', 'Reading list', 200);
    var indexFound = this.data.readList.findIndex((i) => { return i.url === item.url; });
    if (indexFound !== -1) {
      const readingList = [...this.data.readList];
      this.data.readList.splice(indexFound, 1);
      this.saveReadingList(readingList, 'Removing item "' + item.title + '"')
        .then(() => {
          this.lastItemRemoved = item;
        })
        .catch(() => {
          this.data.readList.splice(indexFound, 0, item);
         });
    }
  }

  public restoreLastRemoveReadingItem = () => {
    if (this.lastItemRemoved != null) {
      this.data.readList.push(this.lastItemRemoved);
      this.saveReadingList(this.data.readList, 'Restoring item "' + this.lastItemRemoved.title + '"')
        .then(() => { this.lastItemRemoved = null; })
        // tslint:disable-next-line:no-empty
        .catch(() => { });
    }
  }

  public couldBeRestored = () => this.lastItemRemoved != null;

  private saveDataInLocalStorage() {
    localStorage.setItem('rssPerso', JSON.stringify(this.data));
  }
}
