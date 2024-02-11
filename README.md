# FemDevs Homepage

This is the codebase for the official FemDevs homepage. It is built in Node.js using the Express framework.
Frontend code is writen in Pug.js and TailwindCSS.
API uses many free APIs provided by [Free APIs](https://free-apis.github.io/).

## How To Run
First, you need to install [Node.js](https://nodejs.org/) and [npm](https://npmjs.com). Then, you can run the following commands to start the server:
```bash
npm i
npm run build
node .
```

The Webpage will be available at `http://localhost:3000`. (Note; CDNs, assets, and APIs are automatically setup to pull from the official server (`SUBDOMAIN.thefemdevs.com`), and therefore will not work regualarly on localhost. You will need to make additional modifications to the code to be able to access said resources locally.)

## List of Tools
- [Node.js](https://nodejs.org/) => JavaScript runtime
- [Express](https://expressjs.com/) => Web framework for Node.js
- [Pug.js](https://pugjs.org/) => Template engine for Node.js
- [TailwindCSS](https://tailwindcss.com/) => Utility-first CSS framework
- [PostCSS](https://postcss.org/) => A tool for transforming CSS with JavaScript
- [Autoprefixer](https://npmjs.com/package/autoprefixer) => A plugin to parse CSS and add vendor prefixes to CSS rules
- [Chalk](https://npmjs.com/package/chalk) => Terminal string styling done right
- [Dotenv](https://npmjs.com/package/dotenv) => A zero-dependency module that loads environment variables from a .env file into process.env
- [Express-Session](https://npmjs.com/package/express-session) => Create a session middleware
- [Firebase](https://firebase.google.com/) => A platform developed by Google for creating mobile and web applications
- [IP Info](https://ipinfo.io/) => A free IP geolocation API
- [Axios](https://npmjs.com/package/axios) => Promise based HTTP client for the browser and node.js
- [Postgres](https://www.postgresql.org/) => A powerful, open source object-relational database system
- [Response Time](https://npmjs.com/package/response-time) => Response time header for Node.js
- [Stripe](https://stripe.com/) => A suite of payment APIs that powers commerce for online businesses of all sizes
- [vhost](https://npmjs.com/package/vhost) => Create an HTTP server for each virtual host
- [Free APIs](https://free-apis.github.io/) => Free APIs for developers

## Contributing

If you would like to contribute to the project, please read the [CONTRIBUTING.md](CONTRIBUTING.md) file.

## License

This project is licensed under the Affero General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

## Code of Conduct

Please read the [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) file for details on our code of conduct.

## Contributors

We have a list of contributors [here](Contributors). If you would like to be added to the list, please read the [CONTRIBUTING.md](CONTRIBUTING.md) file.

## Contact

If you have any questions, please feel free to reach out to us at [contact@thefemdevs.com](mailto:contact@thefemdevs.com).
