#!/usr/bin/env node

// nS - No Space
// lC - Lowercase

import cheerio from 'cheerio';
import colors from 'colors';
import fs from 'fs';
import program from 'commander';
import replace from 'node-replace';
import shell from 'shelljs';
import pjson from '../package.json';
import path from 'path';
import replaceLast from 'replace-last';
import { foldersAndFiles } from './config/foldersAndFiles';
import { filesToModifyContent } from './config/filesToModifyContent';
import { bundleIdentifiers } from './config/bundleIdentifiers';
import { extractCurrentBundleID, slugify } from './config/utils';
import 'regenerator-runtime/runtime';

const isWin = process.platform === 'win32';
const devTestRNProject = ''; // For Development eg '/Users/junedomingo/Desktop/RN49'
const __dirname = devTestRNProject || process.cwd();
const projectName = pjson.name;
const replaceOptions = {
  recursive: true,
  silent: true,
};

function readFile(filePath, encode = '') {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, encode || '', (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  });
}

function replaceContent(regex, replacement, paths) {
  replace({
    regex,
    replacement,
    paths,
    ...replaceOptions,
  });

  for (const filePath of paths) {
    console.log(`${filePath.replace(__dirname, '')} ${colors.green('MODIFIED CONTENT')}`);
  }
}

const deletePreviousBundleDirectory = ({ oldBundleNameDir, shouldDelete }) => {
  if (shouldDelete) {
    const dir = oldBundleNameDir.replace(/\./g, '/');
    const deleteDirectory = shell.rm('-rf', dir);
    Promise.resolve(deleteDirectory);
    console.log('Done removing previous bundle directory.');
  } else {
    Promise.resolve();
    console.log('Bundle directory was not changed. Keeping...'.yellow);
  }
};

const cleanBuilds = () => {
  const deleteDirectories = shell.rm('-rf', [
    path.join(__dirname, 'ios/build/*'),
    path.join(__dirname, 'android/.gradle/*'),
    path.join(__dirname, 'android/app/build/*'),
    path.join(__dirname, 'android/build/*'),
  ]);
  Promise.resolve(deleteDirectories);
  console.log('Done removing builds.');
};

