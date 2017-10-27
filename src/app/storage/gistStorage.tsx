import * as axios from 'axios';
import { NotificationManager } from 'react-notifications';

export interface Gist {
  feeds: FeedData[];
  state: State;
  readList: ReadListItem[];
}

export interface FeedData {
  id: string;
  name: string;
  url: string;
  icon: string;
}

interface Feeds {
  feeds: FeedData[];
}

export interface State {
  last_update: Date;
  updates: { [feedid: string]: Date };
}

export interface ReadListItem {
  idFeed: string;
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
        var state = JSON.parse(data.files['state.json'].content) as State;
        var readList = (JSON.parse(data.files['readlist.json'].content) as ReadListItem[])
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
    // tslint:disable-next-line:no-console
    // console.info('reading list saved ;)', content);
    this.saveDataInLocalStorage();
    return axios.default.patch(this.gistUrl, content)
      .then((response: axios.AxiosResponse<{}>) => {
        // this.shouldBeSaved = false;
        // tslint:disable-next-line:no-console
        //  console.info('reading list saved ;)');
        NotificationManager.info('Successfully saved update', 'Update', 200);
      })
      .catch(err => {
        NotificationManager.error('Failed to save update', 'Update', 3000);
        // tslint:disable-next-line:no-console
        console.error('err saving state:', err);
        throw err;
      });
  }

    public saveFeedsState = (feedId: string, title: string, date: Date) => {
      this.data.state.updates[feedId] = date;
      this.saveFileToGist({
        description : `Update publication date for feed "${title}"`,
        files: {
          'state.json': { content: JSON.stringify(this.data.state)}
        }
      });
    }

  private saveReadingList = (readingList: ReadListItem[], description: string) => {
    return this.saveFileToGist({
      description: description && 'Update reading list',
      files: {
        'readlist.json': { content: JSON.stringify(readingList) }
      }
    });
  }

  public addItemToReadingList = (item: ReadListItem) => {
    // tslint:disable-next-line:no-console
    // console.log('old reading list', this.data.readList);

    if (this.data.readList.findIndex(i => i.url === item.url) > 0) {
      NotificationManager.warning('Link already in the reading list...', 'Add link', 1000);
      return;
    }

    this.data.readList.push(item);
    // tslint:disable-next-line:no-console
    // console.log('new reading list', this.data.readList);
    this.saveReadingList(this.data.readList, 'Add item "' + item.title + '"')
      // tslint:disable-next-line:no-empty
      .catch(() => { });
  }

  public removeItemFromReadingList = (item: ReadListItem): void => {

      var indexFound = this.data.readList.findIndex((i) => { return i.url === item.url; });
      if (indexFound !== -1) {
      const readingList = [...this.data.readList];
      readingList.splice(itemIndex, 1);
      this.saveReadingList(readingList, 'Removing item "' + item.title + '"')
        .then(() => {
          this.data.readList = readingList;
          this.lastItemRemoved = item;
        })
        // tslint:disable-next-line:no-empty
        .catch(() => { });
    }
  }

  public restoreLastRemoveReadingItem = () => {
    if (this.lastItemRemoved != null) {
      this.data.readList.push(this.lastItemRemoved);
      this.saveReadingList(this.data.readList, 'Restoring item "' + this.lastItemRemoved.title + '"')
        // tslint:disable-next-line:no-empty
        .catch(() => { });
      this.lastItemRemoved = null;
    }
  }

  public couldBeRestored = () => this.lastItemRemoved != null;

  private saveDataInLocalStorage() {
    localStorage.setItem('rssPerso', JSON.stringify(this.data));
  }
}
