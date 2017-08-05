
# MyRss

## Development

### Debug

`yarn start`

### Publish to Github pages

`yarn build && to_ghpages.bat`


### Doc

https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md

## Roadmap

* Use GitHub gist as backend
* Refactoring:
    - extract feed list in the gist + add more data (icon, use_http, name, feed id, ...)
    - no more store icon and site in reading list, store only feed id (to reduce size)
    - store 'use_proxy' in the state
    - archive list in another gist
* Better favicons
* Being able to add to Pocket or Wallabag (from ToDoList or from rss feed)
* Display icon of all feeds on top (toggle show all/none)
