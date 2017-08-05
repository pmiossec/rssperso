import * as React from 'react';
import { FeedService } from './feedService';
import { News, Link } from './news';

interface IFeedProps {
  key: number;
  feed: FeedService;
}

interface IFeedState {
}

export class Feed extends React.Component<IFeedProps, IFeedState> {

  shouldDisplayEmptyFeeds: boolean = false;

  componentWillMount(): void {
    this.loadFeed().then(() => {
      setInterval(() => this.loadFeed(), this.calculateRefreshInterval());
    });
  }

  getFeedName = (): string => {
    return this.props.feed.title;
  }

  getIconUrl = (): string => {
    return this.props.feed.logo;
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
    const date1 = dates.slice(1);
    // console.log('d1', d1);
    const date2 = dates.slice(0, dates.length - 1);
    // console.log('d2', d2);
    const diff = date2.map((d, i) => d - date1[i]).sort((d1, d2) => d2 - d1).slice(1);
    // console.log('diff', diff);
    const moyenne = diff.reduce((d1, d2) => d1 + d2, 0) / diff.length;
    // console.log(`${this.props.feed.url}:${moyenne} / ${moyenne / 1000 / 60}min!`);
    const timeSpan = Math.max(Math.min(maxInterval, moyenne / 2), 5 * 60 * 1000);
    // const timeSpan = this.props.feed.allLinks[0].publicationDate.getTime()
    // - this.props.feed.allLinks[1].publicationDate.getTime();
    // console.log(`${this.props.feed.url} (reel refresh):${timeSpan} / ${timeSpan / 1000 / 60}min!`);
    return timeSpan;
  }

  loadFeed(): Axios.IPromise<void> {
    return this.props.feed.loadFeedContent().then(() => {
      this.forceUpdate();
    });
  }

  refresh(): void {
    // console.log('refresh!!!!!');
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

  openAll = (): void => {
    this.props.feed.getLinksToDisplay().forEach(element => {
      window.open(element.url, '_blank');
    });
    this.clearFeed();
  }

  render() {
    let options = null;
    const linksToDisplay = this.props.feed.getLinksToDisplay();
    if (linksToDisplay.length !== 0) {
      options = (
        <span>
          <div className="text-badge" onClick={this.clearFeed.bind(null, null)}>
            <a>{linksToDisplay.length}</a>
          </div>
          {!this.props.feed.isDisplayingAllLinks()
            && <div className="text-badge" onClick={this.displayAll}><a>All</a> </div>}
          {linksToDisplay.length !== 0
            && <div className="text-badge" onClick={this.openAll}><a> Open All</a> </div>}
        </span>);
    } else {
      if (this.shouldDisplayEmptyFeeds) {
        options = (
          <span>
            <div className="text-badge" onClick={this.displayAll}><a>All</a> </div> - Nothing new :(
          </span>);
      } else {
        return (<div />);
      }
    }

    let links = (
        <div>
          {linksToDisplay.map((l: Link, i: number) => (
            <News key={i} url={l.url} title={l.title} date={l.publicationDate} parentFeed={this} />
          ))}
        </div>
      );

    return (
      <div className="feed">
        <div className="title">
          <div>
            <img src={this.props.feed.logo} />
            <a href={this.props.feed.webSiteUrl as string} target="_blank"> {this.props.feed.title}</a>
          </div>
          <div>
            {options}
          </div>
        </div>
        {linksToDisplay.length !== 0 && links}
      </div>
    );
  }
}
