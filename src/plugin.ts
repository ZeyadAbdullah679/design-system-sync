import { sendLog, DEBUG_MODE } from './utils/debug';
import { makeRequest } from './utils/network';
import { extractColorCollections } from './extractors/colors';
import { extractTypographyStyles } from './extractors/typography';
import { uploadToGitHub } from './github';

figma.showUI(__html__, {
  width: 600,
  height: 850,
  themeColors: true
});

// Load saved settings and config on startup
(async () => {
  try {
    const settings = await figma.clientStorage.getAsync('github-settings-v4');
    const config = await figma.clientStorage.getAsync('pluginConfig');

    figma.ui.postMessage({
      type: 'load-settings',
      settings: settings || null
    });

    figma.ui.postMessage({
      type: 'load-config',
      config: config || null
    });
  } catch (error) {
    sendLog('Error loading saved data', 'error');
  }
})();

// Main message handler
figma.ui.onmessage = async (msg: any) => {
  if (DEBUG_MODE) {
    console.log('Received message:', msg.type);
  }

  // Save settings
  if (msg.type === 'save-settings' && msg.settings) {
    await figma.clientStorage.setAsync('github-settings-v4', msg.settings);
    figma.ui.postMessage({ type: 'settings-saved' });
  }

  // Save configuration
  if (msg.type === 'save-config') {
    try {
      await figma.clientStorage.setAsync('pluginConfig', msg.config);
      sendLog('Configuration saved successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      sendLog(`Error saving configuration: ${errorMessage}`, 'error');
    }
  }

  // Load configuration
  if (msg.type === 'load-config') {
    try {
      const config = await figma.clientStorage.getAsync('pluginConfig');
      figma.ui.postMessage({
        type: 'load-config',
        config: config || null
      });
      if (config) {
        sendLog('Configuration loaded successfully');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      sendLog(`Error loading configuration: ${errorMessage}`, 'error');
    }
  }

  // Export variables (strings, colors, fonts)
  if (msg.type === 'export-variables') {
    try {
      const collections = await figma.variables.getLocalVariableCollectionsAsync();

      // Extract STRING variables
      const stringCollections: any[] = [];
      for (const collection of collections) {
        const stringVariables: any[] = [];

        for (const variableId of collection.variableIds) {
          const variable = await figma.variables.getVariableByIdAsync(variableId);

          if (variable && variable.resolvedType === 'STRING') {
            const variableData: any = {
              id: variable.id,
              name: variable.name,
              description: variable.description || '',
              type: variable.resolvedType,
              values: {}
            };

            for (const modeId in variable.valuesByMode) {
              if (Object.prototype.hasOwnProperty.call(variable.valuesByMode, modeId)) {
                variableData.values[modeId] = variable.valuesByMode[modeId];
              }
            }

            stringVariables.push(variableData);
          }
        }

        if (stringVariables.length > 0) {
          const collectionData: any = {
            id: collection.id,
            name: collection.name,
            modes: collection.modes.map((mode) => ({
              name: mode.name,
              modeId: mode.modeId
            })),
            variables: stringVariables
          };

          stringCollections.push(collectionData);
        }
      }

      const totalStrings = stringCollections.reduce((sum, col) => sum + col.variables.length, 0);
      const totalLanguages = stringCollections[0]?.modes.length || 0;

      // Extract COLOR variables
      const colorCollections = await extractColorCollections();
      const totalColors = colorCollections.reduce((sum, col) => sum + col.variables.length, 0);

      // Extract TYPOGRAPHY/FONT styles from Text Styles (NOT variables)
      sendLog('Extracting text styles from Figma...');
      const typographyStyles = await extractTypographyStyles();
      const totalFonts = typographyStyles.length;

      sendLog(`Found ${totalFonts} text styles`);

      // Combine collection names
      const allCollectionNames = [
        ...stringCollections.map(c => `${c.name} (strings)`),
        ...colorCollections.map(c => `${c.name} (colors)`)
      ];

      if (totalFonts > 0) {
        allCollectionNames.push(`Text Styles (${totalFonts} fonts)`);
      }

      figma.ui.postMessage({
        type: 'variables-data',
        data: {
          strings: stringCollections,
          colors: colorCollections,
          typography: typographyStyles
        },
        stats: {
          collections: stringCollections.length + colorCollections.length + (totalFonts > 0 ? 1 : 0),
          strings: totalStrings,
          languages: totalLanguages,
          colors: totalColors,
          fonts: totalFonts,
          collectionNames: allCollectionNames
        }
      });

      const parts = [];
      if (totalStrings > 0) parts.push(`${totalStrings} strings`);
      if (totalColors > 0) parts.push(`${totalColors} colors`);
      if (totalFonts > 0) parts.push(`${totalFonts} fonts`);

      figma.notify(`✅ Loaded ${parts.join(', ')}`);

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      sendLog(`Error extracting data: ${errorMessage}`, 'error');
      figma.ui.postMessage({ type: 'error', message: `Error: ${errorMessage}` });
    }
  }

  // Test GitHub Connection
  if (msg.type === 'test-github') {
    sendLog('Backend: Testing GitHub connection...');

    try {
      const { username, repo, token } = msg.settings;
      const url = `https://api.github.com/repos/${username}/${repo}`;

      const response = await makeRequest(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/vnd.github+json',
          'Authorization': `token ${token}`,
          'X-GitHub-Api-Version': '2022-11-28'
        }
      });

      if (response.ok) {
        const data = response.data;
        sendLog(`Backend: Success! Repository: ${data.full_name}`, 'success');

        figma.ui.postMessage({
          type: 'test-success',
          data: {
            fullName: data.full_name,
            private: data.private,
            defaultBranch: data.default_branch
          }
        });

        figma.notify('✅ GitHub connection successful!');
      } else {
        sendLog(`Backend: HTTP ${response.status}`, 'error');
        figma.ui.postMessage({ type: 'test-error', message: `HTTP ${response.status}: Check your token and repository access` });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      sendLog(`Backend: Exception: ${errorMessage}`, 'error');
      figma.ui.postMessage({ type: 'test-error', message: `Connection failed: ${errorMessage}` });
    }
  }

  // Upload to GitHub with PR
  if (msg.type === 'upload-github') {
    try {
      await uploadToGitHub(msg);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      sendLog(`Backend: Error: ${errorMessage}`, 'error');
      figma.ui.postMessage({ type: 'upload-error', message: errorMessage });
      figma.notify(`❌ ${errorMessage}`, { error: true });
    }
  }

  if (msg.type === 'notify' && msg.message) {
    figma.notify(msg.message, { timeout: msg.timeout || 3000 });
  }
};
