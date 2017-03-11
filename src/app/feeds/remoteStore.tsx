import * as axios from 'axios';

export class RemoteStore {
  public jsonStoreUrl: string = 'https://jsonblob.com/api/jsonBlob';
  public jsonStoreBlobUrl: string = 'https://jsonblob.com/api/jsonBlob/ebba8dc9-0378-11e7-a0ba-7f55dedc152c';
  public receivedPromise: Axios.IPromise<any>;

  private aLongLongTimeAgo: Date = new Date(1900, 1, 1);
  private shouldBeSaved: boolean = false;
  private state: any;

  constructor() {
    this.receivedPromise = this.getRemoteState();
  }

  public updateFeedDate = (url: string, date: Date) => {
    if (!this.state || !this.state.updates) {
      this.state = {
        updates: {}
      };
    }
    this.state.updates[url] = date;
    if (!this.state.last_update || this.state.last_update < date) {
      this.state.last_update = date;
    }
    if (!this.shouldBeSaved) {
      setTimeout(this.updateState, 5000);
      this.shouldBeSaved = true;
    }
  }

  public getDateForFeed = (url: string): Date => {
    if (!this.state) {
      return this.aLongLongTimeAgo;
    }
    if (this.state.updates[url]) {
      return new Date(this.state.updates[url]);
    }
    return this.aLongLongTimeAgo;
  }

  public getRemoteState = () => {
    return axios.get(this.jsonStoreBlobUrl)
      .then((response: Axios.AxiosXHR<any>) => {
        this.state = response.data;
        console.log('data fetched', this.state);
        return this.state;
      })
      .catch(err => {
        console.log('err fetching online state:', err);
        return {
          last_update: this.aLongLongTimeAgo,
          updates: {}
        };
      });
  }

  public updateState = () => {
    if (!this.shouldBeSaved) {
      return;
    }
    axios.put(this.jsonStoreBlobUrl, this.state)
      .then((response: Axios.AxiosXHR<any>) => {
        this.shouldBeSaved = false;
        console.log('data saved ;)');
      })
      .catch(err => {
        console.log('err saving state:', err);
      });
    }
}
