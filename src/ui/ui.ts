const DEBUG_MODE = false;

function log(message: string, type: string = 'info') {
  if (!DEBUG_MODE) return;
  console.log(`[${type}]`, message);
}

let loadedData: any = null;
let settings: any = {};

const message = document.getElementById('message')!;
const statsGrid = document.getElementById('statsGrid')!;
const exportBtn = document.getElementById('exportBtn') as HTMLButtonElement;

function updateVisibleSections() {
  const exportStrings = (document.getElementById('exportStrings') as HTMLInputElement).checked;
  const exportColors = (document.getElementById('exportColors') as HTMLInputElement).checked;
  const exportFonts = (document.getElementById('exportFonts') as HTMLInputElement).checked;

  document.getElementById('androidStringsSection')!.classList.toggle('hidden', !exportStrings);
  document.getElementById('androidColorsSection')!.classList.toggle('hidden', !exportColors);
  document.getElementById('androidTypographySection')!.classList.toggle('hidden', !exportFonts);

  document.getElementById('iosStringsSection')!.classList.toggle('hidden', !exportStrings);
  document.getElementById('iosColorsSection')!.classList.toggle('hidden', !exportColors);
  document.getElementById('iosTypographySection')!.classList.toggle('hidden', !exportFonts);

  document.getElementById('flutterStringsSection')!.classList.toggle('hidden', !exportStrings);
  document.getElementById('flutterColorsSection')!.classList.toggle('hidden', !exportColors);
  document.getElementById('flutterTypographySection')!.classList.toggle('hidden', !exportFonts);
}

// Platform checkbox toggles
const androidConfig = document.getElementById('androidConfig')!;
const iosConfig = document.getElementById('iosConfig')!;
const flutterConfig = document.getElementById('flutterConfig')!;

const platformBtns = document.querySelectorAll('.platform-btn');

function updatePlatformConfigs() {
  const androidChecked = (document.getElementById('platformAndroid') as HTMLInputElement).checked;
  const iosChecked = (document.getElementById('platformIOS') as HTMLInputElement).checked;
  const flutterChecked = (document.getElementById('platformFlutter') as HTMLInputElement).checked;

  androidConfig.classList.toggle('active', androidChecked);
  iosConfig.classList.toggle('active', iosChecked);
  flutterConfig.classList.toggle('active', flutterChecked);
}

platformBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const checkbox = btn.querySelector('input[type="checkbox"]') as HTMLInputElement;
    checkbox.checked = !checkbox.checked;
    btn.classList.toggle('active', checkbox.checked);
    updatePlatformConfigs();
  });
});

// Export type toggles
const exportTypeBtns = document.querySelectorAll('.export-type-btn');
exportTypeBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const checkbox = btn.querySelector('input[type="checkbox"]') as HTMLInputElement;
    checkbox.checked = !checkbox.checked;
    btn.classList.toggle('active', checkbox.checked);
    updateVisibleSections();
  });
});

// Android color format buttons
const colorFormatBtns = document.querySelectorAll('#androidColorFormatBtns .format-btn');
const colorsXmlGroup = document.getElementById('androidColorsXmlGroup')!;
const composeColorsGroup = document.getElementById('androidComposeColorsGroup')!;
const composePackageGroup = document.getElementById('androidComposePackageGroup')!;

colorFormatBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    colorFormatBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const format = (btn as HTMLElement).dataset.format;
    if (format === 'xml') {
      colorsXmlGroup.style.display = 'block';
      composeColorsGroup.style.display = 'none';
      composePackageGroup.style.display = 'none';
    } else if (format === 'compose') {
      colorsXmlGroup.style.display = 'none';
      composeColorsGroup.style.display = 'block';
      composePackageGroup.style.display = 'block';
    } else if (format === 'both') {
      colorsXmlGroup.style.display = 'block';
      composeColorsGroup.style.display = 'block';
      composePackageGroup.style.display = 'block';
    }
  });
});

