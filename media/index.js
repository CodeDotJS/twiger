'use strict';

var got = require('got');

var cheerio = require('cheerio');

var Promise = require('pinkie-promise');

module.exports = function (username) {
	if (typeof username !== 'string') {
		return Promise.reject(new Error('package name required'));
	}

	var url = 'https://twitter.com/' + username;

	return got(url).then(function (res) {
		var $ = cheerio.load(res.body);

		return {
			shit: $('.ProfileAvatar-image').attr('src') || null,
			fuck: $('.ProfileCanopy-headerBg img').attr('src') || null
		};
	}).catch(function (err) {
		if (err.statusCode === 404) {
			err.message = 'user doesn\'t exist';
		}

		throw err;
	});
};
