<h1 align="center">
	<img src="media/1.png" width="500">
</h1>

> A complete media downloader for Twitter :bird:

[![Build Status](https://travis-ci.org/CodeDotJS/whatiz-cli.svg?branch=master)](https://travis-ci.org/CodeDotJS/twiger)

## Install

```
$ npm install --global twiger
```
 __OR__
```
$ sudo npm install --global twiger
```

## Usage

```
Usage : twiger <command> [info] <option> [info]

Commands:
  u  ❱ twitter username - profile picture
  c  ❱ twitter username - cover picture
  g  ❱ full link        - download gifs

Options:
  -n  save images as                                     [required]

Missing required argument: n
```

## Examples

> Download profile picture of a twitter user.

```
 $ twiger -u tjholowaychuk -n tj-profile
```

> Download cover picture of a twitter user.

```
 $ twiger -c tjholowaychuk -n tj-cover
```

> Download a gif or video.

```
 $ twiger -g https://twitter.com/Rishi_Giri_/status/734001198752108544 -n wowgifs
```

## Note

> Don't give any extension while writing file's name.

__Example :__

```
 $ twiger -u Rishi_Giri_ -n rishi     ( ✔ )

 $ twiger -u Rishi_Giri_ -n rishi.jpg ( ✖ ) 
```

## Related

- [image-of](https://github.com/CodeDotJS/image-of) : Download profile picture of any facebook user.

- [instavim](https://github.com/CodeDotJS/instavim) : A complete Instagram media downloader.

- [gravator-of](https://github.com/CodeDotJS/gravator-of) : Download profile picture of any gravatar user.

## License

MIT &copy; [Rishi Giri](http://rishigiri.com)