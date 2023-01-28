import http from 'node:http';
import { readFileSync } from 'node:fs';
import * as esbuild from 'esbuild';

let serveOptions = {
	port: 8000
};

let buildOptions = {
	entryPoints: ['index.jsx'],
	bundle: true,
	splitting: true,
	format: 'esm'
};

let result = await esbuild.serve(serveOptions, buildOptions);

async function handler(req, res) {
	let pathname = req.url;
	console.log(req.method, req.url);

	if (req.method === 'GET' && pathname === '/') {
		let file = readFileSync('./index.html');
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(file);
        return;
	}

	if (req.method === 'GET' && !pathname.includes('/api')) {
		let contentType;

		if (pathname.includes('.js')) {
			contentType = 'text/javascript';
		}
		else if (pathname.includes('.css')) {
			contentType = 'text/css';
		}
		else {
			contentType = 'text/plain';
		}

		// Use esbuild dev server for static files
		let options = {
			hostname: result.host,
			port: 8000,
			path: req.url,
			method: req.method,
			headers: req.headers,
		};

		var proxyReq = http.request(options, proxyRes => {
			res.writeHead(proxyRes.statusCode, proxyRes.headers);
			proxyRes.pipe(res, { end: true });
		});
	}

	req.pipe(proxyReq, { end: true });
};

let server = http.createServer(handler);
server.listen(3000);
