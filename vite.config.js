import { defineConfig, mergeConfig } from 'vite';
import baseConfig from '@kinvolk/headlamp-plugin/config/vite.config.mjs';

// Override the base config to add missing externals
export default mergeConfig(baseConfig, defineConfig({
  build: {
    rollupOptions: {
      output: {
        globals: (request) => {
          // Add the missing /lib/lib/k8s/* mappings
          if (request === '@kinvolk/headlamp-plugin/lib/lib/k8s/cluster') {
            return 'pluginLib.libk8scluster';
          }
          if (request === '@kinvolk/headlamp-plugin/lib/lib/k8s/apiProxy') {
            return 'pluginLib.libk8sapiProxy';
          }

          // Use base config's globals function for everything else
          if (typeof baseConfig.build.rollupOptions.output.globals === 'function') {
            return baseConfig.build.rollupOptions.output.globals(request);
          }

          return request;
        },
      },
    },
  },
}));
