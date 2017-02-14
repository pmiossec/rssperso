import * as React from 'react';
import { FeedService } from './feeds/feedService';
import { Feed } from './feeds/feed';
import { ReadingList } from './readingList/readingList';



interface IMainProps { };

interface IMainState { };

export class Main extends React.Component<IMainProps, IMainState> {
  feeds = [
    'http://rss.slashdot.org/Slashdot/slashdot',
    'http://linuxfr.org/news.atom',
    'http://linuxfr.org/journaux.atom',
    'https://www.nextinpact.com/rss/news.xml',
    'http://www.lemonde.fr/rss/une.xml',
    'http://standblog.org/blog/feed/rss2',
    'http://planetKDE.org/rss20.xml',
    'http://www.kde.org/dotkdeorg.rdf',
    'http://www.planet-libre.org/feed.php?type=rss',
    'http://lwn.net/headlines/rss',
    'http://www.clubic.com/c/xml.php?type=news',
    'http://www.framablog.org/index.php/feed/atom',
    'http://feedpress.me/frandroid',
    'http://sxp.microsoft.com/feeds/msdntn/TFS',
    'http://korben.info/feed',
    'http://www.ecrans.fr/spip.php?page=backend',
    'http://www.maitre-eolas.fr/feed/atom',
    'http://vidberg.blog.lemonde.fr/feed/atom/',
    'http://xkcd.com/atom.xml',
    'http://what-if.xkcd.com/feed.atom',
    'http://feeds.feedburner.com/GeekAndPoke',
    'http://tumourrasmoinsbete.blogspot.com/feeds/posts/default?alt=rss',
    'http://dilbert.com/feed',
    'http://secouchermoinsbete.fr/feeds.atom',
    'http://feeds.arstechnica.com/arstechnica/index/?format=xml',
    'http://www.zdnet.fr/feeds/rss/actualites/',
    'http://feedpress.me/minimachines',
    'http://www.infoq.com/rss/rss.action?token=AfW4QujXbXZ8dGSnyBLlLfWstkdmdpgR',
    'http://www.aubryconseil.com/feed/rss2',
    'http://passeurdesciences.blog.lemonde.fr/feed/',
    'http://sciencetonnante.wordpress.com/feed/',
    'http://reflets.info/feed/'
  ].map(url => new FeedService(url));

  clearAll = () => {
    this.feeds.forEach(f => f.clearFeed());
    this.forceUpdate();
  }

  displayAll = () => {
    this.feeds.forEach(f => f.displayAllLinks());
    this.forceUpdate();
  }

  render() {
    return (
      <main className='feeds'>
        <div><a onClick={this.clearAll}>Clear All</a> / <a onClick={this.displayAll}>Show All</a></div>
        <div className='feeds'>
          {this.feeds.map((feed: FeedService, i: number) =>
            <Feed key={i} feed={feed} />
          )}
        </div>
        <ReadingList />
      </main>
    );
  }
}
