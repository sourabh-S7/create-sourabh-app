#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const pc = require('picocolors');

// 1. Get the project name from the command line
const projectName = process.argv[2];

if (!projectName) {
  console.error(pc.red('Please specify the project name:'));
  console.error(pc.yellow('  npx create-sourabh-app <my-app>'));
  process.exit(1);
}

const currentDir = process.cwd();
const projectDir = path.join(currentDir, projectName);
const templateDir = path.join(__dirname, 'template');

async function main() {
  console.log(pc.bold(`Creating ${pc.cyan('Sourabh App')} in ${pc.green(projectName)}...`));

  // 2. Create the project folder
  try {
    if (fs.existsSync(projectDir)) {
      console.error(pc.red(`Error: Directory "${projectName}" already exists.`));
      process.exit(1);
    }
    fs.mkdirSync(projectDir);
  } catch (err) {
    console.error(pc.red('Error creating directory:'), err);
    process.exit(1);
  }

  // 3. Copy the template files
  try {
    console.log('Copying template files...');
    fs.copySync(templateDir, projectDir);

    // --- STEP 4: UPDATE PACKAGE NAMES (The Magic Part) ---
    console.log('Configuring project names...');

    // A. Update package.json
    const packageJsonPath = path.join(projectDir, 'package.json');
    const packageJson = fs.readJsonSync(packageJsonPath);
    packageJson.name = projectName; // Change name to user's input
    fs.writeJsonSync(packageJsonPath, packageJson, { spaces: 2 });

    // B. Update app.json (Crucial for Expo!)
    const appJsonPath = path.join(projectDir, 'app.json');
    if (fs.existsSync(appJsonPath)) {
      const appJson = fs.readJsonSync(appJsonPath);
      // Expo config is usually nested under "expo"
      if (appJson.expo) {
        appJson.expo.name = projectName;
        appJson.expo.slug = projectName;
      } else {
        // Fallback if structure is different
        appJson.name = projectName;
        appJson.slug = projectName;
      }
      fs.writeJsonSync(appJsonPath, appJson, { spaces: 2 });
    }

    // --- STEP 5: FIX GITIGNORE ---
    const gitignorePath = path.join(projectDir, 'gitignore');
    if (fs.existsSync(gitignorePath)) {
      fs.renameSync(gitignorePath, path.join(projectDir, '.gitignore'));
    }

    console.log(pc.green('\nSuccess! Your project is ready.'));
    console.log('\nRun these commands to start:');
    console.log(pc.cyan(`  cd ${projectName}`));
    console.log(pc.cyan('  npm install'));
    console.log(pc.cyan('  npx expo start'));

  } catch (err) {
    console.error(pc.red('Error setting up project:'), err);
    process.exit(1);
  }
}

main();