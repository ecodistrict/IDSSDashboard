IDSSDashboard
=============

Dashboard system for Ecodistr-ict IDSS

## Dependencies

* Node.js
* MongoDB
* Grunt
* Bower
* Angular.js

## Install instructions

0. Make sure MongoDB is running on localhost
1. In server folder, run `npm install`
2. In server folder, add 'cert' folder with certificates needed
3. In client folder, run `npm install`
4. In client folder, run `bower install`
5. In client folder, run `grunt build`
6. In server folder, run `NODE_TLS_REJECT_UNAUTHORIZED=0 node server` (only for development!) 

## Production

1. In client folder, run `grunt`
2. Use environmental variables: NODE_ENV=production, DB_CONN=<connection string>
2. In server folder, run `node server`