// Android typography format buttons
const typographyFormatBtns = document.querySelectorAll('#androidTypographyFormatBtns .format-btn');
const typographyXmlGroup = document.getElementById('androidTypographyXmlGroup')!;
const typographyComposeGroup = document.getElementById('androidTypographyComposeGroup')!;

typographyFormatBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    typographyFormatBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const format = (btn as HTMLElement).dataset.format;
    if (format === 'xml') {
      typographyXmlGroup.style.display = 'block';
      typographyComposeGroup.style.display = 'none';
    } else if (format === 'compose') {
      typographyXmlGroup.style.display = 'none';
      typographyComposeGroup.style.display = 'block';
    } else if (format === 'both') {
      typographyXmlGroup.style.display = 'block';
      typographyComposeGroup.style.display = 'block';
    }
  });
});

// iOS color style buttons
const iosColorStyleBtns = document.querySelectorAll('#iosColorStyleBtns .format-btn');
iosColorStyleBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    iosColorStyleBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

function showMessage(text: string, type: string = 'info') {
  message.textContent = text;
  message.className = `message ${type} show`;
  setTimeout(() => message.classList.remove('show'), 5000);
}

// Collapsible GitHub settings
const githubHeader = document.getElementById('githubHeader')!;
const githubContent = document.getElementById('githubContent')!;

githubHeader.addEventListener('click', () => {
  githubHeader.classList.toggle('collapsed');
  githubContent.classList.toggle('collapsed');
});

// Test connection
document.getElementById('testBtn')!.addEventListener('click', () => {
  const username = (document.getElementById('username') as HTMLInputElement).value.trim();
  const repo = (document.getElementById('repo') as HTMLInputElement).value.trim();
  const token = (document.getElementById('token') as HTMLInputElement).value.trim();

  if (!username || !repo || !token) {
    showMessage('Please fill in all GitHub settings', 'error');
    return;
  }

  showMessage('Testing connection...', 'info');
  parent.postMessage({ pluginMessage: { type: 'test-github', settings: { username, repo, token } } }, '*');
});

// Save settings
document.getElementById('saveBtn')!.addEventListener('click', () => {
  const username = (document.getElementById('username') as HTMLInputElement).value.trim();
  const repo = (document.getElementById('repo') as HTMLInputElement).value.trim();
  const baseBranch = (document.getElementById('baseBranch') as HTMLInputElement).value.trim();
  const token = (document.getElementById('token') as HTMLInputElement).value.trim();

  if (!username || !repo || !baseBranch || !token) {
    showMessage('Please fill in all required fields', 'error');
    return;
  }

  settings = { username, repo, baseBranch, token };
  parent.postMessage({ pluginMessage: { type: 'save-settings', settings: settings } }, '*');
  showMessage('Settings saved!', 'success');
});

// Load variables
document.getElementById('loadBtn')!.addEventListener('click', () => {
  showMessage('Loading variables from Figma...', 'info');
  parent.postMessage({ pluginMessage: { type: 'export-variables' } }, '*');
});

