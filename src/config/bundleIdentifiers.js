// nS - No Space
// lC - Lowercase

import { slugify } from './utils';

export function bundleIdentifiers(currentAppName, newName, projectName, currentBundleID, newBundleID, newBundlePath) {
  const nS_CurrentAppName = currentAppName.replace(/\s/g, '');
  const nS_NewName = slugify(newName).replace(/\s/g, '');
  const lC_Ns_CurrentBundleID = currentBundleID.toLowerCase();
  const lC_Ns_NewBundleID = newBundleID.toLowerCase();

  return [
    {
      regex: currentBundleID,
      replacement: newBundleID,
      paths: ['android/app/BUCK', 'android/app/build.gradle', 'android/app/src/main/AndroidManifest.xml'],
    },
    {
      regex: currentBundleID,
      replacement: newBundleID,
      paths: [
        `${newBundlePath}/MainActivity.java`,
        `${newBundlePath}/MainActivity.kt`,
        `${newBundlePath}/MainApplication.java`,
        `${newBundlePath}/MainApplication.kt`,
        `${newBundlePath}/SplashActivity.java`,
      ],
    },
    {
      regex: lC_Ns_CurrentBundleID,
      replacement: lC_Ns_NewBundleID,
      paths: [`${newBundlePath}/MainApplication.java`],
    },
    {
      regex: lC_Ns_CurrentBundleID,
      replacement: lC_Ns_NewBundleID,
      paths: [`${newBundlePath}/MainApplication.kt`],
    },
    {
      // App name (probably) doesn't start with `.`, but the bundle ID will
      // include the `.`. This fixes a possible issue where the bundle ID
      // also contains the app name and prevents it from being inappropriately
      // replaced by an update to the app name with the same bundle ID
      regex: new RegExp(`(?!\\.)(.|^)${nS_CurrentAppName}`, 'g'),
      replacement: `$1${nS_NewName}`,
      paths: [`${newBundlePath}/MainActivity.java`],
    },
    {
      // App name (probably) doesn't start with `.`, but the bundle ID will
      // include the `.`. This fixes a possible issue where the bundle ID
      // also contains the app name and prevents it from being inappropriately
      // replaced by an update to the app name with the same bundle ID
      regex: new RegExp(`(?!\\.)(.|^)${nS_CurrentAppName}`, 'g'),
      replacement: `$1${nS_NewName}`,
      paths: [`${newBundlePath}/MainActivity.kt`],
    },
    {
      // Change Bundle ID in iOS (project.pbxproj)
      regex: currentBundleID,
      replacement: newBundleID,
      paths: ['ios/' + nS_NewName + '.xcodeproj/project.pbxproj'],
    },
  ];
}
