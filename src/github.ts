import { sendLog } from './utils/debug';
import { makeRequest } from './utils/network';
import { encodeBase64 } from './utils/encoding';
import { parseVariablesToAndroidXML, parseVariablesToIOSStrings, parseVariablesToFlutterARB } from './generators/strings';
import { generateAndroidColorsXML, generateComposeColorsKotlin, generateIOSColorsSwift, generateFlutterColors } from './generators/colors';
import {
  generateAndroidTypography, generateAndroidTypographyXML,
  generateIOSTypography, generateFlutterTypography
} from './generators/typography';

export async function uploadToGitHub(msg: any): Promise<void> {
  sendLog('Backend: Starting PR creation workflow...');
  figma.notify('🚀 Creating branch and PR...');

  const {
    username, repo, baseBranch, token, commitMessage,
    variablesData, exportTypes, platforms, filePaths,
    branchName, prTitle, prTemplate
  } = msg.data;

  if (!variablesData) {
    throw new Error('Invalid variables data received');
  }

  if (!platforms || (!platforms.android && !platforms.ios && !platforms.flutter)) {
    throw new Error('At least one platform must be selected');
  }

  if (!exportTypes || (!exportTypes.strings && !exportTypes.colors && !exportTypes.fonts)) {
    throw new Error('At least one export type must be selected');
  }

  const targetBranch = branchName || 'design-tokens';

  sendLog(`Backend: Repo: ${username}/${repo}`);
  sendLog(`Backend: Base: ${baseBranch} → Branch: ${targetBranch}`);

  const headers = {
    'Accept': 'application/vnd.github+json',
    'Authorization': `token ${token}`,
    'X-GitHub-Api-Version': '2022-11-28'
  };

  const headersWithContent = {
    ...headers,
    'Content-Type': 'application/json'
  };

  // Prepare file updates array
  const fileUpdates: Array<{ path: string; content: string }> = [];

  // STRINGS EXPORT
  if (exportTypes.strings && variablesData.strings && variablesData.strings.length > 0) {
    sendLog('Step 1a: Parsing strings...');

    if (platforms.android) {
      const androidXML = parseVariablesToAndroidXML(variablesData.strings);
      Object.entries(androidXML).forEach(([langCode, xmlContent]) => {
        const valuesDir = langCode === 'en' ? 'values' : `values-${langCode}`;
        const path = filePaths.androidStrings.replace('{lang}', valuesDir);
        fileUpdates.push({ path, content: xmlContent });
      });
      sendLog(`Backend: Generated Android strings for ${Object.keys(androidXML).length} languages`);
    }

    if (platforms.ios) {
      const iosStrings = parseVariablesToIOSStrings(variablesData.strings);
      Object.entries(iosStrings).forEach(([langCode, content]) => {
        const langDir = langCode === 'en' ? 'Base' : langCode;
        const path = filePaths.iosStrings.replace('{lang}', langDir);
        fileUpdates.push({ path, content });
      });
      sendLog(`Backend: Generated iOS strings for ${Object.keys(iosStrings).length} languages`);
    }

    if (platforms.flutter) {
      const flutterARB = parseVariablesToFlutterARB(variablesData.strings);
      Object.entries(flutterARB).forEach(([langCode, content]) => {
        const path = filePaths.flutterStrings.replace('{lang}', langCode);
        fileUpdates.push({ path, content });
      });
      sendLog(`Backend: Generated Flutter ARB for ${Object.keys(flutterARB).length} languages`);
    }
  }

  // COLORS EXPORT
  if (exportTypes.colors && variablesData.colors && variablesData.colors.length > 0) {
    sendLog('Step 1b: Parsing colors...');

    if (platforms.android) {
      const colorFormat = filePaths.androidColorFormat || 'xml';

      if (colorFormat === 'xml' || colorFormat === 'both') {
        const androidColorsXml = generateAndroidColorsXML(variablesData.colors);
        fileUpdates.push({ path: filePaths.androidColorsXml, content: androidColorsXml });
        sendLog('Backend: Generated Android colors.xml');
      }

      if (colorFormat === 'compose' || colorFormat === 'both') {
        if (filePaths.androidComposeColors && filePaths.androidComposeColors.trim()) {
          const composeColors = generateComposeColorsKotlin(
            variablesData.colors,
            filePaths.androidComposePackage || null
          );
          fileUpdates.push({ path: filePaths.androidComposeColors, content: composeColors });
          sendLog('Backend: Generated Compose Color.kt');
        }
      }
    }

    if (platforms.ios) {
      const useSwiftUI = filePaths.iosColorStyle === 'swiftui';
      const iosColors = generateIOSColorsSwift(variablesData.colors, useSwiftUI);
      fileUpdates.push({ path: filePaths.iosColors, content: iosColors });
      sendLog(`Backend: Generated iOS colors (${useSwiftUI ? 'SwiftUI' : 'UIKit'})`);
    }

    if (platforms.flutter) {
      const flutterColors = generateFlutterColors(variablesData.colors);
      fileUpdates.push({ path: filePaths.flutterColors, content: flutterColors });
      sendLog('Backend: Generated Flutter colors');
    }
  }

  // FONTS/TYPOGRAPHY EXPORT
  if (exportTypes.fonts && variablesData.typography && variablesData.typography.length > 0) {
    sendLog('Step 1c: Parsing typography...');

    if (platforms.android) {
      const typographyFormat = filePaths.androidTypographyFormat || 'xml';

      if (typographyFormat === 'xml' || typographyFormat === 'both') {
        if (filePaths.androidTypographyXml && filePaths.androidTypographyXml.trim()) {
          const androidTypographyXml = generateAndroidTypographyXML(variablesData.typography);
          fileUpdates.push({ path: filePaths.androidTypographyXml, content: androidTypographyXml });
          sendLog('Backend: Generated Android styles.xml (Typography)');
        }
      }

      if (typographyFormat === 'compose' || typographyFormat === 'both') {
        if (filePaths.androidTypography && filePaths.androidTypography.trim()) {
          const androidTypography = generateAndroidTypography(
            variablesData.typography,
            filePaths.androidComposePackage || null
          );
          fileUpdates.push({ path: filePaths.androidTypography, content: androidTypography });
          sendLog('Backend: Generated Android Typography.kt (Compose)');
        }
      }
    }

    if (platforms.ios) {
      const useSwiftUI = filePaths.iosColorStyle === 'swiftui';
      const iosTypography = generateIOSTypography(variablesData.typography, useSwiftUI);
      fileUpdates.push({ path: filePaths.iosTypography, content: iosTypography });
      sendLog(`Backend: Generated iOS typography (${useSwiftUI ? 'SwiftUI' : 'UIKit'})`);
    }

    if (platforms.flutter) {
      const flutterTypography = generateFlutterTypography(variablesData.typography);
      fileUpdates.push({ path: filePaths.flutterTypography, content: flutterTypography });
      sendLog('Backend: Generated Flutter typography');
    }
  }

  if (fileUpdates.length === 0) {
    throw new Error('No files to update. Please check your export settings and loaded variables.');
  }

  sendLog(`Backend: Total files to update: ${fileUpdates.length}`);

  // GITHUB WORKFLOW

  // Step 2: Get base branch reference
  sendLog('Step 2: Getting base branch reference...');
  const baseRefUrl = `https://api.github.com/repos/${username}/${repo}/git/ref/heads/${baseBranch}`;
  const baseRefResponse = await makeRequest(baseRefUrl, { method: 'GET', headers });

  if (!baseRefResponse.ok) {
    throw new Error(`Failed to get base branch '${baseBranch}'. Make sure the branch exists.`);
  }

  const baseSha = baseRefResponse.data.object.sha;
  sendLog(`Backend: Base SHA: ${baseSha.substring(0, 7)}`);

  // Step 3: Create or reset branch
  sendLog('Step 3: Creating/resetting branch...');
  const branchRefUrl = `https://api.github.com/repos/${username}/${repo}/git/refs/heads/${targetBranch}`;

  await makeRequest(branchRefUrl, { method: 'DELETE', headers });

  const createRefUrl = `https://api.github.com/repos/${username}/${repo}/git/refs`;
  const createResponse = await makeRequest(createRefUrl, {
    method: 'POST',
    headers: headersWithContent,
    body: JSON.stringify({
      ref: `refs/heads/${targetBranch}`,
      sha: baseSha
    })
  });

  if (!createResponse.ok) {
    throw new Error(`Failed to create branch '${targetBranch}': ${createResponse.error}`);
  }

  sendLog('Backend: Branch ready!');

  // Step 4: Update all files
  sendLog(`Step 4: Updating ${fileUpdates.length} files...`);

  for (let i = 0; i < fileUpdates.length; i++) {
    const { path, content } = fileUpdates[i];

    sendLog(`Backend: [${i + 1}/${fileUpdates.length}] Updating ${path}...`);

    const fileUrl = `https://api.github.com/repos/${username}/${repo}/contents/${path}?ref=${targetBranch}`;
    const fileResponse = await makeRequest(fileUrl, { method: 'GET', headers });

    const fileSha = fileResponse.ok ? fileResponse.data.sha : undefined;

    const updateFileUrl = `https://api.github.com/repos/${username}/${repo}/contents/${path}`;
    const base64Content = encodeBase64(content);

    const updateFileResponse = await makeRequest(updateFileUrl, {
      method: 'PUT',
      headers: headersWithContent,
      body: JSON.stringify({
        message: commitMessage,
        content: base64Content,
        branch: targetBranch,
        ...(fileSha && { sha: fileSha })
      })
    });

    if (!updateFileResponse.ok) {
      const errorDetail = updateFileResponse.error ? JSON.parse(updateFileResponse.error) : {};
      if (errorDetail.message && errorDetail.message.includes('does not exist')) {
        throw new Error(`Path '${path}' does not exist. Please create the folder structure first.`);
      }
      throw new Error(`Failed to update ${path}: ${updateFileResponse.error}`);
    }

    sendLog(`Backend: ✓ Updated ${path}`);
  }

  // Step 5: Create PR
  sendLog('Step 5: Creating pull request...');

  const exportTypesList = [];
  if (exportTypes.strings) exportTypesList.push('Strings');
  if (exportTypes.colors) exportTypesList.push('Colors');
  if (exportTypes.fonts) exportTypesList.push('Typography');

  const platformsList = [];
  if (platforms.android) platformsList.push('Android');
  if (platforms.ios) platformsList.push('iOS');
  if (platforms.flutter) platformsList.push('Flutter');

  const finalPrTitle = prTitle || '🎨 Update Design Tokens from Figma';

  let prBody = '';
  if (prTemplate === 'detailed') {
    prBody = `## 🎨 Automated Design System Update

**Generated from Figma Variables**

### 📊 Summary
- **Export Types:** ${exportTypesList.join(', ')}
- **Platforms:** ${platformsList.join(', ')}
- **Files Updated:** ${fileUpdates.length}

### 📝 Updated Files
${fileUpdates.map(f => `- \`${f.path}\``).join('\n')}

