module.exports = {
  appId: 'com.koukou.fastprint',
  productName: '扣扣快打',
  copyright: 'Copyright © 2024 扣扣快打',

  directories: {
    output: 'release',
    buildResources: 'build'
  },

  files: [
    'dist/**/*',
    'electron/**/*',
    'package.json',
    '!node_modules/**/*'
  ],

  mac: {
    category: 'public.app-category.productivity',
    target: [
      {
        target: 'dmg',
        arch: ['x64', 'arm64']
      },
      {
        target: 'zip',
        arch: ['x64', 'arm64']
      }
    ],
    icon: 'build/icon.icns',
    darkModeSupport: true,
    hardenedRuntime: true,
    gatekeeperAssess: false,
    entitlements: 'build/entitlements.mac.plist',
    entitlementsInherit: 'build/entitlements.mac.plist'
  },

  dmg: {
    contents: [
      {
        x: 130,
        y: 220
      },
      {
        x: 410,
        y: 220,
        type: 'link',
        path: '/Applications'
      }
    ],
    window: {
      width: 540,
      height: 380
    }
  },

  linux: {
    category: 'Utility',
    target: ['AppImage', 'deb'],
    icon: 'build/icon.png'
  },

  win: {
    target: ['nsis', 'portable'],
    icon: 'build/icon.ico'
  },

  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true
  },

  publish: null,

  electronDownload: {
    mirror: 'https://npmmirror.com/mirrors/electron/'
  },

  nodeGypMirror: 'https://npmmirror.com/mirrors/node-gyp/'
}
