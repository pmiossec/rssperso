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

interface IMainProps {};

interface IMainState {};

export class Main extends React.Component<IMainProps, IMainState> {
  render() {
    return (
      <div style={styles.container}>
        <main style={styles.main}>
          <Feeds/>
          <ReadingList/>
        </main>
      </div>
    );
  }
}
