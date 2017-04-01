import * as React from 'react';
import * as Helper from '../helper';
import { Feed } from './feed';

export class Link {
  public publicationDate: Date;
  public read: boolean;
  public iconUrl: string;
  public feedName: string;
  constructor(
    public url: string,
    public title: string
  ) { }
}

interface ILinkProps {
  parentFeed: Feed;
  url: string;
  title: string;
  date: Date;
};

interface ILinkState { };

export class News extends React.Component<ILinkProps, ILinkState> {
  addToReadList = () : void => {
    Helper.Storage.addToStoredList('ReadingList', {
      url: this.props.url,
      title: this.props.title,
      publicationDate: this.props.date,
      feedName: this.props.parentFeed.getFeedName(),
      iconUrl: this.props.parentFeed.getIconUrl(),
    } as Link);
  }

  render() {
    return (
      <div>
  [<a  onClick={this.props.parentFeed.clearFeed.bind(null, this.props.date)} >{Helper.DateFormatter.formatDate(this.props.date)}</a>|<a onClick={this.addToReadList} >Add</a>]<a href={this.props.url} target='_blank' > {this.props.title}</a>
      </div>
    );
  }
}
