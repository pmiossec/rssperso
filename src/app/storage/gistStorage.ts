import * as axios from 'axios';
import { NotificationManager } from 'react-notifications';

export interface Gist {
  feeds: FeedData[];
  state: State;
  readList: ReadListItem[];
  revisionCount: number;
}

export interface FeedData {
  id: number;
  name: string;
  url: string;
  icon: string;
  noCorsProxy?: boolean;
  notSecured?: boolean;
  enhance?: boolean;
  filter?: string;
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

interface GistFilesContent {
  [fileId: string]: GistFileContent;
}

interface Storage {
  files: GistFilesContent;
  history: {}[];
}

interface GistFileUpdate {
  content: string;
}
interface GistUpdate {
  description: string;
  files: { [fileId: string]: GistFileUpdate };
}

const FeedStateFileKey: string = 'state.json';
const ReadingListFileKey: string = 'readlist.json';

export class GistStorage {
  public receivedPromise: axios.AxiosPromise<{}>;
  public dataFetched: boolean = false;

  private data: Gist;
  private gistUrl: string = 'aHR0cHM6Ly9hcGkuZ2l0aHViLmNvbS9naXN0cy8xZDgwMDQzOGMyZWRlZTNlMDdlNTQ3YTNkNGQ' +
    'yMGVmMT9hY2Nlc3NfdG9rZW49MzAzNzJiMmNkOWQ5NDdmZjhjODg5MWIzMTUzNDA1MTNmMjJkMTEzNw=';

  private lastItemRemoved: ReadListItem | null;
  constructor() {
    this.gistUrl = this.goodOne(this.gistUrl);
  }

  private goodOne = (str: string): string => {
    return atob(str + '=');
  }

  public loadGist = (): Promise<Gist> => {
    return this.getDataFromRemote()
      .then(data => {
        if (data === null) {
          return {} as Gist;
        }
        this.data = {
          feeds: this.getFeedsData(data.files),
          state: this.getFeedStateData(data.files),
          readList: this.getReadingListData(data.files),
          revisionCount: data.history.length
        };
        this.saveDataInLocalStorage();
        // tslint:disable-next-line:no-console
        // console.log('data from gist received:', this.data);

        return this.data;
      })
      .catch(err => {
        NotificationManager.warning(
          'Loading data from cache...',
          'Loading data',
          3000
        );
        this.data = JSON.parse(localStorage.getItem('rssPerso')!) as Gist;
        return this.data;
      });
  }

  //#region Convert gist data
  private getFeedsData = (data: GistFilesContent) => (JSON.parse(data['feed.json'].content) as Feeds).feeds;

  private getFeedStateData = (data: GistFilesContent) => {
    const state = (JSON.parse(data[FeedStateFileKey].content) as State);
    state.last_update = new Date(state.last_update);
    Object.keys(state.updates).forEach(k => state.updates[k] = new Date(state.updates[k]));
    return state;
  }

  private getReadingListData = (data: GistFilesContent) => {
    return this.sortListByFeed((JSON.parse(
      data[ReadingListFileKey].content
    ) as ReadListItem[])
      .map(i => {
        return {
          idFeed: i.idFeed,
          title: i.title,
          url: i.url,
          publicationDate: new Date(i.publicationDate)
        };
      }));
  }
  //#endregion

  private getDataFromRemote = () => {
    return axios.default
      .get(this.gistUrl)
      .then((response: axios.AxiosResponse<Storage>) => {
        this.dataFetched = true;
        const data = response.data;
        return data;
      })
      .catch(err => {
        // tslint:disable-next-line:no-console
        console.error('Failed to load the gist.', err);
        NotificationManager.error(
          'Failed to load the gist:' + err,
          'Error fetching',
          25000
        );
        return null;
      });
  }

  private saveFileToGist = (content: GistUpdate) => {
    this.saveDataInLocalStorage();
    return axios.default
      .patch(this.gistUrl, content)
      .then((response: axios.AxiosResponse<Storage>) => {
        const newRevisionCount = response.data.history.length;
        if (newRevisionCount > this.data.revisionCount + 1) {
          NotificationManager.warning(
            'Probable data loss. Please refresh!!',
            'Data lost',
            3000
          );
        }
        this.data.revisionCount = newRevisionCount;
        this.data.readList = this.getReadingListData(response.data.files);
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
      description: `Update publication date for feed "${title}"`,
      files: {
        [FeedStateFileKey]: { content: JSON.stringify(this.data.state) }
      }
    });
  }

  private saveReadingList = (
    readingList: ReadListItem[],
    description: string,
    state: State | null = null
  ) => {
    let filesToSave = {
      [ReadingListFileKey]: { content: JSON.stringify(readingList) }
    };

    if (state !== null) {
      this.data.state.last_update = new Date();
      filesToSave[FeedStateFileKey] = {
        content: JSON.stringify(this.data.state)
      };
    }
    return this.saveFileToGist({
      description: description && 'Update reading list',
      files: filesToSave
    });
  }

  public addItemToReadingList = (
    item: ReadListItem,
    saveAlsoFeedState: boolean
  ) => {
    NotificationManager.info('Adding to reading list', 'Reading list', 200);

    if (this.data.readList.findIndex(i => i.url === item.url) > 0) {
      NotificationManager.warning(
        'Link already in the reading list...',
        'Add link',
        1000
      );
      return;
    }

    this.data.readList.push(item);
    this.saveReadingList(
      this.data.readList,
      'Add item "' + item.title + '"',
      saveAlsoFeedState ? this.data.state : null
    )
      // tslint:disable-next-line:no-empty
      .catch(() => {});
  }

  public removeItemFromReadingList = (item: ReadListItem): void => {
    const msg = 'Removing "' + item.title + '" from reading list';
    NotificationManager.warning(msg, 'Reading list', 3000);
    var indexFound = this.data.readList.findIndex(i => {
      return i.url === item.url;
    });
    if (indexFound !== -1) {
      this.data.readList.splice(indexFound, 1);
      this.saveReadingList(this.data.readList, msg)
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
      this.saveReadingList(
        this.data.readList,
        'Restoring item "' + this.lastItemRemoved.title + '"'
      )
        .then(() => {
          this.lastItemRemoved = null;
        })
        // tslint:disable-next-line:no-empty
        .catch(() => {});
    }
  }

  public couldBeRestored = () => this.lastItemRemoved != null;

  private saveDataInLocalStorage = () => {
    localStorage.setItem('rssPerso', JSON.stringify(this.data));
  }

  public sortListByDate = (readList: ReadListItem[]) => {
    return readList.sort((i1, i2) => {
      return (
        i2.publicationDate.getTime() -
        i1.publicationDate.getTime()
      );
    });
  }

  public sortListByFeed = (readList: ReadListItem[]) => {
    return readList.sort((i1, i2) => {
      if (i1.idFeed === i2.idFeed) {
        return i2.publicationDate.getTime() - i1.publicationDate.getTime();
      }
      return i1.idFeed - i2.idFeed;
    });
  }
}
