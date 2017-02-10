import * as React from 'react';

export class Link {
  public publicationDate: Date;
  public read: boolean;
  constructor(
    public url: string,
    public title: string
  ) { }
}

interface ILinkProps {
  url: string;
  title: string;
  date: Date;
};

interface ILinkState { };

export class News extends React.Component<ILinkProps, ILinkState> {
  dateTimeReviver = (key: string, value: string): any => {
      if (key === 'publicationDate') {
        return new Date(value);
      }
      return value;
  }

  addToReadList = () : void => {
    var readList : Link[] = JSON.parse(localStorage.getItem('ReadingList'), this.dateTimeReviver) || [];
    readList.push({url: this.props.url, title: this.props.title, publicationDate: this.props.date} as Link);
    localStorage.setItem('ReadingList', JSON.stringify(readList));
  }

  padDigits(number: number, digits: number = 2): string {
    return Array(Math.max(digits - String(number).length + 1, 0)).join('0') + number;
  }

  formatDate(date: Date): string {
    if (!date) {
      return '-';
    }
    const now = new Date();
    return (now.getDate() === date.getDate() && now.getMonth() === date.getMonth())
      ? `${this.padDigits(date.getHours())}:${this.padDigits(date.getMinutes())}`
      : `${this.padDigits(date.getDate())}/${this.padDigits(date.getMonth() + 1)}`;
  }

  render() {
    return (
      <div>
  [<span className='date'>{this.formatDate(this.props.date)}</span>|<a onClick={this.addToReadList} >Add</a>{/*|<a onClick={this.addToPocket}>Pocket</a>*/}]<a href={this.props.url} target='_blank' > {this.props.title}</a>
      </div>
    );
  }
}
