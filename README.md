# FemDevs Homepage

This is the codebase for the official FemDevs homepage. It is built in Node.js using the Express framework.
Frontend code is written in Pug.js and TailwindCSS.

For information on exactly what is used, please see the [List of Tools](#list-of-tools) section below.

## How To Run

### Install Node.js and NPM

First, you need to install [Node.js](https://nodejs.org/) and [npm](https://npmjs.com).

To install Node, either download it from [nodejs.org](https://nodejs.org/), or run one of the following
commands depending on your operating system:

#### Windows

> [!NOTE]
> It is recommended to use PowerShell when possible over Command Prompt, as it is more powerful and has more features.
>
> For the following commands, you may need to run them as an administrator. To do this, right-click on the PowerShell icon and click "Run as Administrator".

##### PowerShell

```powershell
# Install Git
winget install --id Git.Git -e --source winget

# Install Node.js
Set-ExecutionPolicy Bypass -Scope Process -Force;
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072;
iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'));
choco install nodejs
```

##### Command Prompt

```cmd
# Install Git
winget install --id Git.Git -e --source winget

# Install Node.js
@powershell -NoProfile -ExecutionPolicy Bypass -Command "iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))" && SET "PATH=%PATH%;%ALLUSERSPROFILE%\chocolatey\bin"
choco install nodejs
```

#### MacOS

```bash
# Install Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js and NPM
brew install node npm git
```

#### Linux

```bash
# Ubuntu
sudo apt update && sudo apt upgrade
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

### Clone the Repository

After installing Git, Node, and NPM, clone the repository by running the following commands:

```bash
# Cloning the repository
git clone "https://github.com/femdevs/femdev-website"
cd femdevs-website

# Install dependencies
npm install
npm run build
```

### Set Up Environment Variables

Make sure to define the following environment variables in a `.env` file:

> [!IMPORTANT]
> This is the easiest way to set up environment variables. However, it is not recommended for production. For production, use a `.env` file or set the environment variables in your hosting provider's dashboard.
> All of the following environment variables are required for the server to run.

```env
C_IV=''
C_KEY=''
DISCORD_TOKEN=''
DISCORD_CLIENT_ID=''
DISCORD_CLIENT_SECRET=''
DISCORD_REDIRECT_URI=''
DATABASE=''
FIREBASE_API_KEY=''
FIREBASE_APP_ID=''
FIREBASE_AUTH_DOMAIN=''
FIREBASE_MEASUREMENT_ID=''
FIREBASE_PROJECT_ID=''
FIREBASE_SA_TYPE=''
FIREBASE_SA_PRIVATE_KEY_ID=''
FIREBASE_SA_PRIVATE_KEY=''
FIREBASE_SA_CLIENT_EMAIL=''
FIREBASE_SA_CLIENT_ID=''
FIREBASE_SA_AUTH_URI=''
FIREBASE_SA_TOKEN_URI=''
FIREBASE_SA_AUTH_PROVIDER_X509_CERT_URL=''
FIREBASE_SA_CLIENT_X509_CERT_URL=''
FIREBASE_SA_UNIVERSE_DOMAIN=''
GMAPS_API_KEY=''
HOST=''
IPINFO_AT=''
LOCALHOST_PAGE=''
NODE_ENV=''
PASSWORD=''
PORT=''
USER=''
STRIPE=''
STRIPE_WH_SECRET=''
SPOTIFY_ACCESS_TOKEN=''
SPOTIFY_CLIENT_ID=''
SPOTIFY_CLIENT_SECRET=''
SPOTIFY_REDIRECT_URI=''
SPOTIFY_REFRESH_TOKEN=''
VERIPHONE_TOKEN=''
```

### Run the Development Server

To run the server, enter in the following command:

```bash
npm run dev
```

> [!WARNING]
> The Webpage will be available at `http://localhost:<ENV.PORT | 3000>`.
>
> CDNs, assets, and APIs are automatically setup to pull from the official server (`XXX.thefemdevs.com`), and therefore will not work regularly on localhost.
> You will need to make additional modifications to the code to be able to access said resources locally, such as setting the `LOCALHOST_PAGE` environment variable.

## Contributing

If you would like to contribute to the project, please read the Contributing Guidelines at <https://oss.thefemdevs.com/contributing>.

We have a list of contributors at <https://oss.thefemdevs.com/contributors>.

If you would like to make a fiscal contribution to the project, please visit <https://opencollective.com/femdevs/projects/femdevs-website>. Any and all contributions are greatly appreciated.

## License

This project is licensed under the Affero General Public License v3.0 - see the License at <https://oss.thefemdevs.com/license> for details.

## Code of Conduct

Please read the Code Of Conduct at <https://oss.thefemdevs.com/code-of-conduct> for details on our code of conduct.

## Contact

If you have any questions, please feel free to reach out to us at <contact@thefemdevs.com>.

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
- [IP Info](https://ipinfo.io/) => A free IP geo-location API
- [Axios](https://npmjs.com/package/axios) => Promise based HTTP client for the browser and node.js
- [Postgres](https://www.postgresql.org/) => A powerful, open source object-relational database system
- [Response Time](https://npmjs.com/package/response-time) => Response time header for Node.js
- [Stripe](https://stripe.com/) => A suite of payment APIs that powers commerce for online businesses of all sizes
- [vhost](https://npmjs.com/package/vhost) => Create an HTTP server for each virtual host
- [nodemailer](https://nodemailer.com/) => Send e-mails from Node.js
- [node-html-parser](https://npmjs.com/package/node-html-parser) => Fast and forgiving HTML/XML parser
- [html-minifier](https://npmjs.com/package/html-minifier) => A tool to minify HTML
- [@therealbenpai/zdcors](https://npmjs.com/package/@therealbenpai/zdcors) => A simple zero-dependency Web Security middleware for Express.js
- [Spotify Web API](https://developer.spotify.com/documentation/web-api/) => A set of web APIs to access Spotify music catalog
- [Google Maps API](https://developers.google.com/maps) => A set of APIs to access Google Maps data
- [Discord API](https://discord.com/developers/docs/intro) => A set of APIs to access Discord data
- [Stripe API](https://stripe.com/docs/api) => A set of APIs to access Stripe data
- [GitHub API](https://docs.github.com/en/rest) => A set of APIs to access GitHub data
- [Veriphone API](https://veriphone.io/) => A set of APIs to access phone number data
- [Free APIs](https://free-apis.github.io/) => Free APIs for developers
- [Preline](preline.co) => A TailwindCSS component library service with hundreds of components and templates for free
- [GitGuardian](https://gitguardian.com/) => A tool to scan for secrets in your code
- [DeepSource](https://deepsource.io/) => A tool to scan for code quality and security issues
- [Eslint](https://eslint.org/) => A tool to find and fix problems in your JavaScript code
