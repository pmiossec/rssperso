import * as React from 'react';
import * as axios from 'axios';

export class Feed {
  public logo: string;
  public title: string;
  public news: News[];
  public content: string;
  constructor(
    public url: string,
  ) {
    this.news = [];
    this.title = 'loading...';
  }

  public loadFeedContent(): void {
    // console.log('loading:' + this.url);
    const parser = new DOMParser();
    // console.log('parser', parser);
    axios
      .get(this.url)
      .then((response: Axios.AxiosXHR<string>) => {
        try {
          this.content = response.data;
          const xmlDoc = parser.parseFromString(this.content, 'text/xml');
          console.log('xmlDoc:', xmlDoc);
          const feedFormat = xmlDoc.documentElement.tagName;
          // debugger;
          switch(feedFormat) {
            case 'rss':
              this.manageRssFeed(xmlDoc);
              break;
            case 'feed':
              this.manageAtomFeed(xmlDoc);
              break;
            default:
              this.title = 'Feed format not supported:' + feedFormat;
          }

        } catch (e) {
          this.title = 'Error loading :( Error: ' + e;
        }
      });
  }

  private manageRssFeed(xmlDoc: Document): void {
    console.log('Processing Rss feed...');
    //this.title = this.findChildByTag(xmlDoc, 'title').textContent;
    console.log('title', this.title);
    //this.logo = this.findChildByTag(xmlDoc, 'title').textContent;
    const items = xmlDoc.getElementsByTagName('item');
    for ( var iItems = 0; iItems < items.length; iItems++) {
      var item = items.item(iItems);
      var news = new News(item.children.item(0).textContent, item.children.item(1).textContent);
      console.log(news);
      this.news = [...this.news, news];
    }
  }

  private findChildrenByTag(element: Document|Element, tagName: string): NodeListOf<Element> {
    var elements = element.getElementsByTagName(tagName);
    console.log('elements:', elements);
    return elements;
  }
  private findChildByTag(element: Document|Element, tagName: string): Element {
    return this.findChildrenByTag(element, tagName).item[0];
  }

  private manageAtomFeed(xmlDoc: Document): void {
    console.log('[ToDo] Processing Atom feed...');
    // const items = xmlDoc.getElementsByTagName('item');
    // for ( var iItems = 0; iItems < items.length; iItems++) {
    //   var item = items.item(iItems);
    //   this.news = [...this.news, new News(item.children.item(0).textContent, item.children.item(1).textContent)];
    // }
    this.title = '[ToDo] Processing Atom feed...';
  }
}

export class News {
  constructor(
    public link: string,
    public title: string,
  ) {}
}

const styles = {
  feed: {
    //height: '15rem',
    //width: '15rem',
    border: '1px solid lightgray',
    borderRadius: '1rem',
    margin: '2px',
    padding: '0rem'
  },
  logo: {
    width: '5rem',
    height: '5rem',
    float: 'right',
    margin: '0 0 .5rem .5rem'
  },
  h3: {
    fontSize: '1.5rem',
    margin: '0 0 2rem 0'
  }
};

interface IFeedProps {
  key: number;
  feed: Feed;
};

interface IFeedState {};

export class FeedComponent extends React.Component<IFeedProps, IFeedState> {
  static propTypes = {
    feed: React.PropTypes.object.isRequired
  };

  render() {
    // [ToDo] Comprendre pourquoi les news sont vide!!!!! => parce que ça met du temps!!!
    return (
      <div  style={styles.feed}>
        <h5 style={styles.h3}>
          {this.props.feed.url}
        </h5>
        <div>
          {this.props.feed.title}
          {this.props.feed.news.map((news: News) => (
            <NewsComponent news={news}/>
          ))}
        </div>
      </div>
    );
  }
}

interface INewsProps {
  news: News;
};

interface INewsState {};

export class NewsComponent extends React.Component<INewsProps, INewsState> {
  static propTypes = {
    news: React.PropTypes.object.isRequired
  };

  render() {
    return (
      <div>
        <a href={this.props.news.link} target='_blank' >{this.props.news.title}</a>
      </div>
    );
  }
}
