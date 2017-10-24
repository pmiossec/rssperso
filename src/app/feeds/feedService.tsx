import * as axios from 'axios';
import { FeedData, GistStorage, ReadListItem } from '../storage/gistStorage';

const ProxyHeaders = { headers: { 'X-Requested-With': 'XMLHttpRequest' } };

export interface Link extends ReadListItem {
  read: boolean;
  iconUrl: string;
  feedName: string;
}

export class FeedService {
  public httpProtocol: string;
  public logo: string;
  public title: string = 'Future title';
  public webSiteUrl: string | null;
  public links: Link[] = [];
  public allLinks: Link[] = [];
  public content: string;
  public clearDate: Date = new Date(1900, 1, 1);
  private isOrderNewerFirst = false;
  private corsProxyUrl: string;
  private headers: {};
  private shouldDisplayAllLinks: boolean = false;
  private url: string;

  constructor(
    public feedData: FeedData,
    public offsetDate: Date,
    public storage: GistStorage
  ) {
    this.links = [];
    this.title = feedData.name;
    this.logo = feedData.icon;
    this.httpProtocol = window.location.protocol + '//';
    this.corsProxyUrl = this.httpProtocol + 'cors-anywhere.herokuapp.com/';
    if (this.offsetDate !== null) {
      this.restoreInitialClearDate(this.offsetDate);
    }
    this.headers = this.getHeaders(this.feedData.url);
  }

  public clearFeed = (date?: Date): void => {
    this.shouldDisplayAllLinks = false;
    if (date) {
      this.clearDate = date;
      this.links = this.links.filter(l => l.publicationDate > this.clearDate);
    } else {
      if (this.links && this.links.length !== 0) {
        const indexNewerLink = this.isOrderNewerFirst ? 0 : this.links.length - 1;
        this.clearDate = this.links[indexNewerLink].publicationDate;
      } else {
        this.clearDate = new Date();
      }
      this.links = new Array<Link>();
    }
    this.storeClearDate(this.clearDate);
  }

  public getLinksToDisplay(): Link[] {
    return this.shouldDisplayAllLinks ? this.allLinks : this.links;
  }

  public isDisplayingAllLinks(): boolean {
    return this.shouldDisplayAllLinks || this.allLinks.length === this.links.length;
  }

  public displayAllLinks(): void {
    this.shouldDisplayAllLinks = !this.shouldDisplayAllLinks;
  }

  private getHeaders(url: string) {
    // if (localStorage.getItem('use_proxy.' + url)) {
      this.url = this.corsProxyUrl + url;
      return ProxyHeaders;
    // } else {
    //   // no need of a proxy
    //   return { headers: { 'Origin': url } };
    // }
  }

