const router = require('express').Router();
const fs = require('fs');

router
	.get('/img/:file', (req, res) => {
		let mime = '',
			enc = undefined;
		switch (req.params.file.split('.').at(-1)) {
		case 'gif':
			mime = 'image/gif';
			break;
		case 'jpg':
		case 'jpeg':
			mime = 'image/jpeg';
			break;
		case 'svg':
			mime = 'image/svg+xml';
			enc = 'utf8';
		case 'png':
			mime = 'image/png';
			break;
		case 'ico':
			mime = 'image/vnd.microsoft.icon';
			break;
		default:
			mime = 'text/plain';
			enc = 'utf8';
			break;
		}
		res
			.setHeader('Content-Type', mime)
			.send(fs.readFileSync(`${__dirname}/../assets/imgs/${req.params.file}`, enc));
	})
	.get('/js/:file', (req, res) =>
		res
			.setHeader('Content-Type', 'text/javascript')
			.send(fs.readFileSync(`${__dirname}/../assets/js/${req.params.file}.js`, 'utf8')),
	)
	.get('/css/:file', (req, res) =>
		res
			.setHeader('Content-Type', 'text/css')
			.send(fs.readFileSync(`${__dirname}/../assets/css/${req.params.file}.css`, 'utf8')),
	)
	.get('/font/:file', (req, res) =>
		res
			.setHeader('Content-Type', 'font/ttf')
			.send(fs.readFileSync(`${__dirname}/../assets/fonts/${req.params.file}.ttf`, 'utf8'));
	);

module.exports = router;
