import * as React from 'react';
import {FeedService} from './feedService';
import {News, Link} from './news';

interface IFeedProps {
  key: number;
  feed: FeedService;
};

interface IFeedState {
};

export class Feed extends React.Component<IFeedProps, IFeedState> {

  shouldDisplayEmptyFeeds: boolean = false;

  componentWillMount(): void {
    this.loadFeed();
    setInterval(() => this.loadFeed(), 5 * 60 * 1000);
  }

  loadFeed(): void {
     this.props.feed.loadFeedContent().then(() => {
      this.forceUpdate();
    });
  }

  refresh(): void {
    console.log('refresh!!!!!');
    this.forceUpdate();
  }

  clearFeed(): void {
    this.props.feed.clearFeed();
    this.forceUpdate();
  }

  displayAll = (): void => {
    this.props.feed.displayAllLinks();
    this.forceUpdate();
  }

  render() {
    let allLinks = (this.props.feed.links < this.props.feed.allLinks)
    ? <span className='text-badge' onClick={this.displayAll}><a>All</a> </span>
    : (<div></div>);

    let options = null;
    if (this.props.feed.links.length !== 0) {
      options = <span> <span className='text-badge' onClick={this.clearFeed.bind(this)}>
        <a>{this.props.feed.links.length}</a>
      </span> {allLinks}</span>;
    } else {
      if (this.shouldDisplayEmptyFeeds) {
        options =  <span> {allLinks} - Nothing new :( </span>;
      } else {
        return(<div></div>);
      }
    }

    let links = null;
    if (this.props.feed.links.length !== 0) {
      links = <div>
        {this.props.feed.links.map((l: Link, i: number) => (
          <News key={i} url={l.url} title={l.title} date={l.publicationDate} />
        ))}
      </div>;
    }

    return (
      <div className='feed'>
        <div className='title'>
          <img src={this.props.feed.logo} />
          {this.props.feed.title} {options}
        </div>
        {links}
      </div>
    );
  }
}

