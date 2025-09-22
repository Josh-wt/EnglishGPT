// Load configuration from environment or config file
const path = require('path');
const webpack = require('webpack');

// Environment variable overrides
const config = {
  disableHotReload: process.env.DISABLE_HOT_RELOAD === 'true',
};

module.exports = {
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    configure: (webpackConfig) => {
      
      // Disable hot reload completely if environment variable is set
      if (config.disableHotReload) {
        // Remove hot reload related plugins
        webpackConfig.plugins = webpackConfig.plugins.filter(plugin => {
          return !(plugin.constructor.name === 'HotModuleReplacementPlugin');
        });
        
        // Disable watch mode
        webpackConfig.watch = false;
        webpackConfig.watchOptions = {
          ignored: /.*/, // Ignore all files
        };
      } else {
        // Add ignored patterns to reduce watched directories
        webpackConfig.watchOptions = {
          ...webpackConfig.watchOptions,
          ignored: [
            '**/node_modules/**',
            '**/.git/**',
            '**/build/**',
            '**/dist/**',
            '**/coverage/**',
            '**/public/**',
          ],
        };
      }

      // Performance optimizations
      if (process.env.NODE_ENV === 'production') {
        // Enable code splitting and optimization
        webpackConfig.optimization = {
          ...webpackConfig.optimization,
          splitChunks: {
            chunks: 'all',
            cacheGroups: {
              // Vendor chunk for third-party libraries
              vendor: {
                test: /[\\/]node_modules[\\/]/,
                name: 'vendors',
                chunks: 'all',
                priority: 10,
                enforce: true,
              },
              // React and React-DOM in separate chunk
              react: {
                test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
                name: 'react',
                chunks: 'all',
                priority: 20,
                enforce: true,
              },
              // UI libraries chunk
              ui: {
                test: /[\\/]node_modules[\\/](@radix-ui|@heroicons|lucide-react|framer-motion|recharts)[\\/]/,
                name: 'ui-libs',
                chunks: 'all',
                priority: 15,
                enforce: true,
              },
              // Supabase and auth related
              supabase: {
                test: /[\\/]node_modules[\\/](@supabase|axios)[\\/]/,
                name: 'supabase',
                chunks: 'all',
                priority: 15,
                enforce: true,
              },
              // Common chunk for shared code
              common: {
                name: 'common',
                minChunks: 2,
                chunks: 'all',
                priority: 5,
                enforce: true,
              },
            },
          },
          // Enable tree shaking
          usedExports: true,
          sideEffects: false,
        };

        // Add performance hints
        webpackConfig.performance = {
          hints: 'warning',
          maxEntrypointSize: 250000, // 250KB
          maxAssetSize: 250000, // 250KB
        };

        // Add bundle analyzer plugin in development
        if (process.env.ANALYZE_BUNDLE === 'true') {
          const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
          webpackConfig.plugins.push(
            new BundleAnalyzerPlugin({
              analyzerMode: 'static',
              openAnalyzer: false,
              reportFilename: 'bundle-report.html',
            })
          );
        }
      }
      
      return webpackConfig;
    },
  },
};