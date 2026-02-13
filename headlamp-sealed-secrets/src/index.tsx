/**
 * Headlamp Sealed Secrets Plugin
 *
 * A comprehensive plugin for managing Bitnami Sealed Secrets in Kubernetes.
 * Provides UI for viewing, creating, and managing encrypted secrets.
 *
 * Features:
 * - List and detail views for SealedSecrets
 * - Client-side encryption using controller's public key
 * - Sealing keys management
 * - Secret decryption (via K8s Secret access)
 * - Integration with Headlamp's Secret detail view
 *
 * @see https://github.com/bitnami-labs/sealed-secrets
 */

import {
  registerDetailsViewSection,
  registerPluginSettings,
  registerRoute,
  registerSidebarEntry,
} from '@kinvolk/headlamp-plugin/lib';
import React from 'react';
import { ApiErrorBoundary, GenericErrorBoundary } from './components/ErrorBoundary';
import { SealedSecretList } from './components/SealedSecretList';
import { SealingKeysView } from './components/SealingKeysView';
import { SecretDetailsSection } from './components/SecretDetailsSection';
import { SettingsPage } from './components/SettingsPage';

/**
 * Register sidebar navigation
 */

// Main "Sealed Secrets" entry
registerSidebarEntry({
  parent: null,
  name: 'sealed-secrets',
  label: 'Sealed Secrets',
  icon: 'mdi:lock',
  url: '/sealedsecrets',
});

// "All Sealed Secrets" child entry
registerSidebarEntry({
  parent: 'sealed-secrets',
  name: 'sealed-secrets-list',
  label: 'All Sealed Secrets',
  url: '/sealedsecrets',
});

// "Sealing Keys" child entry
registerSidebarEntry({
  parent: 'sealed-secrets',
  name: 'sealing-keys',
  label: 'Sealing Keys',
  url: '/sealedsecrets/keys',
});

/**
 * Register routes
 */

// List view with optional detail drawer
registerRoute({
  path: '/sealedsecrets/:namespace?/:name?',
  sidebar: 'sealed-secrets-list',
  component: () => (
    <ApiErrorBoundary>
      <SealedSecretList />
    </ApiErrorBoundary>
  ),
  exact: true,
  name: 'sealedsecret',
});

// Sealing keys view
registerRoute({
  path: '/sealedsecrets/keys',
  sidebar: 'sealing-keys',
  component: () => (
    <ApiErrorBoundary>
      <SealingKeysView />
    </ApiErrorBoundary>
  ),
  exact: true,
});

/**
 * Register integration with Secret detail view
 *
 * Adds a "Sealed Secret" section to Secrets that are owned by SealedSecrets
 */
registerDetailsViewSection(({ resource }) => {
  if (resource?.kind === 'Secret') {
    return (
      <GenericErrorBoundary>
        <SecretDetailsSection resource={resource} />
      </GenericErrorBoundary>
    );
  }
  return null;
});

/**
 * Register plugin settings
 *
 * Settings will appear in Settings → Plugins → Sealed Secrets
 */
registerPluginSettings(
  'headlamp-sealed-secrets',
  () => (
    <GenericErrorBoundary>
      <SettingsPage />
    </GenericErrorBoundary>
  ),
  true // Display save button
);
