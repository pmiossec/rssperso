import * as React from 'react';
import { GistStorage, Gist, FeedData } from './storage/gistStorage';
import { FeedService } from './feeds/feedService';
import { Feed } from './feeds/feed';
import { ReadingList } from './readingList/readingList';
import { NotificationContainer } from 'react-notifications';
import 'react-notifications/lib/notifications.css';

interface IMainProps {}
interface IMainState {
  data: Gist;
  store: GistStorage;
}

export class Main extends React.Component<IMainProps, IMainState> {
  componentDidMount() {
    const store = new GistStorage();
    store.loadGist().then(data => {
      this.setState({ store, data });
    });
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
    return text.split('').reduce((a, b) => {  a = (a << 5) - a + b.charCodeAt(0); return a & a; }, 0);
  }

  render() {
    if (this.state === null) {
      return <div>loading feeds...</div>;
    }

    return (
      <main className="feeds">
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
              feed={
                new FeedService(
                  feed,
                  new Date(this.state.data.state.updates[feed.id]),
                  this.state.store,
                  feed.noCorsProxy
                )
              }
              unsecured={feed.notSecured}
            />
          )}
        </div>
        <ReadingList data={this.state.data} store={this.state.store} />
      </main>
    );
  }
}
