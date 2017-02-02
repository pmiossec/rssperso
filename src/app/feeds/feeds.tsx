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

interface IFeedsProps {};

interface IFeedsState {
  feeds: string[];
};

export class Feeds extends React.Component<IFeedsProps, IFeedsState> {
  constructor() {
    super();
    this.state = {feeds: []};
  }

  componentWillMount(): void {
    axios
      .get('app/feeds/feeds.json')
      .then((response: Axios.AxiosXHR<string[]>) => {
        this.setState({feeds: response.data});
      });
  }

  render() {
    return (
      <div style={styles.container}>
        <div style={styles.feeds as any}>
          {this.state.feeds.map((url: string, i: number) =>
              <FeedComponent key={i} url={url}/>
          )}
        </div>
      </div>
    );
  }
}
