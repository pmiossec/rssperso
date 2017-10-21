import * as axios from 'axios';

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

export interface FeedState {
  id: string;
  date: Date | null;
}

export interface State {
  last_update: Date;
  updates: { [feedid: string]: FeedState};
}

export interface ReadListItem {
  id: string;
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

export class GistStorage {
  public receivedPromise: Axios.IPromise<{}>;
  public dataFetched: boolean = false;

  private gistUrl: string = 'https://api.github.com/gists/1d800438c2edee3e07e547a3d4d20ef1';

  public loadGist = (): Axios.IPromise<Gist> => {
    return this.getDataFromRemote().then((data: Storage) => {
      var feeds = (JSON.parse(data.files['feed.json'].content) as Feeds).feeds;
      var state = JSON.parse(data.files['state.json'].content) as State;
      var readList = JSON.parse(data.files['readlist.json'].content) as ReadListItem[];
      // var archive = JSON.parse(data.files['archive.json'].content) as ReadList;

      // tslint:disable
      // console.log('gist', gist);
      // console.log(gist.readList[9].title);
      // console.log(gist.feeds[9].id);
      // console.log(gist.state.last_update);
      // console.log(gist.state.updates[gist.feeds[9].url]);
      // tslint:enable

      return {feeds, state, readList};
    });
  }

  private getDataFromRemote = () => {
    return axios.get(this.gistUrl)
      .then((response: Axios.AxiosXHR<{}>) => {
        this.dataFetched = true;
        const data = response.data;
        // console.log('data fetched', data);
        return data;
      })
      .catch(err => {
        // tslint:disable-next-line:no-console
        console.log('err fetching online state:', err);
        return {};
      });
  }

  public saveDataToRemote = (list: {}) => {
    axios.put(this.gistUrl, list)
      .then((response: Axios.AxiosXHR<{}>) => {
        // this.shouldBeSaved = false;
        // console.log('reading list saved ;)');
      })
      .catch(err => {
        // tslint:disable-next-line:no-console
        console.log('err saving state:', err);
      });
    }
}
