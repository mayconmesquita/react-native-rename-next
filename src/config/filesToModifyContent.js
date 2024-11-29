// nS - No Space
// lC - Lowercase

import { slugify } from './utils';

export function filesToModifyContent(currentAppName, newName) {
  const nS_CurrentAppName = slugify(currentAppName).replace(/\s/g, '');
  const nS_NewName = slugify(newName).replace(/\s/g, '');

  return [
    {
      regex: `<string name="app_name">${currentAppName}</string>`,
      replacement: `<string name="app_name">${newName}</string>`,
      paths: ['android/app/src/main/res/values/strings.xml'],
    },
    {
      // replacement without using space ('MyApp' => 'NewApp')
      regex: nS_CurrentAppName,
      replacement: nS_NewName,
      paths: [
        'index.js',
        'index.android.js',
        'index.ios.js',
        `ios/${nS_NewName}.xcodeproj/project.pbxproj`,
        `ios/${nS_NewName}.xcworkspace/contents.xcworkspacedata`,
        `ios/${nS_NewName}.xcodeproj/xcshareddata/xcschemes/${nS_NewName}-tvOS.xcscheme`,
        `ios/${nS_NewName}.xcodeproj/xcshareddata/xcschemes/${nS_NewName}.xcscheme`,
        `ios/${nS_NewName}/AppDelegate.m`,
        'android/settings.gradle',
        `ios/${nS_NewName}Tests/${nS_NewName}Tests.m`,
        'ios/build/info.plist',
        'ios/Podfile',
        'app.json',
      ],
    },
    {
      // replacement using space ('My App' => 'New App')
      regex: currentAppName,
      replacement: newName,
      paths: [
        'index.js',
        'index.android.js',
        'index.ios.js',
        `ios/${nS_NewName}.xcodeproj/project.pbxproj`,
        `ios/${nS_NewName}.xcworkspace/contents.xcworkspacedata`,
        `ios/${nS_NewName}.xcodeproj/xcshareddata/xcschemes/${nS_NewName}-tvOS.xcscheme`,
        `ios/${nS_NewName}.xcodeproj/xcshareddata/xcschemes/${nS_NewName}.xcscheme`,
        `ios/${nS_NewName}/AppDelegate.m`,
        'android/settings.gradle',
        `ios/${nS_NewName}Tests/${nS_NewName}Tests.m`,
        'ios/build/info.plist',
        'ios/Podfile',
        'app.json',
      ],
    },
    {
      regex: `text="${currentAppName}"`,
      replacement: `text="${newName}"`,
      paths: [`ios/${nS_NewName}/Base.lproj/LaunchScreen.xib`],
    },
    {
      regex: currentAppName,
      replacement: newName,
      paths: [`ios/${nS_NewName}/Info.plist`],
    },
    {
      regex: currentAppName,
      replacement: newName,
      paths: [`ios/${nS_NewName}Tests/Info.plist`],
    },
    {
      regex: currentAppName,
      replacement: newName,
      paths: [`ios/InfoPlist.xcstrings`],
    },
    {
      regex: `"name": "${nS_CurrentAppName}"`,
      replacement: `"name": "${nS_NewName}"`,
      paths: ['package.json'],
    },
    {
      regex: `${nS_CurrentAppName}@workspace`,
      replacement: `${nS_NewName}@workspace`,
      paths: ['yarn.lock'],
    },
    {
      regex: `"displayName": "${currentAppName}"`,
      replacement: `"displayName": "${newName}"`,
      paths: ['app.json'],
    },
  ];
}
