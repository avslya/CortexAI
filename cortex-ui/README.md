This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Start cortex-ui from source code

Step 1. Make sure your node version is 18
```bash
node -v
```

Step 2. Install dependencies:

```bash
yarn 
```

Step 3(Optional). Switching database

cortex-ui uses SQLite as our default database. To use Postgres as the database of cortex-ui, you need to set the two environment variable below.

```bash
# windows
SET DB_TYPE=pg
SET PG_URL=postgres://user:password@localhost:5432/dbname 

# linux or mac
export DB_TYPE=pg
export PG_URL=postgres://user:password@localhost:5432/dbname
```
-  `PG_URL` is the connection string of your postgres database.

To switch back to using SQLite, you can reassign the `DB_TYPE` to `sqlite`.
```
# windows
SET DB_TYPE=sqlite
SET SQLITE_FILE={your_sqlite_file_path} # default is ./db.sqlite3

# linux or mac
export DB_TYPE=sqlite
export SQLITE_FILE={your_sqlite_file_path}
```

Step 4. Run migrations:

```bash
yarn migrate
# or
npm run migrate
```


Step 5. Run the development server:

```bash
# Execute this if you start cortex-engine and ibis-server via docker
# Linux or MacOS
export OTHER_SERVICE_USING_DOCKER=true
export EXPERIMENTAL_ENGINE_RUST_VERSION=false # set to true if you want to use the experimental Rust version of the cortex Engine
# Windows
SET OTHER_SERVICE_USING_DOCKER=true
SET EXPERIMENTAL_ENGINE_RUST_VERSION=false # set to true if you want to use the experimental Rust version of the cortex Engine

# Run the development server
yarn dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


## Development cortex-ui module on local
There are many modules in Cortex AI, to develop cortex-ui, you can start other modules(services) via docker-compose.
In the [Start cortex-ui from source code](#Start-cortex-ui-from-source-code) section, you've know how to start cortex-ui from the source code to develop.
To start other modules via docker-compose, you can follow the steps below.

Step 1. Prepare you .env file
In the CortexAI/docker folder, you can find the .env.example file. You can copy this file to .env.local file.

```bash
# assume current directory is cortex-ui
cd ../docker
cp .env.example .env.local
```
Step 2. Modify your .env.local file
You need to fill the `OPENAI_API_KEY` with your OPENAI api key before starting.

You can also change the `cortex_ENGINE_VERSION`, `cortex_AI_SERVICE_VERSION`, `IBIS_SERVER_VERSION` to the version you want to use.


Step 3. Start the services via docker-compose
```bash
# current directory is CortexAI/docker
docker-compose -f docker-compose-dev.yaml --env-file .env.example up

# you can add a -d flag to run the services in the background
docker-compose -f docker-compose-dev.yaml --env-file .env.example up -d
# then stop the services via
docker-compose -f docker-compose-dev.yaml --env-file .env.example down
```

Step 4. Start cortex-ui from source code
refer to [Start cortex-ui from source code](#Start-cortex-ui-from-source-code) section to start cortex-ui from source code.

Step 5. (Optional) Develop other modules along with cortex-ui

As mentioned above, you can use docker-compose to start other modules. The same applies when developing other modules.
From the perspective of cortex-ui, if you want to develop other modules at the same time, you can stop the container then spin up the module from the source code.

eg: If you want to develop ai-service module, you can stop the ai-service container then start the ai-service from the source code.
```yaml
# docker/docker-compose-dev.yaml
cortex-engine:
    image: ghcr.io/canner/cortex-engine:${cortex_ENGINE_VERSION}
    pull_policy: always
    platform: ${PLATFORM}
    expose:
      - ${cortex_ENGINE_SQL_PORT}
    ports:
      - ${cortex_ENGINE_PORT}:${cortex_ENGINE_PORT}
    volumes:
      - data:/usr/src/app/etc
    networks:
      - cortex
    depends_on:
      - bootstrap
    ...
# comment out the ai-service service
cortex-ai-service:
    image: ghcr.io/canner/cortex-ai-service:${cortex_AI_SERVICE_VERSION}
    pull_policy: always
    platform: ${PLATFORM}
    ports:
      - ${AI_SERVICE_FORWARD_PORT}:${cortex_AI_SERVICE_PORT}
    environment:
      cortex_UI_ENDPOINT: http://host.docker.internal:${cortex_UI_PORT}
      # sometimes the console won't show print messages,
      # using PYTHONUNBUFFERED: 1 can fix this
      PYTHONUNBUFFERED: 1
      CONFIG_PATH: /app/data/config.yaml
    env_file:
      - ${PROJECT_DIR}/.env
    volumes:
      - ${PROJECT_DIR}/config.yaml:/app/data/config.yaml
    networks:
      - cortex
    depends_on:
      - qdrant

ibis-server:
    image: ghcr.io/canner/cortex-engine-ibis:${IBIS_SERVER_VERSION}
    ...
```
Then refer to the README.md or CONTRIBUTION.md file the module for starting the module from the source code. 

eg: refer to the [ai-service README](https://github.com/Canner/CortexAI/blob/main/cortex-ai-service/README.md#start-the-service-for-development) to start the ai-service from the source code.



## FAQ
### Can I have multiple project at the same time in Cortex AI?
We currently do not support multiple projects in Cortex AI. You can only have one project at a time.
But there is a workaround for this. Since cortex Engine is stateless and we store your semantic model in the database(Sqlite or Postgres), 
you can switch between projects by switching the database and make sure you deploying after server started.

> Tip: Define the `DB_TYPE` and `SQLITE_FILE` or `PG_URL` variable to specify which database you intend to use.

eg: 
```bash
# start your first project using default database(sqlite by defulat)
yarn migrate
yarn dev

# ... after onboarding and lots of hard work, you want to switch to another project 
# stop the server

# set another sqlite file
export SQLITE_FILE=./new_project.sqlite
yarn migrate
yarn dev

# In the Browser, ... after another onboarding process and hard work
# you can switch back to the first project by setting the first sqlite file
export SQLITE_FILE=./first_project.sqlite

yarn dev  # no need to do migration again

# in the modeling page, click the deploy button to deploy the project to the cortex-ai-service.
# your Cortex AI is ready to answer your question.
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!