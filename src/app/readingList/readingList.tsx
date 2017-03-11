import * as React from 'react';
import { Link } from '../feeds/news';
import * as Helper from '../helper';

interface IReadingListProps {
};

interface IReadingListState {
  links: Link[];
};

const ReadingListKey: string = 'ReadingList';
const ArchiveListKey: string = 'ArchiveList';

export class ReadingList extends React.Component<IReadingListProps, IReadingListState> {
  componentWillMount(): void {
    this.loadReadingList();
    setInterval(() => this.loadReadingList(), 2000);
  }

  loadReadingList = (): void => {
    const readList = Helper.Storage.loadReadingListIfChanged(ReadingListKey);
    if (readList) {
      this.setState({ links: readList });
    }
  }

  remove = (i: number): void => {
    const link = Helper.Storage.elementAt(ReadingListKey, i);
    Helper.Storage.addToStoredList(ArchiveListKey, link);

    const readList = Helper.Storage.remove(ReadingListKey, i);
    this.setState({ links: readList });
  }

  openAndRemoveLink = (url: string, i: number): void => {
    window.open(url, '_blank');
    this.remove(i);
  }

  render() {
    const readItems = this.state.links.map((l: Link, i: number) =>
      <div key={i}>
        [<span className='date'>{Helper.DateFormatter.formatDate(l.publicationDate)}</span>|<a onClick={this.remove.bind(null, i)}>Del</a>]
        <a onClick={this.openAndRemoveLink.bind(null, l.url, i)} >{l.title} </a>
      </div>);

    return (
      <div className='feed'>
        <div className='title'> >> Reading list... ({this.state.links.length})</div>
        <div className='links'> {readItems} </div>
      </div>
    );
  }
}