  private processFeedXml = (response: axios.AxiosResponse<string>) => {
    this.allLinks = [];
    this.links = [];
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

      this.allLinks = this.sortFeed(this.allLinks);
      this.links = this.sortFeed(this.links);

      // if (!this.logo || !this.logo.startsWith('http')) {
      //   var parts = this.url.split('/');
      //   this.logo = this.httpProtocol + parts[2] + '/favicon.ico';
      // } else if (!this.logo.startsWith(this.httpProtocol)) {
      //   this.logo = this.httpProtocol + this.logo.split('://')[1];
      // }

      if (!this.title) {
        this.title = this.url;
      }
      // console.log('feed read', this);
    } catch (ex) {
      this.title = `${this.url} Error loading :( Error: ${ex}`;
    }
  }

  // tslint:disable-next-line:member-ordering
  public loadFeedContent(): Promise<void> {
    return axios.default
      .get(this.url, this.headers)
      .then(this.processFeedXml)
      .catch(err => {
        // localStorage.setItem('use_proxy.' + this.url, 'true');
      });
  }

  private storeClearDate(clearDate: Date): void {
    // localStorage.setItem(this.url, clearDate.toJSON());
    this.storage.saveFeedsState(this.feedData.id, clearDate);
  }

  private restoreInitialClearDate(clearDate: Date): void {
    if (this.clearDate < clearDate) {
      this.clearDate = clearDate;
    }
  }

  // private getFaviconUrl(logoUrl: string, webSiteUrl: string): string {
  //   if (!logoUrl && this.webSiteUrl) {
  //     logoUrl = this.formatWebsiteUrl(this.webSiteUrl) + '/favicon.ico';
  //   }
  //   return logoUrl;
  // }

  private manageRssFeed(xmlDoc: HTMLElement): void {
    // console.debug(`Processing Rss feed ( ${this.url} )...`);
    const channel = this.getElementByTagName(xmlDoc, 'channel');
    if (channel) {
      // this.title = this.getElementContentByTagName(channel, 'title');
      this.webSiteUrl = this.getElementContentByTagName(channel, 'link');
      // const imageTag = this.getElementByTagName(channel, 'image');
      // if (imageTag) {
      //   const logoUrl = this.getElementContentByTagName(imageTag, 'url');
      //   this.logo = this.getFaviconUrl(logoUrl, this.webSiteUrl);
      // }
    }

    const items = xmlDoc.getElementsByTagName('item');
    for (var iItems = 0; iItems < items.length; iItems++) {
      var item = items.item(iItems);
      var link = {
        url: this.getElementContentByTagName(item, 'link'),
        title: item ? this.getElementContentByTagName(item, 'title') : 'No tile found :(',
        publicationDate: this.getLinkRssDate(item),
        read: false,
        iconUrl: this.feedData.icon,
        feedName: this.feedData.name,
        idFeed: this.feedData.id
      };

      this.allLinks.push(link);
      if (link.publicationDate > this.clearDate) {
        this.links.push(link);
      }
    }
  }

  private parseDate(date: string): Date {
    return new Date(date.endsWith('Z') ? date.substr(0, date.length - 1) : date);
  }

  private getLinkRssDate(element: Element): Date {
    var publicationDateElement = this.getElementByTagName(element, 'pubDate');
    if (publicationDateElement && publicationDateElement.textContent) {
      return this.parseDate(publicationDateElement.textContent);
    }

    publicationDateElement = this.getElementByTagName(element, 'dc:date');
    if (publicationDateElement && publicationDateElement.textContent) {
      return this.parseDate(publicationDateElement.textContent);
    }

    // console.log('date not found :(', this.url);
    return new Date(2000, 1, 1);
  }

  private getElementContentByTagName(element: Element | Document, tagName: string): string {
    const foundElement = this.getElementByTagName(element, tagName);
    if (foundElement && foundElement.textContent) {
      return foundElement.textContent;
    }
    return '';
  }

  private getElementByTagName(element: Element | Document, tagName: string): Element | null {
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

  // private formatWebsiteUrl(url: string): string {
  //   return url; // .replace('https://', 'http://');
  // }

  private manageAtomFeed(xmlDoc: HTMLElement): void {
    // console.log(`Processing Atom feed ( ${this.url} )...`);
    this.title = this.getElementContentByTagName(xmlDoc, 'title');
    // this.logo = this.getElementContentByTagName(xmlDoc, 'icon');
    const linksWebSite = xmlDoc.getElementsByTagName('link');
    for (var iLinks = 0; iLinks < linksWebSite.length; iLinks++) {
      var tag = linksWebSite.item(iLinks);
      if (tag.getAttribute('rel') === 'alternate') {
        this.webSiteUrl = tag.getAttribute('href');
        break;
      }
    }
    // if (!this.logo && this.webSiteUrl) {
    //   this.logo = this.formatWebsiteUrl(this.webSiteUrl) + '/favicon.ico';
    // }
    const items = xmlDoc.getElementsByTagName('entry');
    for (var iEntries = 0; iEntries < items.length; iEntries++) {
      var item = items.item(iEntries);
      const linkFound = this.getElementByTagName(item, 'link');
      if (!linkFound) {
        continue;
      }
      var link = {
        url: linkFound.getAttribute('href') as string,
        title: this.getElementContentByTagName(item, 'title'),
        publicationDate: this.getLinkAtomDate(item),
        read: false,
        iconUrl: this.feedData.icon,
        feedName: this.feedData.name,
        idFeed: this.feedData.id
      };
      this.allLinks.push(link);
      if (link.publicationDate > this.clearDate) {
        this.links.push(link);
      }
    }
  }

  private sortFeed = (links: Link[]): Link[] => {
    const inverter = this.isOrderNewerFirst ? -1 : 1;
    return links.sort((l1, l2) => { return inverter * (l1.publicationDate < l2.publicationDate ? -1 : 1); });
  }

  private getLinkAtomDate(element: Element): Date {
    var publicationDateElement = this.getElementByTagName(element, 'published');
    if (publicationDateElement && publicationDateElement.textContent) {
      return this.parseDate(publicationDateElement.textContent);
    }

    publicationDateElement = this.getElementByTagName(element, 'updated');
    if (publicationDateElement && publicationDateElement.textContent) {
      return this.parseDate(publicationDateElement.textContent);
    }

    return new Date();
  }
}