// Export to GitHub
document.getElementById('exportBtn')!.addEventListener('click', () => {
  if (!loadedData) {
    showMessage('Please load variables first', 'error');
    return;
  }

  const exportTypes = {
    strings: (document.getElementById('exportStrings') as HTMLInputElement).checked,
    colors: (document.getElementById('exportColors') as HTMLInputElement).checked,
    fonts: (document.getElementById('exportFonts') as HTMLInputElement).checked
  };

  if (!exportTypes.strings && !exportTypes.colors && !exportTypes.fonts) {
    showMessage('Please select at least one export type', 'error');
    return;
  }

  const platforms = {
    android: (document.getElementById('platformAndroid') as HTMLInputElement).checked,
    ios: (document.getElementById('platformIOS') as HTMLInputElement).checked,
    flutter: (document.getElementById('platformFlutter') as HTMLInputElement).checked
  };

  if (!platforms.android && !platforms.ios && !platforms.flutter) {
    showMessage('Please select at least one platform', 'error');
    return;
  }

  const androidColorFormat = (document.querySelector('#androidColorFormatBtns .format-btn.active') as HTMLElement).dataset.format;
  const androidTypographyFormat = (document.querySelector('#androidTypographyFormatBtns .format-btn.active') as HTMLElement).dataset.format;
  const iosColorStyle = (document.querySelector('#iosColorStyleBtns .format-btn.active') as HTMLElement).dataset.format;

  const filePaths = {
    androidStrings: (document.getElementById('androidStrings') as HTMLInputElement).value,
    androidColorsXml: (document.getElementById('androidColorsXml') as HTMLInputElement).value,
    androidComposeColors: (document.getElementById('androidComposeColors') as HTMLInputElement).value,
    androidComposePackage: (document.getElementById('androidComposePackage') as HTMLInputElement).value,
    androidTypographyXml: (document.getElementById('androidTypographyXml') as HTMLInputElement).value,
    androidTypography: (document.getElementById('androidTypography') as HTMLInputElement).value,
    androidColorFormat: androidColorFormat,
    androidTypographyFormat: androidTypographyFormat,

    iosStrings: (document.getElementById('iosStrings') as HTMLInputElement).value,
    iosColors: (document.getElementById('iosColors') as HTMLInputElement).value,
    iosTypography: (document.getElementById('iosTypography') as HTMLInputElement).value,
    iosColorStyle: iosColorStyle,

    flutterStrings: (document.getElementById('flutterStrings') as HTMLInputElement).value,
    flutterColors: (document.getElementById('flutterColors') as HTMLInputElement).value,
    flutterTypography: (document.getElementById('flutterTypography') as HTMLInputElement).value
  };

  const commitMessage = (document.getElementById('commitMessage') as HTMLTextAreaElement).value.trim();
  const branchName = (document.getElementById('branchName') as HTMLInputElement).value.trim();
  const prTitle = (document.getElementById('prTitle') as HTMLInputElement).value.trim();

  showMessage('Creating pull request...', 'info');
  exportBtn.disabled = true;
  document.getElementById('exportBtnText')!.innerHTML = '<span class="spinner"></span> Exporting...';

  parent.postMessage({
    pluginMessage: {
      type: 'upload-github',
      data: {
        ...settings,
        commitMessage: commitMessage || '🎨 Update design tokens from Figma',
        variablesData: loadedData,
        exportTypes: exportTypes,
        platforms: platforms,
        filePaths: filePaths,
        branchName: branchName || 'design-tokens',
        prTitle: prTitle || '🎨 Update Design Tokens from Figma',
        prTemplate: 'detailed'
      }
    }
  }, '*');
});

