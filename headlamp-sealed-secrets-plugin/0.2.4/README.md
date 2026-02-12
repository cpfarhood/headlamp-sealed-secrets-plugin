# Headlamp Sealed Secrets Plugin

A [Headlamp](https://headlamp.dev) plugin for managing [Bitnami Sealed Secrets](https://github.com/bitnami-labs/sealed-secrets) in Kubernetes clusters.

## Features

- **Client-Side Encryption**: Encrypt secrets in your browser using the controller's public key
- **Resource Management**: List, view, create, and manage SealedSecrets
- **Key Management**: View sealing key pairs and download public certificates
- **RBAC Integration**: UI adapts to user permissions
- **Decryption Support**: View decrypted values (requires appropriate RBAC permissions)

## Installation

### Prerequisites

1. Headlamp v0.13.0 or later
2. Sealed Secrets controller installed on your cluster:
   ```bash
   kubectl apply -f https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.24.0/controller.yaml
   ```

### Install Plugin

The plugin can be installed directly from Artifact Hub through Headlamp's plugin manager, or manually:

```bash
# Download and extract
curl -LO https://github.com/privilegedescalation/headlamp-sealed-secrets-plugin/releases/download/v0.2.4/headlamp-sealed-secrets-0.2.4.tar.gz
tar -xzf headlamp-sealed-secrets-0.2.4.tar.gz

# Copy to plugins directory
# macOS
cp -r headlamp-sealed-secrets ~/Library/Application\ Support/Headlamp/plugins/

# Linux
cp -r headlamp-sealed-secrets ~/.config/Headlamp/plugins/

# Restart Headlamp
```

## Usage

### Creating a SealedSecret

1. Navigate to **Sealed Secrets** in the sidebar
2. Click **Create Sealed Secret**
3. Fill in name, namespace, scope, and key-value pairs
4. Click **Create**

The plugin encrypts values client-side and applies the SealedSecret to the cluster. The controller creates the corresponding Kubernetes Secret.

### Viewing and Managing

- **List View**: Browse all SealedSecrets with filtering
- **Detail View**: Inspect encrypted data and status
- **Decrypt**: View plaintext values (requires RBAC permissions)
- **Re-encrypt**: Rotate with current active key

### Managing Keys

Navigate to **Sealed Secrets** > **Sealing Keys** to:
- View all sealing key pairs
- Check certificate validity
- Download public certificates for CLI use

## Architecture

The plugin implements the same encryption algorithm as `kubeseal`:

1. Fetches the controller's public certificate via Kubernetes API
2. Encrypts values using RSA-OAEP + AES-256-GCM
3. Creates SealedSecret resources
4. Controller decrypts and creates Secrets

All encryption happens in the browser. Plaintext values never leave your machine.

## Technical Details

- **Language**: TypeScript with strict mode
- **Crypto Library**: node-forge (RSA-OAEP + AES-256-GCM)
- **Bundle Size**: 358.18 kB (98.04 kB gzipped)
- **Test Coverage**: 92%
- **License**: Apache-2.0

## Troubleshooting

### Controller not found
```bash
# Install controller
kubectl apply -f https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.24.0/controller.yaml

# Verify running
kubectl get pods -n kube-system -l name=sealed-secrets-controller
```

### Failed to fetch certificate
- Check controller settings (name, namespace, port)
- Verify controller is running and accessible

### Decrypt fails
- Ensure SealedSecret status shows "Synced"
- Verify RBAC permissions: `kubectl auth can-i get secrets -n <namespace>`

## Contributing

Contributions welcome! See [GitHub repository](https://github.com/privilegedescalation/headlamp-sealed-secrets-plugin) for details.

## Links

- [GitHub Repository](https://github.com/privilegedescalation/headlamp-sealed-secrets-plugin)
- [Issue Tracker](https://github.com/privilegedescalation/headlamp-sealed-secrets-plugin/issues)
- [Sealed Secrets Project](https://github.com/bitnami-labs/sealed-secrets)
- [Headlamp](https://headlamp.dev)

## License

Apache License 2.0 - See [LICENSE](https://github.com/privilegedescalation/headlamp-sealed-secrets-plugin/blob/main/headlamp-sealed-secrets/LICENSE) for details.
