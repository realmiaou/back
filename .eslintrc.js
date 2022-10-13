module.exports = {
  root: true,
  extends: [
    '@nuxtjs/eslint-config-typescript',
    'plugin:nuxt/recommended'
  ],
  settings: {},
  rules: {
    camelcase: 'off',
    'no-useless-constructor': 'off',
    curly: 'off'
  }
}
