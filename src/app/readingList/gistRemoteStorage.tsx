import * as axios from 'axios';

export class GistRemoteStorage {
  public receivedPromise: Axios.IPromise<{}>;
  public dataFetched: boolean = false;

  private gistUrl: string = 'https://api.github.com/gists/1d800438c2edee3e07e547a3d4d20ef1';

  public getDataFromRemote = () => {
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
