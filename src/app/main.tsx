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
  feedServices: FeedService[];
}

export class Main extends React.Component<IMainProps, IMainState> {
  private isUpdated: boolean = false;
  private refreshTimer: number;
  private darkModeEnabled: boolean;
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
    this.darkModeEnabled = window.location.search.indexOf('dark') !== -1;
    document.addEventListener('visibilitychange', this.handleVisibilityChange, false);
    const store = new GistStorage(this.GetFeed());
    store.loadGist().then(data => {

    const feedServices = data.feeds.map((feed: FeedData) =>
      new FeedService(
        feed,
        data.state.updates[feed.id],
        store
      )
    );
    this.setState({ store, data, feedServices });
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

  displayAllLinks = (feedService: FeedService) => {
    return () => {
      feedService.displayAllLinks();
      this.forceUpdate();
    };
  }

  handleVisibilityChange = () => {
    if (!document.hidden && this.isUpdated) {
      location.reload();
    }
  }

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

    return (
      <main className={this.darkModeEnabled ? 'dark' : 'light'}>
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
            {this.state.feedServices.map((feedService: FeedService, i: number) =>
              <Feed
                key={feedService.feedData.id}
                id={i}
                feed={feedService}
                unsecured={feedService.feedData.notSecured}
              />
            )}
          </div>
          <ReadingList data={this.state.data} store={this.state.store} />
        </div>
        <div>
        {this.state.feedServices.map((feedService: FeedService, i: number) =>
              <img
                key={feedService.feedData.id}
                src={feedService.logo}
                height="16"
                width="16"
                onClick={this.displayAllLinks(feedService)}
                title={feedService.title}
              />
            )}
        </div>
      </main>
    );
  }
}
