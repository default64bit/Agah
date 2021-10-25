### FOR DEPLOYMENT
- create app.env and fill it

- create DC.env and fill it and move it somewhere safe
- make script in .profile file to set env variables into the system with ```set -o allexport; source /path/to/file/DC.env; set +o allexport```
- check if env variables are set with ```printenv```

- move images for articles
- move json files for article and faqs

- create docker-compose.yml file with docker-compose.yml.example

- create default.conf in nginx folder
- add ssl path into docker-compose.yml

- build docker image and deply with ```docker-compose up -d --build```, we can add ```--scale app=2``` at the end for multi-instance
- or use docker swarm with ```docker stack deploy -c docker-compose.yml <AppName>```

- call the seeder
- create Consulter admins
- import article and faqs with importer

- make sure to stop mongo-express container