### 🔄 Changes
This PR updates design tokens to match the latest Figma Variables.

---
*Automatically generated by Design System Sync v3.0*`;
  } else {
    prBody = `Updated design tokens from Figma.\n\n**Types:** ${exportTypesList.join(', ')}\n**Platforms:** ${platformsList.join(', ')}\n**Files:** ${fileUpdates.length}`;
  }

  const prUrl = `https://api.github.com/repos/${username}/${repo}/pulls`;
  const prPayload = {
    title: finalPrTitle,
    body: prBody,
    head: targetBranch,
    base: baseBranch
  };

  const prResponse = await makeRequest(prUrl, {
    method: 'POST',
    headers: headersWithContent,
    body: JSON.stringify(prPayload)
  });

  if (prResponse.ok) {
    const prData = prResponse.data;
    sendLog(`Backend: PR #${prData.number} created!`, 'success');

    figma.ui.postMessage({
      type: 'upload-success',
      data: {
        prNumber: prData.number,
        prUrl: prData.html_url,
        exportTypes: exportTypesList,
        platforms: platformsList
      }
    });

    figma.notify(`🎉 PR #${prData.number} created!`, { timeout: 5000 });
  } else if (prResponse.status === 422) {
    sendLog('Backend: PR already exists', 'info');
    figma.ui.postMessage({
      type: 'upload-success',
      data: {
        message: 'Files updated. PR already exists.',
        exportTypes: exportTypesList,
        platforms: platformsList
      }
    });
    figma.notify('✅ Files updated!', { timeout: 3000 });
  } else {
    throw new Error(`PR creation failed: ${prResponse.error}`);
  }
}
