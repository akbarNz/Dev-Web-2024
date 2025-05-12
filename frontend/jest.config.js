module.exports = {
    transform: {
      '^.+\\.[jt]sx?$': 'babel-jest',
    },
    moduleNameMapper: {
      '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
      '^axios$': 'axios/dist/node/axios.cjs',
      '^@base-ui-components/react/dialog$': '@base-ui-components/react/cjs/dialog',
    },
    testEnvironment: 'jsdom',
    transformIgnorePatterns: [
      '/node_modules/(?!multi-range-slider-react|@base-ui-components/react)',
    ],
    setupFiles: ['whatwg-fetch'],
  };