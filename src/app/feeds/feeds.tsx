import * as React from 'react';
import {Feed} from './feed';

interface IFeedsProps {
  feeds: string[];
};

export const Feeds = (props: IFeedsProps) => {
  return (
    <div className='feeds'>
      {props.feeds.map((url: string, i: number) =>
          <Feed key={i} url={url}/>
      )}
    </div>
  );
};
