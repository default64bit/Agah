### FOR DEPLOYMENT
- create app.env and fill it
- move images for articles
- move json files for article and faqs
- build docker image and deply with ```docker-compose up -d --build```, can add ```--scale app=2``` for multi-instance
- call the seeder
- create Consulter admins
- import article and faqs with importer
- make sure to stop mongo-express container