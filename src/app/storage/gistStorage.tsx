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
  updates: { [feedid: string]: Date};
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
  public receivedPromise: Axios.IPromise<{}>;
  public dataFetched: boolean = false;

  private data: Gist;
  private gistUrl: string = 'aHR0cHM6Ly9hcGkuZ2l0aHViLmNvbS9naXN0cy8xZDgwMDQzOGMyZWRlZTNlMDdlNTQ3YTNkNGQ'
  + 'yMGVmMT9hY2Nlc3NfdG9rZW49MzAzNzJiMmNkOWQ5NDdmZjhjODg5MWIzMTUzNDA1MTNmMjJkMTEzNw=';

  constructor() {
    this.gistUrl = this.goodOne(this.gistUrl);
  }

  private goodOne = (str: string): string => {
    return atob(str + '=');
  }

  public loadGist = (): Axios.IPromise<Gist> => {
    return this.getDataFromRemote().then((data: Storage) => {
      var feeds = (JSON.parse(data.files['feed.json'].content) as Feeds).feeds;
      var state = JSON.parse(data.files['state.json'].content) as State;
      var readList = JSON.parse(data.files['readlist.json'].content) as ReadListItem[];
      this.data = {feeds, state, readList};
      return this.data;
    });
  }

  private getDataFromRemote = () => {
    return axios.get(this.gistUrl)
      .then((response: Axios.AxiosXHR<{}>) => {
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
    axios.patch(this.gistUrl, content)
      .then((response: Axios.AxiosXHR<{}>) => {
        // this.shouldBeSaved = false;
         // tslint:disable-next-line:no-console
        //  console.info('reading list saved ;)');
         NotificationManager.info('Successfully saved update', 'Update', 200);
        })
      .catch(err => {
        NotificationManager.error('Failed to save update', 'Update', 3000);
        // tslint:disable-next-line:no-console
        console.error('err saving state:', err);
      });
    }

    public saveFeedsState = (feedId: string, date: Date) => {
      this.data.state.updates[feedId] = date;
      this.saveFileToGist({
        description : `Update publication date for feed "${feedId}"`,
        files: {
          'state.json': { content: JSON.stringify(this.data.state)}
        }
      });
    }

    private saveReadingList = (readingList: ReadListItem[], description: string) => {
      this.saveFileToGist({
        description : description && 'Update reading list',
        files: {
          'readlist.json': { content: JSON.stringify(readingList)}
        }
      });
    }

    public addItemToReadingList = (item: ReadListItem) => {
      // tslint:disable-next-line:no-console
      // console.log('old reading list', this.data.readList);
      this.data.readList.push(item);
      // tslint:disable-next-line:no-console
      // console.log('new reading list', this.data.readList);
      this.saveReadingList(this.data.readList, 'Add item "' + item.title + '"');
    }

    public removeItemFromReadingList = (itemIndex: number, item: ReadListItem): void => {

      if (itemIndex < this.data.readList.length && this.data.readList[itemIndex].url === item.url) {
        this.data.readList.splice(itemIndex, 1);
        this.saveReadingList(this.data.readList, 'Removing item "' + item.title + '"');
      }
    }
}
