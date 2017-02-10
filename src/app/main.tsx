import * as React from 'react';
import {Feeds} from './feeds/feeds';
import {ReadingList} from './readingList/readingList';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100%'
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  }
};

const feeds = [
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
];

export const Main = () => {
  return (
    <div style={styles.container}>
      <main style={styles.main}>
        <Feeds feeds={feeds}/>
        <ReadingList />
      </main>
    </div>
  );
};
