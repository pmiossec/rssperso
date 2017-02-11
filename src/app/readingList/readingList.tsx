import * as React from 'react';
import {Link} from '../feeds/news';
import * as Helper from '../helper';

interface IReadingListProps {
};

interface IReadingListState {
  links: Link[];
};

export class ReadingList extends React.Component<IReadingListProps, IReadingListState> {
  componentWillMount(): void {
    this.loadReadingList();
    setInterval(() => this.loadReadingList(), 1000);
  }

  loadReadingList = () : void => {
    const readList = Helper.Storage.loadReadingList('ReadingList');
    this.setState({ links: readList });
  }

  remove = (i: number): void => {
    const readList = Helper.Storage.remove('ReadingList', i);
    this.setState({ links: readList });
  }

  render() {
    const readItems = this.state.links.map((l: Link, i: number) =>
      <div key={i}>[<span className='date'>{Helper.DateFormatter.formatDate(l.publicationDate)}</span>|<a onClick={this.remove.bind(null, i)}>Del</a>]<a href={l.url} target='_blank'>{l.title} </a></div>);

    return (
      <div className='feed'>
        <div className='title'> >> Reading list...</div>
        <div className='links'> {readItems} </div>
      </div>
    );
  }
}
