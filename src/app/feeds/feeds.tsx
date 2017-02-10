import * as React from 'react';

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

export const Feeds = (props: IFeedsProps) => {
  return (
    <div style={styles.container}>
      <div style={styles.feeds as any}>
        {props.feeds.map((url: string, i: number) =>
            <FeedComponent key={i} url={url}/>
        )}
      </div>
    </div>
  );
};
