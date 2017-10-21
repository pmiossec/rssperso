import * as React from 'react';
// import { Link } from '../feeds/news';
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
  componentWillMount(): void {
    this.loadReadingList();
    setInterval(() => this.loadReadingList(), 2000);
  }

  loadReadingList = (): void => {
    Helper.Storage.loadReadingListIfChanged(Helper.ReadingListKey).then((readList) => {
      if (readList) {
        this.setState({ links: readList });
      }
    });
  }

  remove = (i: number): void => {
    Helper.Storage.elementAt(Helper.ReadingListKey, i).then((link) => {
      // console.log('link to archieve', link);
      Helper.Storage.addToStoredList(Helper.ArchiveListKey, link);

      Helper.Storage.remove(Helper.ReadingListKey, i).then((readList) => {
        this.setState({ links: readList });
      });
      NotificationManager.warning('"' + link.title + '" removed', 'Reading list', 3000);
    });
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
      readItems = this.props.data.readList.map((l: ReadListItem, i: number) => (
      <div key={i}>
        [<span className="date">{Helper.DateFormatter.formatDate(new Date(l.publicationDate))}</span>
          |<a href={l.url} target="_blank">📄</a>
          |<a onClick={this.remove.bind(null, i)}>❌</a>]
        <a onClick={this.openAndRemoveLink.bind(null, l.url, i)} >
          <img src={data.feeds.find(f => f.id === l.id)!.icon} />
          {l.title}
        </a>
      </div>));
    }

    return (
      <div className="feed">
        <div className="title"> >> Reading list...
          ({!this.props.data.readList ? 0 : this.props.data.readList.length})</div>
        <div className="links"> {readItems} </div>
      </div>
    );
  }
}
