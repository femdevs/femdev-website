# FemDevs Homepage

This is the codebase for the official FemDevs homepage. It is built in Node.js using the Express framework.
Frontend code is writen in Pug.js and TailwindCSS.

For information on exactly what is used, please see the [List of Tools](#list-of-tools) section below.

## How To Run

First, you need to install [Node.js](https://nodejs.org/) and [npm](https://npmjs.com).

To install node, run the following command:

Windows:

```powershell
# Install Git
winget install --id Git.Git -e --source winget

# Install Node.js
Set-ExecutionPolicy Bypass -Scope Process -Force;
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072;
iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'));
choco install nodejs
```

MacOS:

```bash
brew install node npm git
```

Linux:

```bash
# Ubuntu
sudo apt update
sudo apt install nodejs npm git -y
# Fedora / Red Hat
sudo dnf install nodejs npm git -y
# Arch
sudo pacman -Sy nodejs npm git
# openSUSE
sudo zypper install nodejs npm git -y
# CentOS
sudo yum install nodejs npm git -y
```

Then, clone the repository and run the following commands:

```bash
# cloning the repository
git clone
cd femdevs-website
# installing dependencies
npm install
npm run build
```

Make sure to define the following environment variables in a `.env` file:

```env
HOST=''
USER=''
PASSWORD=''
DATABASE=''
DISCORD_TOKEN=''
DISCORD_WEBHOOK=''
FIREBASE_SA=''
CRYPT_PRIV=''
IPINFO_AT=''
AUTH_PROJECT_ID=''
AUTH_API_SECRET=''
VERIPHONE_TOKEN=''
OPEN_WEATHER_API_KEY=''
DAK=''
TAK=''
GMAPS_API_KEY=''
NODE_ENV=''
GH_TOKEN=''
STRIPE=''
STRIPE_WH_SECRET=''
C_IV=''
C_KEY=''
LOCALHOST_PAGE=''
```

Then, launch the server with the following command:

```bash
npm start
```

The Webpage will be available at `http://localhost:3000`. (Note; CDNs, assets, and APIs are automatically setup to pull from the official server (`XXX.thefemdevs.com`), and therefore will not work regualarly on localhost. You will need to make additional modifications to the code to be able to access said resources locally, such as setting the `LOCALHOST_PAGE` enviornment variable.)

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
- [nodemailer](https://nodemailer.com/) => Send e-mails from Node.js
- [node-html-parser](https://npmjs.com/package/node-html-parser) => Fast and forgiving HTML/XML parser
- [html-minifier](https://npmjs.com/package/html-minifier) => A tool to minify HTML
- [@therealbenpai/zdcors](https://npmjs.com/package/@therealbenpai/zdcors) => A simple zero-dependency Web Security middleware for Express.js
- [Free APIs](https://free-apis.github.io/) => Free APIs for developers

## Contributing

If you would like to contribute to the project, please read the Contributing Guidelines at <https://oss.thefemdevs.com/contributing>.

We have a list of contributors at <https://oss.thefemdevs.com/contributors>.

## License

This project is licensed under the Affero General Public License v3.0 - see the License at <https://oss.thefemdevs.com/license> for details.

## Code of Conduct

Please read the Code Of Conduct at <https://oss.thefemdevs.com/code-of-conduct> for details on our code of conduct.

## Contact

If you have any questions, please feel free to reach out to us at <contact@thefemdevs.com>.
