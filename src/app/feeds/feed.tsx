import * as React from 'react';
import { FeedService } from './feedService';
import { News, Link } from './news';

interface IFeedProps {
  key: number;
  feed: FeedService;
};

interface IFeedState {
};

export class Feed extends React.Component<IFeedProps, IFeedState> {

  shouldDisplayEmptyFeeds: boolean = false;

  componentWillMount(): void {
    this.loadFeed().then(() => {
      setInterval(() => this.loadFeed(), this.calculateRefreshInterval());
    });
  }

  calculateRefreshInterval() {
    const oneDay = 24 * 3600 * 1000;
    const maxInterval = 2 * 3600 * 1000;
    if (!this.props.feed.allLinks || this.props.feed.allLinks.length === 0) {
      // console.log(`${this.props.feed.url}: no links :( => 2h timespan!`);
      return maxInterval;
    }

    const lastFeedDate = this.props.feed.allLinks[0].publicationDate;
    // console.log(`${this.props.feed.url}:last publish ${lastFeedDate}!`);
    if (new Date().getTime() - lastFeedDate.getTime() > oneDay) {
      // console.log(`${this.props.feed.url}:more than 1 day => 2h timespan!`);
      return maxInterval;
    }

    const dates = this.props.feed.allLinks.map(l => { return l.publicationDate.getTime(); });
    // console.log('diff', dates);
    const d1 = dates.slice(1);
    // console.log('d1', d1);
    const d2 = dates.slice(0, dates.length - 1);
    // console.log('d2', d2);
    const diff = d2.map((d, i) => d - d1[i]).sort((d1, d2) => d2 - d1).slice(1);
    // console.log('diff', diff);
    const moyenne = diff.reduce((d1, d2) => d1 + d2, 0) / diff.length;
    // console.log(`${this.props.feed.url}:${moyenne} / ${moyenne / 1000 / 60}min!`);
    const timeSpan = Math.max(Math.min(maxInterval, moyenne / 2), 5 * 60 * 1000);
    // const timeSpan = this.props.feed.allLinks[0].publicationDate.getTime() - this.props.feed.allLinks[1].publicationDate.getTime();
    console.log(`${this.props.feed.url} (reel refresh):${timeSpan} / ${timeSpan / 1000 / 60}min!`);
    return timeSpan;
  }

  loadFeed(): Axios.IPromise<void> {
    return this.props.feed.loadFeedContent().then(() => {
      this.forceUpdate();
    });
  }

  refresh(): void {
    console.log('refresh!!!!!');
    this.forceUpdate();
  }

  clearFeed = (date?: Date): void => {
    this.props.feed.clearFeed(date);
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
      options = <span> <span className='text-badge' onClick={this.clearFeed.bind(null, null)}>
        <a>{this.props.feed.links.length}</a>
      </span> {allLinks}</span>;
    } else {
      if (this.shouldDisplayEmptyFeeds) {
        options = <span> {allLinks} - Nothing new :( </span>;
      } else {
        return (<div></div>);
      }
    }

    let links = null;
    if (this.props.feed.links.length !== 0) {
      links = <div>
        {this.props.feed.links.map((l: Link, i: number) => (
          <News key={i} url={l.url} title={l.title} date={l.publicationDate} parentFeed={this} />
        ))}
      </div>;
    }

    return (
      <div className='feed'>
        <div className='title'>
          <img src={this.props.feed.logo} />
          <a href={this.props.feed.webSiteUrl} target='_blank'> {this.props.feed.title}</a> {options}
        </div>
        {links}
      </div>
    );
  }
}

