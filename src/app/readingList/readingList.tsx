import * as React from 'react';
import { Link } from '../feeds/news';
import * as Helper from '../helper';

interface IReadingListProps {
};

interface IReadingListState {
  links: Link[];
};


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
    const link = Helper.Storage.elementAt(Helper.ReadingListKey, i).then((link) => {
      console.log('link to archieve', link);
      Helper.Storage.addToStoredList(Helper.ArchiveListKey, link);

      const readList = Helper.Storage.remove(Helper.ReadingListKey, i).then((readList) => {
        this.setState({ links: readList });
      });
    });
  }

  openAndRemoveLink = (url: string, i: number): void => {
    window.open(url, '_blank');
    this.remove(i);
  }

  render() {
    var readItems;
    if (!this.state || !this.state.links) {
      readItems = (<div></div>);
    } else {
      readItems = this.state.links.map((l: Link, i: number) =>
      <div key={i}>
        [<span className='date'>{Helper.DateFormatter.formatDate(new Date(l.publicationDate))}</span>|<a onClick={this.remove.bind(null, i)}>Del</a>]
        <a onClick={this.openAndRemoveLink.bind(null, l.url, i)} >{l.title} </a>
      </div>);
    }

    return (
      <div className='feed'>
        <div className='title'> >> Reading list... ({ (!this.state || !this.state.links) ? 0 : this.state.links.length})</div>
        <div className='links'> {readItems} </div>
      </div>
    );
  }
}
