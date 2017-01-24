import * as React from 'react';
import * as axios from 'axios';

import {Feed, FeedComponent} from './feed';

const styles = {
  container: {
    margin: '1rem'
  },
  h2: {
    fontWeight: 300,
    fontSize: '1.5rem'
  },
  feeds: {
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'wrap',
    justifyContent: 'space-around'
  }
};

interface IFeedsProps {};

interface IFeedsState {
  feeds: Feed[];
};

export class Feeds extends React.Component<IFeedsProps, IFeedsState> {
  constructor() {
    super();
    this.state = {feeds: []};
  }

  componentDidMount() {
    axios
      .get('app/feeds/feeds.json')
      .then((response: Axios.AxiosXHR<Feed[]>) => {
        const feeds = response.data;
        var feedsWithContent = feeds.map(f => {
          var feed = new Feed(f.url);
          feed.loadFeedContent();
          return feed;
        });

        this.setState({feeds: feedsWithContent});
      });
  }

  render() {
    return (
      <div style={styles.container}>
        <div style={styles.feeds as any}>
          {this.state.feeds.map((feed: Feed, i: number) => (
            <FeedComponent key={i} feed={feed}/>
          ))}
        </div>
      </div>
    );
  }
}