// Message handler from plugin backend
window.onmessage = (event) => {
  const msg = event.data.pluginMessage;
  if (!msg) return;

  log('Received message:', msg.type);

  if (msg.type === 'load-settings') {
    if (msg.settings) {
      (document.getElementById('username') as HTMLInputElement).value = msg.settings.username || '';
      (document.getElementById('repo') as HTMLInputElement).value = msg.settings.repo || '';
      (document.getElementById('baseBranch') as HTMLInputElement).value = msg.settings.baseBranch || 'main';
      (document.getElementById('token') as HTMLInputElement).value = msg.settings.token || '';
      settings = msg.settings;
    }
  }

  // Load saved configuration
  if (msg.type === 'load-config') {
    if (msg.config) {
      const config = msg.config;

      // Set platforms (checkbox-based)
      if (config.selectedPlatforms) {
        (document.getElementById('platformAndroid') as HTMLInputElement).checked = config.selectedPlatforms.android !== false;
        (document.getElementById('platformIOS') as HTMLInputElement).checked = !!config.selectedPlatforms.ios;
        (document.getElementById('platformFlutter') as HTMLInputElement).checked = !!config.selectedPlatforms.flutter;

        platformBtns.forEach(btn => {
          const checkbox = btn.querySelector('input[type="checkbox"]') as HTMLInputElement;
          btn.classList.toggle('active', checkbox.checked);
        });
        updatePlatformConfigs();
      } else if (config.selectedPlatform) {
        // Backward compat: migrate old single-platform radio config
        (document.getElementById('platformAndroid') as HTMLInputElement).checked = config.selectedPlatform === 'android';
        (document.getElementById('platformIOS') as HTMLInputElement).checked = config.selectedPlatform === 'ios';
        (document.getElementById('platformFlutter') as HTMLInputElement).checked = config.selectedPlatform === 'flutter';

        platformBtns.forEach(btn => {
          const checkbox = btn.querySelector('input[type="checkbox"]') as HTMLInputElement;
          btn.classList.toggle('active', checkbox.checked);
        });
        updatePlatformConfigs();
      }

      // Branch name and PR title
      if (config.branchName) (document.getElementById('branchName') as HTMLInputElement).value = config.branchName;
      if (config.prTitle) (document.getElementById('prTitle') as HTMLInputElement).value = config.prTitle;

      // Set export types
      if (config.exportTypes) {
        (document.getElementById('exportStrings') as HTMLInputElement).checked = config.exportTypes.strings !== false;
        (document.getElementById('exportColors') as HTMLInputElement).checked = config.exportTypes.colors !== false;
        (document.getElementById('exportFonts') as HTMLInputElement).checked = config.exportTypes.fonts !== false;

        exportTypeBtns.forEach(btn => {
          const checkbox = btn.querySelector('input[type="checkbox"]') as HTMLInputElement;
          btn.classList.toggle('active', checkbox.checked);
        });
        updateVisibleSections();
      }

      // Android paths
      if (config.androidStrings) (document.getElementById('androidStrings') as HTMLInputElement).value = config.androidStrings;
      if (config.androidColorsXml) (document.getElementById('androidColorsXml') as HTMLInputElement).value = config.androidColorsXml;
      if (config.androidComposeColors) (document.getElementById('androidComposeColors') as HTMLInputElement).value = config.androidComposeColors;
      if (config.androidComposePackage) (document.getElementById('androidComposePackage') as HTMLInputElement).value = config.androidComposePackage;
      if (config.androidTypographyXml) (document.getElementById('androidTypographyXml') as HTMLInputElement).value = config.androidTypographyXml;
      if (config.androidTypography) (document.getElementById('androidTypography') as HTMLInputElement).value = config.androidTypography;

      // Android formats
      if (config.androidColorFormat) {
        colorFormatBtns.forEach(btn => {
          if ((btn as HTMLElement).dataset.format === config.androidColorFormat) {
            (btn as HTMLElement).click();
          }
        });
      }
      if (config.androidTypographyFormat) {
        typographyFormatBtns.forEach(btn => {
          if ((btn as HTMLElement).dataset.format === config.androidTypographyFormat) {
            (btn as HTMLElement).click();
          }
        });
      }

      // iOS paths
      if (config.iosStrings) (document.getElementById('iosStrings') as HTMLInputElement).value = config.iosStrings;
      if (config.iosColors) (document.getElementById('iosColors') as HTMLInputElement).value = config.iosColors;
      if (config.iosTypography) (document.getElementById('iosTypography') as HTMLInputElement).value = config.iosTypography;

      // iOS format
      if (config.iosColorStyle) {
        iosColorStyleBtns.forEach(btn => {
          if ((btn as HTMLElement).dataset.format === config.iosColorStyle) {
            (btn as HTMLElement).click();
          }
        });
      }

      // Flutter paths
      if (config.flutterStrings) (document.getElementById('flutterStrings') as HTMLInputElement).value = config.flutterStrings;
      if (config.flutterColors) (document.getElementById('flutterColors') as HTMLInputElement).value = config.flutterColors;
      if (config.flutterTypography) (document.getElementById('flutterTypography') as HTMLInputElement).value = config.flutterTypography;

      log('Configuration loaded successfully');
    }
  }

  if (msg.type === 'test-success') showMessage(`✅ Connected to ${msg.data.fullName}`, 'success');
  if (msg.type === 'test-error') showMessage(`❌ ${msg.message}`, 'error');

  if (msg.type === 'variables-data') {
    loadedData = msg.data;
    document.getElementById('statStrings')!.textContent = msg.stats.strings || 0;
    document.getElementById('statColors')!.textContent = msg.stats.colors || 0;
    document.getElementById('statFonts')!.textContent = msg.stats.fonts || 0;
    statsGrid.style.display = 'grid';
    exportBtn.disabled = false;
    showMessage(`✅ Loaded ${msg.stats.strings} strings, ${msg.stats.colors} colors, ${msg.stats.fonts} fonts`, 'success');
  }

  if (msg.type === 'upload-success') {
    const prUrl = msg.prUrl || 'Successfully created';
    showMessage(`✅ PR created: ${prUrl}`, 'success');
    exportBtn.disabled = false;
    document.getElementById('exportBtnText')!.textContent = '📤 Export to GitHub';
  }

  if (msg.type === 'error') {
    showMessage(`❌ ${msg.message}`, 'error');
    exportBtn.disabled = false;
    document.getElementById('exportBtnText')!.textContent = '📤 Export to GitHub';
  }
};

