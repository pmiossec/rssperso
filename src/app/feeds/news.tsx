import * as React from 'react';
import * as Helper from '../helper';

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
  addToReadList = () : void => {
    Helper.Storage.addToStoredList('ReadingList', {url: this.props.url, title: this.props.title, publicationDate: this.props.date} as Link);
  }

  render() {
    return (
      <div>
  [<span className='date'>{Helper.DateFormatter.formatDate(this.props.date)}</span>|<a onClick={this.addToReadList} >Add</a>]<a href={this.props.url} target='_blank' > {this.props.title}</a>
      </div>
    );
  }
}
