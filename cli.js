#!/usr/bin/env node

'use strict';

const os = require('os');
const fs = require('fs');
const dns = require('dns');
const https = require('https');
const fse = require('fs-extra');
const got = require('got');
const isURL = require('is-url');
const chalk = require('chalk');
const logUpdate = require('log-update');
const ora = require('ora');
const updateNotifier = require('update-notifier');
const pkg = require('./package.json');

updateNotifier({pkg}).notify();

const arg = process.argv[2];
const inf = process.argv[3];

const pre = chalk.cyan.bold('›');
const pos = chalk.red.bold('›');

const args = ['-p', '--profile', '-c', '--cover', '-g', '--gif'];

if (!arg || arg === '-h' || arg === '--help' || args.indexOf(arg) === -1) {
	console.log(`
  Complete Twitter media downloader!

  ${chalk.cyan('Usage   :')} twiger <command> [username/link]

  ${chalk.cyan('Command :')}
  -p, --profile       Download profile picture of a twitter user.
  -c, --cover         Download cover picture of a twitter user.
  -g, --gif           Download gifs.

  ${chalk.cyan('Help    :')}
  $ twiger -p iamdevloper
  $ twiger -g <url>

  ${chalk.dim('Images are saved in Twgier under your home directory!')}
  `);
	process.exit(1);
}

const spinner = ora();

const url = `https://twitter.com/${inf}`;

const checkConnection = () => {
	dns.lookup('twitter.com', err => {
		if (err) {
			logUpdate(`\n${pos} ${chalk.dim('Please check your internet connection!')}\n`);
			process.exit(1);
		} else {
			logUpdate();
			spinner.text = 'Twiggering';
			spinner.start();
		}
	});
};

const folder = `${os.homedir()}/Twiger/`;

fse.ensureDir(folder, err => {
	if (err) {
		process.exit(1);
	}
});

const checkMessage = () => {
	logUpdate();
	spinner.text = 'Please wait';
	spinner.start();
};

const downloadMessage = () => {
	logUpdate();
	spinner.text = 'Downloading Media!';
};

const errMessage = () => {
	spinner.stop();
	logUpdate(`\n${pos} ${chalk.dim('Invalid username/link')}\n`);
};

const showOnce = () => {
	checkMessage();
	checkConnection();
};

const download = (media, file) => {
	file = file || '';
	const fileName = Math.random().toString(15).substr(4, 5);
	const save = fs.createWriteStream(`${folder}${fileName}.${file}`);
	https.get(media, (res, cb) => {
		spinner.start();
		res.pipe(save);
		save.on('finish', () => {
			logUpdate(`\n${pre} Media Saved!\n`);
			save.close(cb);
			spinner.stop();
			save.on('error', () => {
				process.exit(1);
			});
		});
	});
	return;
};

if (arg === '-p' || arg === '--profile') {
	showOnce();
	got(url).then(res => {
		downloadMessage();
		const body = res.body;
		const link = body.split('data-resolved-url-large="')[1].split('"')[0].trim();
		const ext = link.split('.').pop();
		download(link, ext);
	}).catch(err => {
		if (err) {
			errMessage();
		}
	});
}

if (arg === '-c' || arg === '--cover') {
	showOnce();
	got(url).then(res => {
		downloadMessage();
		const body = res.body;
		const link = body.split('1500x500')[0].split('src="')[2];
		download(`${link}1500x500`, '.jpg');
	}).catch(err => {
		if (err) {
			errMessage();
		}
	});
}

if (arg === '-g' || arg === '--gif') {
	if (isURL(inf) === false) {
		logUpdate(`\n${pos} ${chalk.dim('Please provide a valid url')}\n`);
		process.exit(1);
	}
	showOnce();
	got(inf).then(res => {
		downloadMessage();
		const gif = res.body;
		const id = gif.split('tweet_video_thumb/')[1].split(`.jpg`)[0];
		const url = `https://video.twimg.com/tweet_video/${id}.mp4`;
		download(url, 'mp4');
	}).catch(err => {
		if (err) {
			errMessage();
		}
	});
}
