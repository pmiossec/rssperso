import * as React from 'react';
import * as axios from 'axios';

import {FeedComponent} from './feed';

const styles = {
  container: {
  },
  h2: {
    fontWeight: 300,
  },
  feeds: {
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'wrap',
    justifyContent: 'space-around'
  }
};

interface IFeedsProps {
  feeds: string[];
};

interface IFeedsState {
};

export class Feeds extends React.Component<IFeedsProps, IFeedsState> {
  render() {
    return (
      <div style={styles.container}>
        <div style={styles.feeds as any}>
          {this.props.feeds.map((url: string, i: number) =>
              <FeedComponent key={i} url={url}/>
          )}
        </div>
      </div>
    );
  }
}
