import { defineConfig } from '@rspack/cli'
import { rspack, type SwcLoaderOptions } from '@rspack/core'
import { ReactRefreshRspackPlugin } from '@rspack/plugin-react-refresh'
import { RsdoctorRspackPlugin } from '@rsdoctor/rspack-plugin'

const isDev = process.env.NODE_ENV === 'development'

export default defineConfig({
  entry: {
    main: './src/main.tsx',
  },
  target: ['browserslist:last 2 versions, > 0.2%, not dead, Firefox ESR'],
  resolve: {
    extensions: ['...', '.ts', '.tsx', '.jsx'],
  },
  output: {
    asyncChunks: true,
    chunkFilename: '[name].[hash].js',
    clean: true,
    cssChunkFilename: '[name].[hash].css',
    module: true,
  },
  module: {
    rules: [
      {
        test: /\.svg$/,
        // type: 'asset',
        issuer: /\.[jt]sx?$/,
        use: [{
          loader: '@svgr/webpack',
          options: {
            // icon: true,
            jsxRuntime: 'classic',
            typescript: true
          }
        }],
      },
      {
        test: /\.css$/,
        type: 'css/auto',
      },
      {
        test: /\.(?:js|jsx|mjs|cjs|ts|tsx|mts|cts)$/,
        use: [
          {
            loader: 'builtin:swc-loader',
            options: {
              detectSyntax: 'auto',
              jsc: {
                transform: {
                  react: {
                    runtime: 'automatic',
                    development: isDev,
                    refresh: isDev,
                  },
                },
              },
            } satisfies SwcLoaderOptions,
          },
        ],
      },
    ],
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        reactRefresh: {
          test: /[\\/]node_modules[\\/]react-refresh[\\/]/,
          name: 'react-refresh',
          chunks: 'all',
        },
        reactDom: {
          test: /[\\/]node_modules[\\/]react-dom[\\/]/,
          name: 'react-dom',
          chunks: 'all',
        },
        react: {
          test: /[\\/]node_modules[\\/]react/,
          name: 'react',
          chunks: 'all',
        },
      },
    },
  },
  plugins: [
    new rspack.HtmlRspackPlugin({
      template: './index.html',
    }),
    isDev && new ReactRefreshRspackPlugin(),
    process.env.RSDOCTOR &&
      new RsdoctorRspackPlugin({
        mode: 'brief',
      })
  ],
})
