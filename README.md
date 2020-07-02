### This fork has some new features:
- Validate bundleID to match requirements for Android; [by [@strdr4605](https://github.com/strdr4605)]
- Change package name for other java files; (by @strdr4605) [by [@strdr4605](https://github.com/strdr4605)]
- Add support for App's Name using '&amp' and other special entities;
- Change App's Name and Bundle Identifier in iOS more files (eg.: project.pbxproj, .xcscheme file);
- Add Windows compatibility;
- Able to change only bundle ID without requiring name change

Fork from: https://github.com/junedomingo/react-native-rename

# react-native-rename-next

[![NPM version](https://badge.fury.io/js/react-native-rename-next.svg)](http://badge.fury.io/js/react-native-rename-next)
[![Build Status](https://secure.travis-ci.org/mayconmesquita/react-native-rename-next.png)](http://travis-ci.org/mayconmesquita/react-native-rename-next)

Rename react-native app with just one command

[![NPM](https://nodei.co/npm/react-native-rename-next.png?downloads=true)](https://nodei.co/npm/react-native-rename-next/)

![react-native-rename-next](https://cloud.githubusercontent.com/assets/5106887/24444940/cbcb0a58-149a-11e7-9714-2c7bf5254b0d.gif)

> This package assumes that you created your react-native project using `react-native init`.

**Note:** This package does not attempt to properly rename build artifacts such as `ios/build` or Cocoa Pod installation targets. After renaming your project you should clean, build, and reinstall third party dependencies to get it running properly with the new name.

## Installation
```
npm install react-native-rename-next -g
```

Switch to new branch first
> better to have back-up

```
git checkout -b rename-app
```

## Usage
```
react-native-rename-next <newName>
```

> With custom Bundle Identifier
```
react-native-rename-next <newName> -b <bundleIdentifier>
```

> Change only Bundle Identifier
```
react-native-rename-next <existingName> -b <bundleIdentifier> --bundle-only
```
## Example
```
react-native-rename-next "My App"
```
> With custom Bundle Identifier
```
react-native-rename-next "My App" -b io.github.mayconmesquita.myapp
```
> Changing only Bundle Identifier
```
react-native-rename-next "My App" -b io.github.mayconmesquita.myapp.new --bundle-only
```
<a href="https://www.buymeacoffee.com/mayconmesquita"><img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;"  target="_blank"></a>