readFile(path.join(__dirname, 'android/app/src/main/res/values/strings.xml'))
  .then(data => {
    const $ = cheerio.load(data);
    const currentAppName = $('string[name=app_name]').html();

    const nS_CurrentAppName = slugify(currentAppName).replace(/\s/g, '');
    const lC_Ns_CurrentAppName = nS_CurrentAppName.toLowerCase();

    program
      .version('2.6.3')
      .arguments('<newName>')
      .option('-b, --bundleID [value]', 'Set custom bundle identifier eg. "com.junedomingo.travelapp"')
      .action(newName => {
        const nS_NewName = slugify(newName).replace(/\s/g, '');
        const pattern = /^([\p{Letter}\p{Number}])+([\p{Letter}\p{Number}\s]+)$/u;
        const lC_Ns_NewAppName = nS_NewName.toLowerCase();
        const bundleID = program.bundleID ? program.bundleID.toLowerCase() : null;
        let newBundlePath;
        const listOfFoldersAndFiles = foldersAndFiles(currentAppName, newName);
        const listOfFilesToModifyContent = filesToModifyContent(currentAppName, newName, projectName);

        if (bundleID) {
          newBundlePath = bundleID.replace(/\./g, '/');
          const id = bundleID.split('.');
          const validBundleID = /^([a-zA-Z]([a-zA-Z0-9_])*\.)+[a-zA-Z]([a-zA-Z0-9_])*$/u;
          if (id.length < 2) {
            return console.log(
              'Invalid Bundle Identifier. Add something like "com.travelapp" or "com.junedomingo.travelapp"'
            );
          }
          if (!validBundleID.test(bundleID)) {
            return console.log(
              'Invalid Bundle Identifier. It must have at least two segments (one or more dots). Each segment must start with a letter. All characters must be alphanumeric or an underscore [a-zA-Z0-9_]'
            );
          }
        }

        if (!pattern.test(newName)) {
          return console.log(
            `"${newName}" is not a valid name for a project. Please use a valid identifier name (alphanumeric and space).`
          );
        }

        if (newName === currentAppName || newName === nS_CurrentAppName || newName === lC_Ns_CurrentAppName) {
          return console.log('Please try a different name.');
        }

        // Move files and folders from ./config/foldersAndFiles.js
        const resolveFoldersAndFiles = new Promise(resolve => {
          listOfFoldersAndFiles.forEach((element, index) => {
            const dest = replaceLast(element, new RegExp(nS_CurrentAppName, 'i'), nS_NewName);
            let itemsProcessed = 1;
            const successMsg = `/${dest} ${colors.green('RENAMED')}`;

            setTimeout(() => {
              itemsProcessed += index;

              if (fs.existsSync(path.join(__dirname, element))) {
                const move = shell.exec(`git mv "${path.join(__dirname, element)}" "${path.join(__dirname, dest)}"`);

                if (move.code === 0) {
                  console.log(successMsg);
                } else if (move.code === 128) {
                  // if "outside repository" error occured
                  if (shell.mv('-f', path.join(__dirname, element), path.join(__dirname, dest)).code === 0) {
                    console.log(successMsg);
                  } else {
                    console.log("Ignore above error if this file doesn't exist");
                  }
                }
              }

              if (itemsProcessed === listOfFoldersAndFiles.length) {
                resolve();
              }
            }, 200 * index);
          });
        });

        // Modify file content from ./config/filesToModifyContent.js
        const resolveFilesToModifyContent = () =>
          new Promise(resolve => {
            let filePathsCount = 0;
            let itemsProcessed = 0;
            listOfFilesToModifyContent.map(file => {
              filePathsCount += file.paths.length;

              file.paths.map((filePath, index) => {
                const newPaths = [];

                setTimeout(() => {
                  itemsProcessed++;
                  if (fs.existsSync(path.join(__dirname, filePath))) {
                    newPaths.push(path.join(__dirname, filePath));
                    replaceContent(file.regex, file.replacement, newPaths);
                  }
                  if (itemsProcessed === filePathsCount) {
                    resolve();
                  }
                }, 200 * index);
              });
            });
          });

        const resolveJavaFiles = () =>
          new Promise(resolve => {
            readFile(path.join(__dirname, 'android/app/build.gradle'), 'utf-8').then(data => {
              const currentBundleID = extractCurrentBundleID(data);
              const newBundleID = program.bundleID ? bundleID : `com.${lC_Ns_NewAppName}`;
              const javaFileBase = '/android/app/src/main/java';
              const newJavaPath = `${javaFileBase}/${newBundleID.replace(/\./g, '/')}`;
              const currentJavaPath = `${javaFileBase}/${currentBundleID.replace(/\./g, '/')}`;

              if (bundleID) {
                newBundlePath = newJavaPath;
              } else {
                newBundlePath = newBundleID.replace(/\./g, '/').toLowerCase();
                newBundlePath = `${javaFileBase}/${newBundlePath}`;
              }

              const fullCurrentBundlePath = path.join(__dirname, currentJavaPath);
              const fullNewBundlePath = path.join(__dirname, newBundlePath);

              // Create new bundle folder if doesn't exist yet
              if (!fs.existsSync(fullNewBundlePath)) {
                shell.mkdir('-p', fullNewBundlePath);

                const successMsg = `${newBundlePath} ${colors.green('BUNDLE INDENTIFIER CHANGED')}`;
                let move;

                if (isWin) {
                  const files = shell.ls(`${fullCurrentBundlePath}`);
                  files.forEach(file => {
                    if (move && move.code !== 0) {
                      return;
                    }

                    const from = `${fullCurrentBundlePath}/${file}`;
                    const to = `${fullNewBundlePath}/${file}`;
                    move = shell.exec(`git mv "${from}" "${to}"`);
                  });
                } else {
                  move = shell.exec(`git mv "${fullCurrentBundlePath}/"* "${fullNewBundlePath}"`);
                }

                if (move.code === 0) {
                  console.log(successMsg);
                } else if (move.code === 128) {
                  // if "outside repository" error occured
                  if (shell.mv('-f', fullCurrentBundlePath + '/*', fullNewBundlePath).code === 0) {
                    console.log(successMsg);
                  } else {
                    console.log(`Error moving: "${currentJavaPath}" "${newBundlePath}"`);
                  }
                }
              }

              const vars = {
                currentBundleID,
                newBundleID,
                newBundlePath,
                javaFileBase,
                currentJavaPath,
                newJavaPath,
              };
              resolve(vars);
            });
          });

        const resolveBundleIdentifiers = params =>
          new Promise(async resolve => {
            const { currentBundleID, newBundleID, newBundlePath, javaFileBase, currentJavaPath, newJavaPath } = params;

            const bundleIdentifiersFiles = bundleIdentifiers(
              currentAppName,
              newName,
              projectName,
              currentBundleID,
              newBundleID,
              newBundlePath
            );

            for (const file of bundleIdentifiersFiles) {
              for (const filePath of file.paths) {
                const newPaths = [];

                if (fs.existsSync(path.join(__dirname, filePath))) {
                  newPaths.push(path.join(__dirname, filePath));

                  await new Promise(res => setTimeout(res, 100));

                  replaceContent(file.regex, file.replacement, newPaths);
                }
              }
            }

            const resolvePromise = () => {
              const oldBundleNameDir = path.join(__dirname, javaFileBase, currentBundleID);
              resolve({ oldBundleNameDir, shouldDelete: currentJavaPath !== newJavaPath });
            };

            // * Next section finds all java files and replace package name
            // ! Maybe not the best approach
            // TODO: Find another solution
            const newAndroidPath = path.join(__dirname, newBundlePath);

            try {
              const files = fs.readdirSync(newAndroidPath);
              const filePaths = files.map(file => `${newAndroidPath}/${file}`);

              replace({
                regex: currentBundleID,
                replacement: newBundleID,
                paths: filePaths,
                ...replaceOptions,
              });

              for (const filePath of filePaths) {
                console.log(`${filePath.replace(__dirname, '')} ${colors.green('MODIFIED PATH')}`);
              }
            } catch (err) {
              console.log('Unable to scan directory: ' + err);

              return resolvePromise();
            }

            await new Promise(res => setTimeout(res, 100));

            return resolvePromise();
            // * End of section for replacing package name in all java files
          });

        const rename = () => {
          resolveFoldersAndFiles
            .then(resolveFilesToModifyContent)
            .then(resolveJavaFiles)
            .then(resolveBundleIdentifiers)
            .then(deletePreviousBundleDirectory)
            .then(cleanBuilds)
            .then(() => console.log(`\nApp successfully renamed to "${newName}"!`.green))
            .then(() => {
              if (fs.existsSync(path.join(__dirname, 'ios', 'Podfile'))) {
                console.log(
                  `${colors.yellow('Podfile has been modified, please run "pod install" inside ios directory.')}`
                );
              }
            })
            .then(() =>
              console.log(
                `${colors.yellow(
                  'Please make sure to run "watchman watch-del-all" and "npm start --reset-cache" before running the app.\n'
                )}`
              )
            )
            .catch(err => console.log(err));
        };

        rename();
      })
      .parse(process.argv);
    if (!process.argv.slice(2).length) program.outputHelp();
  })
  .catch(err => {
    if (err.code === 'ENOENT') return console.log('Directory should be created using "react-native init"');

    return console.log('Something went wrong: ', err);
  });
