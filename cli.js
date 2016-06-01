#!/usr/bin/env node

'use strict';

const dns = require('dns');
const mkdirp = require('mkdirp');
const got = require('got');
const cheerio = require('cheerio');
const fs = require('fs');
const https = require('https');
const colors = require('colors/safe');

const arrow = colors.cyan.bold('❱');

const argv = require('yargs')
	.usage(colors.cyan.bold('\nUsage : $0 <command> [info] <option> [info]'))
	.command('u', ` ${arrow} twitter username - profile picture                 `)
	.command('c', ` ${arrow} twitter username - cover picture                   `)
	.command('g', ` ${arrow} full link        - download gifs                   `)
	.demand(['n'])
	.describe('n', `${arrow}  save images as`)
	.example(colors.cyan.bold('\n$0 -u tjholowaychuk -n tj'))
	.argv;

const updateNotifier = require('update-notifier');
const pkg = require('./package.json');
updateNotifier({pkg}).notify();

const savedMedia = 'Twitter/';

dns.lookup('twitter.com', err => {
	if (err && err.code === 'ENOTFOUND') {
		console.log(colors.red.bold('\n ❱ Internet Connection    :    ✖\n'));
		process.exit(1);
	}
	mkdirp(savedMedia, err => {
		if (err) {
			process.exit(1);
			console.log(err);
		} else {
			// single mkdirp was creating problem for some reason
		}
	});
});

function matchRegEx(backURL) {
	const regPar = /(?:\(['"]?)(.*?)(?:['"]?\))/;
	return regPar.exec(backURL)[1];
}

function convertImageToVideo(imageURL) {
	return imageURL.replace('tweet_video_thumb', 'tweet_video').replace('.jpg', '.mp4');
}

function checkURL(isURL) {
	if (isURL.indexOf('https://twitter.com') === -1) {
		return false;
	}
	return true;
}

function parseExtension(imageLink) {
	return imageLink.split('.').pop();
}

const profileArg = argv.u;
const coverArg = argv.c;

const profileMedia = `https://twitter.com/${profileArg}`;
const coverMedia = `https://twitter.com/${coverArg}`;

const gifMedia = argv.g;

const messageDisplay = colors.green.bold(savedMedia.replace('./', '').replace('/', ''));
const argName = colors.green.bold(argv.n);
const saveMessage = colors.cyan.bold(` Image Saved In      :   ${messageDisplay} ❱ ${argName}.`);
const gifMessage = colors.cyan.bold(` GIF Saved In      :   ${messageDisplay} ❱ ${argName}.  `);

if (argv.u) {
	got(profileMedia).then(res => {
		const $ = cheerio.load(res.body);
		const getProfileLink = $('.ProfileAvatar-image').attr('src');
		const getExt = parseExtension(getProfileLink);
		const mediaName = argv.n;
		const addExtension = `${mediaName}.${getExt}`;
		mkdirp(savedMedia, err => {
			if (err) {
				process.exit(1);
				console.log(err);
			} else {
				console.log(colors.cyan.bold('\n ❱ Directory Created   :   ✔\n'));
			}
		});
		const file = fs.createWriteStream(savedMedia + addExtension);
		https.get(getProfileLink, (res, cb) => {
			res.pipe(file);
			file.on('finish', () => {
				file.close(cb);
				console.log(colors.green.bold(` ${arrow}${saveMessage}${getExt}`, '\n'));
			});
		});
	}).catch(error => {
		console.log(colors.red.bold('\n ❱ Twitter User    :    ✖\n'));
		process.exit(1);
		console.log(error);
	});
}

if (argv.c) {
	got(coverMedia).then(res => {
		const $ = cheerio.load(res.body);
		const getCoverLink = $('.ProfileCanopy-headerBg img').attr('src');
		const coverName = argv.n;
		mkdirp(savedMedia, err => {
			if (err) {
				process.exit(1);
				console.log(err);
			} else {
				console.log(colors.cyan.bold('\n ❱ Directory Created   :   ✔\n'));
			}
		});
		const file = fs.createWriteStream(savedMedia + `${coverName}.jpg`);
		https.get(getCoverLink, (res, cb) => {
			res.pipe(file);
			file.on('finish', () => {
				file.close(cb);
				console.log(colors.green.bold(` ${arrow}${saveMessage}jpg`, '\n'));
			});
		});
	}).catch(error => {
		console.log(colors.red.bold('\n ❱ Twitter User    :    ✖\n'));
		process.exit(1);
		console.log(error);
	});
}

if (argv.g) {
	if (checkURL(gifMedia) === false) {
		console.log(colors.red.bold('\n ❱ Link is valid    :    ✖\n'));
		process.exit(1);
	}
	got(gifMedia).then(res => {
		const $ = cheerio.load(res.body);
		const getMediaLink = matchRegEx(($('.PlayableMedia-player').attr('style')));
		const gifLink = convertImageToVideo(getMediaLink);
		const gifExtension = parseExtension(gifLink);
		const gifName = argv.n;
		const finalExt = `${gifName}.${gifExtension}`;
		mkdirp(savedMedia, err => {
			if (err) {
				process.exit(1);
				console.log(err);
			} else {
				console.log(colors.cyan.bold('\n ❱ Directory Created   :   ✔\n'));
			}
		});
		const file = fs.createWriteStream(savedMedia + finalExt);
		https.get(gifLink, (res, cb) => {
			res.pipe(file);
			file.on('finish', () => {
				file.close(cb);
				console.log(colors.green.bold(` ${arrow}${gifMessage}mp4`, '\n'));
			});
		});
	}).catch(error => {
		console.log(colors.red.bold('\n Link related to GIF   :   ✖\n'));
		process.exit(1);
		console.log(error);
	});
}