// Save Configuration (Platforms, Paths, Formats, Branch, PR Title)
document.getElementById('saveConfigBtn')!.addEventListener('click', () => {
  const selectedPlatforms = {
    android: (document.getElementById('platformAndroid') as HTMLInputElement).checked,
    ios: (document.getElementById('platformIOS') as HTMLInputElement).checked,
    flutter: (document.getElementById('platformFlutter') as HTMLInputElement).checked
  };

  const exportTypes = {
    strings: (document.getElementById('exportStrings') as HTMLInputElement).checked,
    colors: (document.getElementById('exportColors') as HTMLInputElement).checked,
    fonts: (document.getElementById('exportFonts') as HTMLInputElement).checked
  };

  const androidColorFormat = (document.querySelector('#androidColorFormatBtns .format-btn.active') as HTMLElement)?.dataset.format || 'xml';
  const androidTypographyFormat = (document.querySelector('#androidTypographyFormatBtns .format-btn.active') as HTMLElement)?.dataset.format || 'xml';
  const iosColorStyle = (document.querySelector('#iosColorStyleBtns .format-btn.active') as HTMLElement)?.dataset.format || 'swiftui';

  const config = {
    selectedPlatforms: selectedPlatforms,
    exportTypes: exportTypes,
    branchName: (document.getElementById('branchName') as HTMLInputElement).value,
    prTitle: (document.getElementById('prTitle') as HTMLInputElement).value,

    androidStrings: (document.getElementById('androidStrings') as HTMLInputElement).value,
    androidColorsXml: (document.getElementById('androidColorsXml') as HTMLInputElement).value,
    androidComposeColors: (document.getElementById('androidComposeColors') as HTMLInputElement).value,
    androidComposePackage: (document.getElementById('androidComposePackage') as HTMLInputElement).value,
    androidTypographyXml: (document.getElementById('androidTypographyXml') as HTMLInputElement).value,
    androidTypography: (document.getElementById('androidTypography') as HTMLInputElement).value,
    androidColorFormat: androidColorFormat,
    androidTypographyFormat: androidTypographyFormat,

    iosStrings: (document.getElementById('iosStrings') as HTMLInputElement).value,
    iosColors: (document.getElementById('iosColors') as HTMLInputElement).value,
    iosTypography: (document.getElementById('iosTypography') as HTMLInputElement).value,
    iosColorStyle: iosColorStyle,

    flutterStrings: (document.getElementById('flutterStrings') as HTMLInputElement).value,
    flutterColors: (document.getElementById('flutterColors') as HTMLInputElement).value,
    flutterTypography: (document.getElementById('flutterTypography') as HTMLInputElement).value
  };

  parent.postMessage({
    pluginMessage: {
      type: 'save-config',
      config: config
    }
  }, '*');

  showMessage('✅ Configuration saved successfully!', 'success');
});

// Load configuration on startup
window.addEventListener('DOMContentLoaded', () => {
  parent.postMessage({
    pluginMessage: { type: 'load-config' }
  }, '*');
});

updateVisibleSections();
