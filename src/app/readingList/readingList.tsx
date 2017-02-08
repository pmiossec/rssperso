import * as React from 'react';
import {Link} from '../feeds/feed';

const styles = {
  feed: {
    border: '1px solid lightgray',
    margin: '2px',
    padding: '0rem'
  },
  logo: {
    height: '16px'
  },
  h3: {
    margin: '0 0 5px 0'
  }
};

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

  dateTimeReviver = (key: string, value: string): any => {
      if (key === 'publicationDate') {
        return new Date(value);
      }
      return value;
  }

  loadReadingList(): void {
    var readList : Link[] = JSON.parse(localStorage.getItem('ReadingList'), this.dateTimeReviver) || [];
    this.setState({ links: readList });
  }

  remove(i: number): void {
    var readList : Link[] = JSON.parse(localStorage.getItem('ReadingList')) || [];
    readList.splice(i, 1);

    localStorage.setItem('ReadingList', JSON.stringify(readList));
    this.setState({ links: readList });
  }

  padDigits(number: number, digits: number = 2): string {
    return Array(Math.max(digits - String(number).length + 1, 0)).join('0') + number;
  }

  formatDate(date: Date): string {
    if(!date) {
      return '-';
    }
    const now = new Date();
    return (now.getDate() === date.getDate() && now.getMonth() === date.getMonth())
      ? `${this.padDigits(date.getHours())}:${this.padDigits(date.getMinutes())}`
      : `${this.padDigits(date.getDate())}/${this.padDigits(date.getMonth() + 1)}`;
  }

  render() {
    const readItems = this.state.links.map((l: Link, i: number) =>
  <div key={i}>[<span className='date'>{this.formatDate(l.publicationDate)}</span>|<a onClick={this.remove.bind(this, i)}>Del</a>]<a href={l.url} target='_blank'>{l.title} </a></div>);

    return (
      <div style={styles.feed}>
        <div style={styles.h3}>
          >> Reading list...
        </div>
        <div className='links'>
            {readItems}
        </div>
      </div>
    );
  }
}
