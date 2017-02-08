import * as React from 'react';
import * as axios from 'axios';
import * as moment from 'moment';

export class Feed {

  public logo: string;
  public title: string = 'Future title';
  public links: Link[] = [];
  public allLinks: Link[] = [];
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
    if (this.links && this.links.length !== 0) {
      this.clearDate = this.links[0].publicationDate;
    } else {
      this.clearDate = new Date();
    }
    this.links = new Array<Link>();
    this.storeClearDate(this.clearDate);
  }

  public displayAllLinks(): void {
    this.clearDate = new Date(2000, 1, 1);
    this.links = this.allLinks;
    this.storeClearDate(this.clearDate);
  }

  public loadFeedContent(): Axios.IPromise<void> {
    const parser = new DOMParser();
    return axios
      .get('http://cors-anywhere.herokuapp.com/' + this.url, { headers: {'X-Requested-With': 'XMLHttpRequest', 'origin': 'MyRssReader' }})
      // .get(this.url, { headers: {'X-Requested-With': 'XMLHttpRequest', 'origin': 'MyRssReader' }})
      .then((response: Axios.AxiosXHR<string>) => {
        try {
          var content = response.data;
          const xmlDoc = parser.parseFromString(content, 'text/xml');
          // console.log('xmlDoc:', xmlDoc.documentElement);
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
          if (!this.title) {
            this.title = this.url;
          }
          // console.log('feed read', this);
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
    // console.debug(`Processing Rss feed ( ${this.url} )...`);
    const channel = this.getElementByTagName(xmlDoc, 'channel');
    this.title = this.getElementContentByTagName(channel, 'title');
    this.logo = this.getElementContentByTagName(this.getElementByTagName(channel, 'image'), 'url');
    const items = xmlDoc.getElementsByTagName('item');
    for (var iItems = 0; iItems < items.length; iItems++) {
      var item = items.item(iItems);
      var link = new Link(this.getElementContentByTagName(item, 'link'), this.getElementContentByTagName(item, 'title'));
      link.publicationDate = this.getLinkRssDate(item);
      this.allLinks = [...this.allLinks, link];
      if (link.publicationDate > this.clearDate) {
        this.links = [...this.links, link];
      }
    }
    this.sortFeed();
  }

  private parseDate(date: string): Date {
    var parsedDate = moment(date);
    if (parsedDate.isValid()) {
      return parsedDate.toDate();
    }
    parsedDate = moment(date, 'ddd, DD MMM YYYY HH:mm:ss Z');
    return parsedDate.toDate();
  }

  private getLinkRssDate(element: Element): Date {
    var publicationDateElement = this.getElementByTagName(element, 'pubDate');
    if (publicationDateElement) {
      return this.parseDate(publicationDateElement.textContent);
    }

    publicationDateElement = this.getElementByTagName(element, 'dc:date');
    if (publicationDateElement) {
      return this.parseDate(publicationDateElement.textContent);
    }

    console.log('date not found :(', this.url);
    return new Date(2000, 1, 1);
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

  private manageAtomFeed(xmlDoc: HTMLElement): void {
    // console.log(`Processing Atom feed ( ${this.url} )...`);
    this.title = this.getElementContentByTagName(xmlDoc, 'title');
    this.logo = this.getElementContentByTagName(xmlDoc, 'icon');
    const items = xmlDoc.getElementsByTagName('entry');
    for (var iItems = 0; iItems < items.length; iItems++) {
      var item = items.item(iItems);
      var link = new Link(this.getElementByTagName(item, 'link').getAttribute('href'), this.getElementContentByTagName(item, 'title'));
      link.publicationDate = this.getLinkAtomDate(item);
      if (link.publicationDate > this.clearDate) {
        this.links = [...this.links, link];
      }
    }
    this.sortFeed();
  }

  private sortFeed = (): void => {
    this.links = this.links.sort((l1, l2) => { return l1.publicationDate < l2.publicationDate ? -1 : 1; });
  }

  private getLinkAtomDate(element: Element): Date {
    var publicationDateElement = this.getElementByTagName(element, 'published');
    if (publicationDateElement) {
      return this.parseDate(publicationDateElement.textContent);
    }

    publicationDateElement = this.getElementByTagName(element, 'updated');
    if (publicationDateElement) {
      return this.parseDate(publicationDateElement.textContent);
    }

    return new Date();
  }
}

export class Link {
  public publicationDate: Date;
  public read: boolean;
  constructor(
    public url: string,
    public title: string
  ) { }
}

const styles = {
  feed: {
    border: '1px solid lightgray',
    margin: '2px',
    padding: '5px'
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

  shouldDisplayEmptyFeeds: boolean = false;
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

  displayAll = (): void => {

    this.state.feed.displayAllLinks();
    this.setState({ feed: this.state.feed });
  }

  render() {

    let allLinks = (this.state.feed.links < this.state.feed.allLinks)
    ? <span className='text-badge' onClick={this.displayAll}><a>All</a> </span>
    : (<div></div>);

    let options = null;
    if (this.state.feed.links.length !== 0) {
      options = <span> <span className='text-badge' onClick={this.clearFeed.bind(this)}>
        <a>{this.state.feed.links.length}</a>
      </span> {allLinks}</span>;
    } else {
      if (this.shouldDisplayEmptyFeeds) {
        options =  <span> {allLinks} - Nothing new :( </span>;
      } else {
        return(<div></div>);
      }
    }

    let links = null;
    if (this.state.feed.links.length !== 0) {
      links = <div className='links'>
        {this.state.feed.links.map((l: Link, i: number) => (
          <NewsComponent key={i} url={l.url} title={l.title} date={l.publicationDate} />
        ))}
      </div>;
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
  date: Date;
};

interface ILinkState { };

export class NewsComponent extends React.Component<ILinkProps, ILinkState> {
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

  addToPocket = () : void => {
    axios.post('https://getpocket.com/v3/add', {url: this.props.url, title: this.props.title, consumer_key: 'toto', access_token: ''});
  }

  padDigits(number: number, digits: number = 2): string {
    return Array(Math.max(digits - String(number).length + 1, 0)).join('0') + number;
  }

  formatDate(date: Date): string {
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
