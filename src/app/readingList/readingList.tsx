import * as React from 'react';
import * as Helper from '../helper';
// import { NotificationManager } from 'react-notifications';
import { GistStorage, ReadListItem, Gist } from '../storage/gistStorage';

interface IReadingListProps {
  data: Gist;
  store: GistStorage;
}

interface IReadingListState {
}

export class ReadingList extends React.Component<IReadingListProps, IReadingListState> {
  // TODO:setInterval(() => this.loadReadingList(), 2000);

  remove = (i: number): void => {
    // TODO: remove an item!

    // Helper.Storage.elementAt(Helper.ReadingListKey, i).then((link) => {
    //   // console.log('link to archieve', link);
    //   Helper.Storage.addToStoredList(Helper.ArchiveListKey, link);

    //   Helper.Storage.remove(Helper.ReadingListKey, i).then((readList) => {
    //     this.setState({ links: readList });
    //   });
    //   NotificationManager.warning('"' + link.title + '" removed', 'Reading list', 3000);
    // });
  }

  openAndRemoveLink = (url: string, i: number): void => {
    window.open(url, '_blank');
    this.remove(i);
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
          |<a onClick={this.remove.bind(null, i)}>❌</a>]
        <a onClick={this.openAndRemoveLink.bind(null, l.url, i)} >
          {feed && <img src={feed.icon} />}
          {l.title}
        </a>
      </div>);
      });
    }

    if (this.props.data) {
      return (
        <div className="feed">
        <div className="title"> >> Reading list...
          ({!this.props.data.readList ? 0 : this.props.data.readList.length})</div>
        <div className="links"> {readItems} </div>
      </div>);
    } else {
        return <div />;
      }
  }
}
