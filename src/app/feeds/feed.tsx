import * as React from 'react';

export class Feed {
  constructor(
    public url: string,
    public logo: string,
    public string: string,
  ) {}
}

const styles = {
  feed: {
    height: '15rem',
    width: '15rem',
    border: '1px solid lightgray',
    borderRadius: '1rem',
    margin: '1rem',
    padding: '1rem'
  },
  logo: {
    width: '5rem',
    height: '5rem',
    float: 'right',
    margin: '0 0 .5rem .5rem'
  },
  h3: {
    fontSize: '1.5rem',
    margin: '0 0 2rem 0'
  }
};

interface IFeedProps {
  key: number;
  feed: Feed;
};

interface IFeedState {};

export class FeedComponent extends React.Component<IFeedProps, IFeedState> {
  static propTypes = {
    feed: React.PropTypes.object.isRequired
  };

  render() {
    return (
      <div>
        <h3 style={styles.h3}>
          {this.props.feed.url}
        </h3>
      </div>
    );
  }
}
