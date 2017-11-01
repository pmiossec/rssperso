import * as React from 'react';
import * as Helper from '../helper';
import { NotificationManager } from 'react-notifications';
import { GistStorage, ReadListItem, Gist } from '../storage/gistStorage';

interface IReadingListProps {
  data: Gist;
  store: GistStorage;
}

interface IReadingListState {
}

export class ReadingList extends React.Component<IReadingListProps, IReadingListState> {
  private displayReadingList: boolean = false;
  private sortByDate: boolean = true;

  componentDidMount(): void {
    setInterval(() => this.refreshReadingList(), 30000);
  }

  refreshReadingList = () => {
    this.setState({});
  }

  remove = (item: ReadListItem): void => {
    this.props.store.removeItemFromReadingList(item);
    this.refreshReadingList();
    NotificationManager.warning('"' + item.title + '" removed', 'Reading list', 3000);
  }

  openAndRemoveLink = (item: ReadListItem): void => {
    window.open(item.url, '_blank');
    this.remove(item);
  }

  toggleVisibility = () => {
    this.displayReadingList = !this.displayReadingList;
    this.refreshReadingList();
  }

  sortListByDate = () => {
    this.sortByDate = !this.sortByDate;
    this.props.data.readList = this.props.data.readList.sort((i1, i2) => {
      return new Date(i2.publicationDate).getTime() - new Date(i1.publicationDate).getTime();
    });
    this.refreshReadingList();
  }

  sortListByFeed = () => {
    this.sortByDate = !this.sortByDate;
    this.props.data.readList = this.props.data.readList.sort((i1, i2) => {
      if (i1.idFeed === i2.idFeed) {
        return i2.publicationDate.getTime() - i1.publicationDate.getTime();
      }
      return i1.idFeed - i2.idFeed;
    });
    this.refreshReadingList();
  }

  render() {
    var readItems;
    if (!this.props.data) {
      readItems = (<div>loading...</div>);
    } else {
      const data = this.props.data;
      readItems = data.readList.map((l: ReadListItem, i: number) => {
        const feed = data.feeds.find(f => f.id === l.idFeed);
        return (
      <div key={i}>
        [<span className="date">{Helper.DateFormatter.formatDate(new Date(l.publicationDate))}</span>
          |<a href={l.url} target="_blank">📄</a>
          |<a onClick={this.remove.bind(null, l)}>❌</a>]
        <a onClick={this.openAndRemoveLink.bind(null, l)} >
          {feed && <img src={feed.icon} />}
          {l.title}
        </a>
      </div>);
      });
    }

    if (this.props.data) {
      return (
        <div className="feed">
        <div className="title"> <a onClick={this.toggleVisibility} >>>> Reading list
          ({!this.props.data.readList ? 0 : this.props.data.readList.length}):</a>
          {this.displayReadingList && this.sortByDate && <a onClick={this.sortListByFeed} >Sort by feed </a>}
          {this.displayReadingList && !this.sortByDate && <a onClick={this.sortListByDate} >Sort by date </a>}
          {this.props.store.couldBeRestored()
             && <a onClick={this.props.store.restoreLastRemoveReadingItem} >Restore last deleted item </a>}
        </div>
        <div className="links"> {this.displayReadingList && readItems} </div>
      </div>);
    } else {
        return <div />;
      }
  }
}
