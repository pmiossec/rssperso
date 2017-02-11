import * as axios from 'axios';
import * as moment from 'moment';
import {Link} from './news';

export class FeedService {
  public logo: string;
  public title: string = 'Future title';
  public links: Link[] = [];
  public allLinks: Link[] = [];
  public content: string;
  public clearDate: Date = new Date(1900, 1, 1);
  private isOrderNewerFirst = false;
  private corsProxyUrl: string = 'http://cors-anywhere.herokuapp.com/';

  constructor(
    public url: string,
  ) {
    this.links = [];
    this.title = 'loading...';
    this.restoreInitialClearDate();
  }

  public clearFeed(): void {
    if (this.links && this.links.length !== 0) {
      const indexNewerLink = this.isOrderNewerFirst ? 0 : this.links.length - 1;
      this.clearDate = this.links[indexNewerLink].publicationDate;
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
    var url: string = this.url;
    var headers: any;
    if(localStorage.getItem('use_proxy.' + this.url)) {
        url = this.corsProxyUrl + this.url;
        headers = { headers: {'X-Requested-With': 'XMLHttpRequest' }};
    } else {
        url = this.url;
        headers = { headers: {'Origin': this.url }};
    }
    return axios
      .get(url, )
      // .get(this.url, { headers: {'X-Requested-With': 'XMLHttpRequest' }}) //'X-Requested-With': 'XMLHttpRequest',
      .then((response: Axios.AxiosXHR<string>) => {
        const parser = new DOMParser();
        try {
          var content = response.data;
          const xmlDoc = parser.parseFromString(content, 'text/xml');
          // console.log('xmlDoc:', xmlDoc.documentElement);
          const feedFormat = xmlDoc.documentElement.tagName;
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

          this.sortFeed();

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
      })
      .catch( err => {
          localStorage.setItem('use_proxy.' + this.url, 'true');
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
  }

  private sortFeed = (): void => {
    const inverter = this.isOrderNewerFirst ? -1 : 1;
    this.links = this.links.sort((l1, l2) => { return inverter * (l1.publicationDate < l2.publicationDate ? -1 : 1); });
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
