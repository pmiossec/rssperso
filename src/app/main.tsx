import * as React from 'react';
import { GistStorage, Gist, FeedData } from './storage/gistStorage';
import { FeedService } from './feeds/feedService';
import { Feed } from './feeds/feed';
import { ReadingList } from './readingList/readingList';
import { NotificationContainer } from 'react-notifications';
import 'react-notifications/lib/notifications.css';

interface IMainProps { }
interface IMainState {
  data: Gist;
  store: GistStorage;
}

export class Main extends React.Component<IMainProps, IMainState> {
  private isUpdated: boolean = false;
  private refreshTimer: number;
  GetFeed(): string {
    const feeds: string[] = [
      '1d800438c2edee3e07e547a3d4d20ef1' , // Philippe
      '774782376fbd8d01a8bc2669cdbf6096' // Khanh
    ];

    if (window.location.search.indexOf('khanh') !== -1) {
      return feeds[1];
    }
    return feeds[0];
  }

  componentWillMount() {
    const store = new GistStorage(this.GetFeed());
    store.loadGist().then(data => {
      this.setState({ store, data });
    });
    this.refreshTimer = window.setInterval(
      () => store.isGistUpdated().then(isUpdated => {
        if (isUpdated) {
          this.isUpdated = true;
          window.clearInterval(this.refreshTimer);
          this.forceUpdate();
        }
      }),
      1000 * 60
    );
  }

  // clearAll = () => {
  //   this.state.data.feeds.forEach(f => f.clearFeed());
  //   this.forceUpdate();
  // }

  // displayAll = () => {
  //   this.state.data.feeds.forEach(f => f.displayAllLinks());
  //   this.forceUpdate();
  // }

  hashCode = (text: string) => {
    // tslint:disable-next-line:no-bitwise
    return text.split('').reduce((a, b) => { a = (a << 5) - a + b.charCodeAt(0); return a & a; }, 0);
  }

  render() {
    if (this.state === null) {
      return (
      <div className="loading">
        <div>loading feeds...</div>
        <div className="spinner">&#9676;</div>
      </div>);
    }

    if (this.isUpdated) {
      return <a href="#" onClick={() => location.reload()}> Is Updated => should refresh!!!</a>;
    }

    const darkModeEnabled = window.location.search.indexOf('dark') !== -1;

    return (
      <main className={darkModeEnabled ? 'dark' : 'light'}>
        <div className="feeds">
          <NotificationContainer />
          {/* <div className="displayModes">
          <a onClick={this.clearAll}>Clear All</a> / <a onClick={this.displayAll}>Show All</a>
        </div> */}
          {/* <div>
        {this.state.data.feeds.map((feed: FeedData, i: number) =>
             <img key={i} src={feed.icon} height="16px" alt={feed.name} />
          )}
        </div> */}
          <div className="feeds">
            {this.state.data.feeds.map((feed: FeedData, i: number) =>
              <Feed
                key={feed.id}
                id={i}
                feed={
                  new FeedService(
                    feed,
                    this.state.data.state.updates[feed.id],
                    this.state.store
                  )
                }
                unsecured={feed.notSecured}
              />
            )}
          </div>
          <ReadingList data={this.state.data} store={this.state.store} />
        </div>
      </main>
    );
  }
}
