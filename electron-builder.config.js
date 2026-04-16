/** @type {import('electron-builder').Configuration} */
module.exports = {
  appId: 'com.shellstack.aquarium',
  productName: 'ShellStack Aquarium',
  directories: {
    output: 'build',
    buildResources: 'assets',
  },
  files: ['dist/**/*', 'assets/**/*', 'package.json'],
  win: {
    target: 'nsis',
    icon: 'assets/ui/icon.ico',
  },
  nsis: {
    oneClick: true,
    perMachine: false,
    allowToChangeInstallationDirectory: false,
  },
  mac: {
    target: 'dmg',
    icon: 'assets/ui/icon.icns',
  },
  extraMetadata: {
    main: 'dist/main/index.js',
  },
}
