import * as React from 'react';
import * as axios from 'axios';

export class Feed {

  public logo: string;
  public title: string = 'Future title';
  public links: Link[] = [];
  public content: string;
  public clearDate: Date = new Date(1900, 1, 1);
  constructor(
    public url: string,
  ) {
    this.links = [];
    this.title = 'loading...';
    this.restoreInitialClearDate();
  }

  public clearFeed(): void {
    this.clearDate = new Date();
    this.links = new Array<Link>();
    this.storeClearDate(this.clearDate);
  }

  public loadFeedContent(): Axios.IPromise<void> {
    const parser = new DOMParser();
    return axios
      .get(this.url)
      .then((response: Axios.AxiosXHR<string>) => {
        try {
          this.content = response.data;
          const xmlDoc = parser.parseFromString(this.content, 'text/xml');
          console.log('xmlDoc:', xmlDoc.documentElement);
          const feedFormat = xmlDoc.documentElement.tagName;
          // debugger;
          switch (feedFormat) {
            case 'rss':
            case 'rdf:RDF':
              this.manageRssFeed(xmlDoc.documentElement);
              break;
            case 'feed':
              this.manageAtomFeed(xmlDoc.documentElement);
              break;
            default:
              this.title = `${this.url} => Feed format not supported:` + feedFormat;
          }
          if (!this.logo || !this.logo.startsWith('http')) {
            var parts = this.url.split('/');
            this.logo = parts[0] + '//' + parts[2] + '/favicon.ico';
          }

        } catch (ex) {
          this.title = `${this.url} Error loading :( Error: ${ex}`;
        }
      });
  }

  private storeClearDate(clearDate: Date): void {
    localStorage.setItem(this.url, clearDate.toJSON());
  }

  private restoreInitialClearDate(): void {
    const jsonClearDate = localStorage.getItem(this.url);
    if (jsonClearDate) {
      this.clearDate = new Date(jsonClearDate);
    }
  }

  private manageRssFeed(xmlDoc: HTMLElement): void {
    console.log(`Processing Rss feed ( ${this.url} )...`);
    const channel = xmlDoc.getElementsByTagName('channel').item(0);
    this.title = this.getElementContentByTagName(channel, 'title');
    this.logo = this.getElementContentByTagName(this.getElementByTagName(channel, 'image'), 'url');
    const items = channel.getElementsByTagName('item');
    for (var iItems = 0; iItems < items.length; iItems++) {
      var item = items.item(iItems);
      var link = new Link(this.getElementContentByTagName(item, 'link'), this.getElementContentByTagName(item, 'title'));
      link.publicationDate = this.getLinkRssDate(item);
      if (link.publicationDate > this.clearDate) {
        this.links = [...this.links, link];
      }
    }
  }

  private getLinkRssDate(element: Element): Date {
    var publicationDateElement = this.getElementByTagName(element, 'pubDate');
    if (publicationDateElement) {
      return new Date(publicationDateElement.textContent);
    }

    publicationDateElement = this.getElementByTagName(element, 'dc:date');
    if (publicationDateElement) {
      return new Date(publicationDateElement.textContent);
    }

    return new Date();
  }

  private getElementContentByTagName(element: Element | Document, tagName: string): string {
    const foundElement: Element = this.getElementByTagName(element, tagName);
    if (foundElement) {
      return foundElement.textContent;
    }
    return '';
  }

  private getElementByTagName(element: Element | Document, tagName: string): Element {
    if (!element || !element.children) {
      return null;
    }
    var iElement: number;
    for (iElement = 0; iElement < element.children.length; iElement++) {
      const foundElement = element.children.item(iElement);
      if (foundElement.tagName === tagName) {
        return foundElement;
      }
    }
    return null;
  }

  // private findChildrenByTag(element: Element, tagName: string): NodeListOf<Element> {
  //   var elements = element.getElementsByTagName(tagName);
  //   return elements;
  // }
  // private findChildByTag(element: Element, tagName: string): Element {
  //   var elements = this.findChildrenByTag(element, tagName);
  //   return elements.item(0);
  // }

  private manageAtomFeed(xmlDoc: HTMLElement): void {
    console.log(`Processing Atom feed ( ${this.url} )...`);
    this.title = this.getElementContentByTagName(xmlDoc, 'title');
    this.logo = this.getElementContentByTagName(xmlDoc, 'icon');
    const items = xmlDoc.getElementsByTagName('entry');
    for (var iItems = 0; iItems < items.length; iItems++) {
      var item = items.item(iItems);
      var link = new Link(this.getElementByTagName(item, 'link').getAttribute('href'), this.getElementContentByTagName(item, 'title'));
      link.publicationDate = new Date(this.getElementContentByTagName(item, 'published'));
      if (link.publicationDate > this.clearDate) {
        this.links = [...this.links, link];
      }
    }
  }
}

export class Link {
  public publicationDate: Date;
  constructor(
    public url: string,
    public title: string,
  ) { }
}

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

interface IFeedProps {
  key: number;
  url: string;
};

interface IFeedState {
  feed: Feed;
};

export class FeedComponent extends React.Component<IFeedProps, IFeedState> {

  constructor(props: IFeedProps) {
    super(props);
    this.state = {
      feed: new Feed('Loading!')
    };
  }

  componentWillMount(): void {
    this.loadFeed();
    setInterval(() => this.loadFeed(), 5 * 60 * 1000);
  }

  loadFeed(): void {
    var feed = new Feed(this.props.url);
    feed.loadFeedContent().then(() => {
      this.setState({ feed: feed });
    });
  }

  refresh(): void {
    console.log('refresh!!!!!');
    // this.setState({feed: this.state.feed});
  }

  clearFeed(): void {
    console.log('clearing!!!!!');
    this.state.feed.clearFeed();
    this.setState({ feed: this.state.feed });
  }

  formatDate(date: Date): string {
    const now = new Date();
    return (now.getDate() === date.getDate() && now.getMonth() === date.getMonth())
      ? `${date.getHours()}:${date.getMinutes()}`
      : `${date.getDate()}/${date.getMonth() + 1}`;
  }

  render() {

    let options = null;
    if (this.state.feed.links.length !== 0) {
      options = <span className='text-badge' >
        <a onClick={this.clearFeed.bind(this)}>{this.state.feed.links.length}</a>
      </span>;
    }

    let links = null;
    if (this.state.feed.links.length !== 0) {
      links = <div className='links'>
        {this.state.feed.links.map((l: Link, i: number) => (
          <NewsComponent key={i} url={l.url} title={l.title} date={this.formatDate(l.publicationDate)} />
        ))}
      </div>;
    } else {
      links = 'No new links';
    }

    return (
      <div style={styles.feed}>
        <div style={styles.h3}>
          <img style={styles.logo} src={this.state.feed.logo} />
          {this.state.feed.title} {options}
        </div>
        {links}
      </div>
    );
  }
}

interface ILinkProps {
  url: string;
  title: string;
  date: string;
};

interface ILinkState { };

export class NewsComponent extends React.Component<ILinkProps, ILinkState> {
  render() {
    return (
      <div>
        <a href={this.props.url} target='_blank' >{this.props.title}</a> - {this.props.date}
      </div>
    );
  }
}
