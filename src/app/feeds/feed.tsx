import * as React from 'react';
import * as Helper from '../helper';
import { FeedService, Link } from './feedService';
import { ReadListItem } from '../storage/gistStorage';

interface IFeedProps {
  key: number;
  feed: FeedService;
  unsecured?: boolean;
}

interface IFeedState {}

export class Feed extends React.Component<IFeedProps, IFeedState> {
  shouldDisplayEmptyFeeds: boolean = false;

  componentWillMount(): void {
    this.loadFeed().then(() => {
      setInterval(
        () => this.loadFeed(),
        this.props.feed.calculateRefreshInterval()
      );
    });
  }

  loadFeed(): Promise<void> {
    return this.props.feed.loadFeedContent().then(() => {
      this.forceUpdate();
    });
  }

  refresh(): void {
    this.forceUpdate();
  }

  clearAllFeed = (): void => {
    this.props.feed.clearAllFeed();
    this.forceUpdate();
  }

  clearFeed = (date: Date): void => {
    this.props.feed.clearFeed(date);
    this.forceUpdate();
  }

  displayAll = (): void => {
    this.props.feed.displayAllLinks();
    this.forceUpdate();
  }

  unsecureUrl = (url: string) => {
    return this.props.unsecured ? url.replace('https://', 'http://') : url;
  }

  openAll = (): void => {
    this.props.feed.getLinksToDisplay().forEach(element => {
      window.open(this.unsecureUrl(element.url), '_blank');
    });
    this.clearAllFeed();
  }

  addToReadList = (item: ReadListItem, index: number) => {
    return () => {
      const removingItem = index === 0;
      this.props.feed.addItemToReadingList(item, removingItem);
      if (removingItem) {
        this.forceUpdate();
      }
    };
  }

  removeIfFirstOnClick = (item: ReadListItem, index: number) => {
    return () => {
      setTimeout(() => {
        const shouldRemoveItem = index === 0;
        if (shouldRemoveItem) {
          this.clearFeed(item.publicationDate);
          this.forceUpdate();
        }
      },
                 200);
  };
  }

  private replaceInTitle = (title: string) => {
    return title
      .replace('Tennis', '🎾')
      .replace('Basket', '🏀')
      .replace('Football', '⚽')
      .replace('Handball', '🤾')
      .replace('Rugby', '🏉')
      .replace('Auto-Moto', '🏎');
  }

  render() {
    let options = null;
    const linksToDisplay = this.props.feed.getLinksToDisplay();
    if (linksToDisplay.length !== 0) {
      options = (
        <span>
          <div className="text-badge" onClick={this.clearAllFeed}>
            <a>
              {linksToDisplay.length}
            </a>
          </div>
          {!this.props.feed.isDisplayingAllLinks() &&
            <div className="text-badge" onClick={this.displayAll}>
              <a>All</a>{' '}
            </div>}
          {linksToDisplay.length !== 0 &&
            <div className="text-badge" onClick={this.openAll}>
              <a> Open All</a>{' '}
            </div>}
        </span>
      );
    } else {
      if (this.shouldDisplayEmptyFeeds) {
        options = (
          <span>
            <div className="text-badge" onClick={this.displayAll}>
              <a>All</a>{' '}
            </div>{' '}
            - Nothing new :(
          </span>
        );
      } else {
        return <div />;
      }
    }

    let links = (
      <div>
        {linksToDisplay
          .filter(l => this.props.feed.feedData.filter === undefined
            || l.title.indexOf(this.props.feed.feedData.filter) === -1)
          .map((l: Link, i: number) =>
          <div key={i}>
            [<a onClick={this.clearFeed.bind(null, l.publicationDate)}>
              {Helper.DateFormatter.formatDate(l.publicationDate)}
            </a>|
            <a onClick={this.addToReadList(l, i)}>📑</a>]
            <a href={this.unsecureUrl(l.url)} target="_blank" onClick={this.removeIfFirstOnClick(l, i)}>
              {this.props.feed.feedData.enhance === true ? this.replaceInTitle(l.title) : l.title}
            </a>
          </div>
        )}
      </div>
    );

    return (
      <div className="feed">
        <div className="title">
          <div>
            <img src={this.props.feed.logo} />
            <a href={this.props.feed.webSiteUrl as string} target="_blank">
              {' '}{this.props.feed.title}
            </a>
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
