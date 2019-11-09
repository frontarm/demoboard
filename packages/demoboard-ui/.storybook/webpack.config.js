module.exports = ({ config }) => {
  // Remove file-loader, as it interferes with svgr, and this library
  // shouldn't export any assets anyway
  let existingSVGIndex = config.module.rules.findIndex(x =>
    x.test.toString().includes('svg'),
  )
  if (existingSVGIndex !== -1) {
    config.module.rules.splice(existingSVGIndex, 1)
  }

  // Add svgr at the top
  config.module.rules.unshift({
    test: /\.svg$/,
    exclude: /(node_modules)/,
    use: ['@svgr/webpack'],
  })

  config.module.rules.push({
    test: /\.(ts|tsx)$/,
    exclude: /(node_modules)/,
    use: [
      {
        loader: require.resolve('babel-loader'),
        options: {
          presets: [require.resolve('@babel/preset-react')],
          plugins: [
            require.resolve('@babel/plugin-syntax-dynamic-import'),
            require.resolve('babel-plugin-styled-components'),
            require.resolve('@babel/plugin-proposal-export-default-from'),
          ],
        },
      },
      {
        loader: require.resolve('awesome-typescript-loader'),
      },
      {
        loader: require.resolve('react-docgen-typescript-loader'),
      },
    ],
  })
  config.resolve.extensions.push('.ts', '.tsx')

  config.node = {
    fs: 'empty',
  }

  return config
}
