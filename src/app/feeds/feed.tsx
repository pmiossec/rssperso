import * as React from 'react';
import {FeedService} from './feedService';
import {News, Link} from './news';

interface IFeedProps {
  key: number;
  url: string;
};

interface IFeedState {
  feed: FeedService;
};

export class Feed extends React.Component<IFeedProps, IFeedState> {

  shouldDisplayEmptyFeeds: boolean = false;
  constructor(props: IFeedProps) {
    super(props);
    this.state = {
      feed: new FeedService('Loading!')
    };
  }

  componentWillMount(): void {
    this.loadFeed();
    setInterval(() => this.loadFeed(), 5 * 60 * 1000);
  }

  loadFeed(): void {
    var feed = new FeedService(this.props.url);
    feed.loadFeedContent().then(() => {
      this.setState({ feed: feed });
    });
  }

  refresh(): void {
    console.log('refresh!!!!!');
    // this.setState({feed: this.state.feed});
  }

  clearFeed(): void {
    this.state.feed.clearFeed();
    this.setState({ feed: this.state.feed });
  }

  displayAll = (): void => {
    this.state.feed.displayAllLinks();
    this.setState({ feed: this.state.feed });
  }

  render() {
    let allLinks = (this.state.feed.links < this.state.feed.allLinks)
    ? <span className='text-badge' onClick={this.displayAll}><a>All</a> </span>
    : (<div></div>);

    let options = null;
    if (this.state.feed.links.length !== 0) {
      options = <span> <span className='text-badge' onClick={this.clearFeed.bind(this)}>
        <a>{this.state.feed.links.length}</a>
      </span> {allLinks}</span>;
    } else {
      if (this.shouldDisplayEmptyFeeds) {
        options =  <span> {allLinks} - Nothing new :( </span>;
      } else {
        return(<div></div>);
      }
    }

    let links = null;
    if (this.state.feed.links.length !== 0) {
      links = <div>
        {this.state.feed.links.map((l: Link, i: number) => (
          <News key={i} url={l.url} title={l.title} date={l.publicationDate} />
        ))}
      </div>;
    }

    return (
      <div className='feed'>
        <div className='title'>
          <img src={this.state.feed.logo} />
          {this.state.feed.title} {options}
        </div>
        {links}
      </div>
    );
  }
}

