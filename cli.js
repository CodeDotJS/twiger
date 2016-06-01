#!/usr/bin/env node

'use strict';

/* dependencies */
const dns = require('dns');
const fs = require('fs');
const https = require('https');
const mkdirp = require('mkdirp');
const got = require('got');
const cheerio = require('cheerio');
const colors = require('colors/safe');

// for templating
const arrow = colors.cyan.bold('❱');

const argv = require('yargs')
	.usage(colors.cyan.bold('\nUsage : $0 <command> [info] <option> [info]'))
	.command('u', ` ${arrow} twitter username - profile picture                 `)
	.command('c', ` ${arrow} twitter username - cover picture                   `)
	.command('g', ` ${arrow} full link        - download gifs                   `)
	.demand(['n'])
	.describe('n', `${arrow}  save images as`)
	.example(colors.yellow.bold('\n$0 -u spacex -n rocks'))
	.argv;

const updateNotifier = require('update-notifier');
const pkg = require('./package.json');
updateNotifier({pkg}).notify();

const savedMedia = 'Twitter/';

// check connection
dns.lookup('twitter.com', err => {
	if (err && err.code === 'ENOTFOUND') {
		console.log(colors.red.bold('\n ❱ Internet Connection    :    ✖\n'));
		process.exit(1);
	}
	// initially create directory
	mkdirp(savedMedia, err => {
		if (err) {
			process.exit(1);
			console.log(err);
		} else {
			// single mkdirp was creating problem for some reason
		}
	});
});

// gif's preview images is stored in css
// therefore, regex to extract the image link
function matchRegEx(backURL) {
	const regPar = /(?:\(['"]?)(.*?)(?:['"]?\))/;
	return regPar.exec(backURL)[1];
}

// previews are images (initially)
// chaning them to working gifs
function convertImageToVideo(imageURL) {
	return imageURL.replace('tweet_video_thumb', 'tweet_video').replace('.jpg', '.mp4');
}

// dirty way to check if user entered a url realted to twitter
function checkURL(isURL) {
	if (isURL.indexOf('https://twitter.com') === -1) {
		return false;
	}
	return true;
}

// finding extension of images
function parseExtension(imageLink) {
	return imageLink.split('.').pop();
}

const profileArg = argv.u;
const coverArg = argv.c;

// passed argument
const profileMedia = `https://twitter.com/${profileArg}`;
const coverMedia = `https://twitter.com/${coverArg}`;

const gifMedia = argv.g;

// messages used all over the tool
const messageDisplay = colors.green.bold(savedMedia.replace('./', '').replace('/', ''));
const argName = colors.green.bold(argv.n);
const saveMessage = colors.cyan.bold(` Image Saved In      :   ${messageDisplay} ❱ ${argName}.`);
const gifMessage = colors.cyan.bold(` GIF Saved In      :   ${messageDisplay} ❱ ${argName}.  `);

// for downloading profile picture of a twitter user
if (argv.u) {
	got(profileMedia).then(res => {
		const $ = cheerio.load(res.body);
		const getProfileLink = $('.ProfileAvatar-image').attr('src');
		// function used to extract image's extension
		const getExt = parseExtension(getProfileLink);
		const mediaName = argv.n;
		// making extension valid
		const addExtension = `${mediaName}.${getExt}`;
		// using mkdirp once was creating problem, so this solved the problem
		mkdirp(savedMedia, err => {
			if (err) {
				process.exit(1);
				// exiting before showing errors
				console.log(err);
			} else {
				console.log(colors.cyan.bold('\n ❱ Directory Created   :   ✔\n'));
			}
		});
		// saving images
		const file = fs.createWriteStream(savedMedia + addExtension);
		// downloading files
		https.get(getProfileLink, (res, cb) => {
			res.pipe(file);
			// download complete
			file.on('finish', () => {
				file.close(cb);
				console.log(colors.green.bold(` ${arrow}${saveMessage}${getExt}`, '\n'));
			});
		}); // handling errors and exiting if any
	}).catch(error => {
		console.log(colors.red.bold('\n ❱ Twitter User    :    ✖\n'));
		process.exit(1);
		console.log(error);
	});
}

// for downloading cover images
if (argv.c) {
	got(coverMedia).then(res => {
		const $ = cheerio.load(res.body);
		// finding cover's url
		const getCoverLink = $('.ProfileCanopy-headerBg img').attr('src');
		// passed filename's argument
		const coverName = argv.n;
		// for backup, saves from unexpected errors
		mkdirp(savedMedia, err => {
			if (err) {
				process.exit(1);
				console.log(err);
			} else {
				console.log(colors.cyan.bold('\n ❱ Directory Created   :   ✔\n'));
			}
		});
		// downloading and saving cover
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

// for downloading gifs from twitter
if (argv.g) {
	// checking if url is valid
	if (checkURL(gifMedia) === false) {
		console.log(colors.red.bold('\n ❱ Link is valid    :    ✖\n'));
		// stop the process if url is not valid
		process.exit(1);
	}
	got(gifMedia).then(res => {
		const $ = cheerio.load(res.body);
		// gif's links are cotained in css
		// attr('style') makes it easy to find
		// matchRegEx extracts the required url by removing background('')
		const getMediaLink = matchRegEx(($('.PlayableMedia-player').attr('style')));
		// previews are images
		// changing image's url to downloadable mp4 version
		const gifLink = convertImageToVideo(getMediaLink);
		// ofcourse it's .gif, but downloader is little foolish
		const gifExtension = parseExtension(gifLink);
		const gifName = argv.n;
		const finalExt = `${gifName}.${gifExtension}`;
		// backup mkdirp :)
		mkdirp(savedMedia, err => {
			if (err) {
				process.exit(1);
				console.log(err);
			} else {
				console.log(colors.cyan.bold('\n ❱ Directory Created   :   ✔\n'));
			}
		});
		// downloading and saving gifs to the default folder
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
