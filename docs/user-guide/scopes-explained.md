# Scopes Explained

Understanding SealedSecret scopes and when to use each one.

## What are Scopes?

Scopes determine **where** a SealedSecret can be unsealed. They control the binding between the encrypted data and its Kubernetes resource identity (namespace and/or name).

Think of scopes as **security levels** for your encrypted secrets:
- **Strict** = Locked to specific name + namespace (most secure)
- **Namespace-wide** = Locked to namespace (can rename)
- **Cluster-wide** = Can move anywhere (least secure)

## The Three Scopes

### Strict Scope (Recommended)

**Binding**: Namespace + Name + Key

The sealed secret can ONLY be unsealed if all three match:
- ✅ Same namespace
- ✅ Same secret name
- ✅ Same key name

**Example:**
```yaml
apiVersion: bitnami.com/v1alpha1
kind: SealedSecret
metadata:
  name: db-credentials
  namespace: production
spec:
  encryptedData:
    password: AgB...  # Can ONLY be unsealed as:
                      # - name: db-credentials
                      # - namespace: production
                      # - key: password
```

**Use when:**
- Production secrets
- Database credentials
- API keys
- Any sensitive data

**Advantages:**
- ✅ Maximum security
- ✅ Prevents accidental leaks from renaming
- ✅ Prevents cross-namespace access

**Limitations:**
- ❌ Cannot rename the secret
- ❌ Cannot move to different namespace
- ❌ Must re-encrypt if name/namespace changes

**Creating with Headlamp:**
1. Click "Create Sealed Secret"
2. Select **"strict"** scope (default)
3. Fill in name, namespace, and secret data
4. Click "Create"

**Creating with kubeseal:**
```bash
kubectl create secret generic db-credentials \
  --namespace production \
  --from-literal=password=mysecret \
  --dry-run=client -o yaml | \
kubeseal --cert cert.pem --scope strict --format yaml
```

### Namespace-Wide Scope

**Binding**: Namespace + Key

The sealed secret can be unsealed if:
- ✅ Same namespace
- ✅ Same key name
- ⚠️ Any secret name (can rename)

**Example:**
```yaml
apiVersion: bitnami.com/v1alpha1
kind: SealedSecret
metadata:
  name: app-config
  namespace: staging
spec:
  encryptedData:
    api-url: AgB...  # Can be unsealed as:
                     # - name: app-config (or ANY name)
                     # - namespace: staging (must match)
                     # - key: api-url (must match)
```

**Use when:**
- Shared configuration across multiple apps in a namespace
- Secrets that might be renamed
- Non-critical secrets

**Advantages:**
- ✅ Flexible naming
- ✅ Can rename secret without re-encryption
- ✅ Still namespace-isolated

**Limitations:**
- ❌ Less secure than strict
- ❌ Cannot move to different namespace
- ❌ Anyone in namespace can unseal by creating correctly-named secret

**Creating with Headlamp:**
1. Click "Create Sealed Secret"
2. Select **"namespace-wide"** scope
3. Fill in namespace and secret data
4. Name can be changed later

**Creating with kubeseal:**
```bash
kubectl create secret generic temp-name \
  --namespace staging \
  --from-literal=api-url=https://api.staging.example.com \
  --dry-run=client -o yaml | \
kubeseal --cert cert.pem --scope namespace-wide --format yaml
```

### Cluster-Wide Scope

**Binding**: Key only

The sealed secret can be unsealed if:
- ⚠️ Any namespace
- ⚠️ Any secret name
- ✅ Same key name

**Example:**
```yaml
apiVersion: bitnami.com/v1alpha1
kind: SealedSecret
metadata:
  name: global-config
  namespace: default
spec:
  encryptedData:
    license-key: AgB...  # Can be unsealed as:
                         # - name: ANY
                         # - namespace: ANY
                         # - key: license-key (must match)
```

**Use when:**
- Truly global configuration
- License keys used across all namespaces
- Public URLs or non-sensitive config

**Advantages:**
- ✅ Maximum flexibility
- ✅ Can move anywhere in cluster
- ✅ Can rename freely

**Limitations:**
- ❌ Least secure
- ❌ Anyone in cluster can unseal
- ❌ Easy to accidentally expose

**Creating with Headlamp:**
1. Click "Create Sealed Secret"
2. Select **"cluster-wide"** scope
3. Fill in secret data
4. Can deploy to any namespace

**Creating with kubeseal:**
```bash
kubectl create secret generic temp \
  --from-literal=license-key=ABC123 \
  --dry-run=client -o yaml | \
kubeseal --cert cert.pem --scope cluster-wide --format yaml
```

## Scope Comparison

| Feature | Strict | Namespace-Wide | Cluster-Wide |
|---------|--------|----------------|--------------|
| **Security** | 🔒🔒🔒 High | 🔒🔒 Medium | 🔒 Low |
| **Can rename** | ❌ No | ✅ Yes | ✅ Yes |
| **Can move namespace** | ❌ No | ❌ No | ✅ Yes |
| **Binding** | Name+NS+Key | NS+Key | Key only |
| **Use case** | Production secrets | Shared namespace config | Global config |
| **Recommended for** | Credentials, API keys | App config | Public URLs |

## Decision Tree

```
┌─────────────────────────────────┐
│ Is this a sensitive credential? │
│ (password, API key, token, etc) │
└─────────┬──────────────┬────────┘
          │              │
        YES             NO
          │              │
          v              v
    ┌─────────┐    ┌──────────────────┐
    │ strict  │    │ Could this value │
    │ scope   │    │ be shared across │
    └─────────┘    │ your cluster?    │
                   └────┬────────┬────┘
                        │        │
                      YES       NO
                        │        │
                        v        v
                   ┌──────────┐ ┌──────────────┐
                   │cluster-  │ │namespace-    │
                   │wide scope│ │wide scope    │
                   └──────────┘ └──────────────┘
```

## Examples by Use Case

### Database Credentials (Strict)

```yaml
apiVersion: bitnami.com/v1alpha1
kind: SealedSecret
metadata:
  name: postgres-credentials
  namespace: production
spec:
  encryptedData:
    username: AgB...
    password: AgB...
    host: AgB...
```

**Why strict?** Credentials must not leak to other namespaces or be accessible via renaming.

### Application Config (Namespace-Wide)

```yaml
apiVersion: bitnami.com/v1alpha1
kind: SealedSecret
metadata:
  name: app-config
  namespace: staging
spec:
  encryptedData:
    api-url: AgB...
    timeout: AgB...
    log-level: AgB...
```

**Why namespace-wide?** Config is specific to staging but might be used by multiple apps (with different names).

### License Key (Cluster-Wide)

```yaml
apiVersion: bitnami.com/v1alpha1
kind: SealedSecret
metadata:
  name: company-license
  namespace: default
spec:
  encryptedData:
    license-key: AgB...
```

**Why cluster-wide?** The same license applies to all namespaces and environments.

## Changing Scopes

You **cannot** change a scope after encryption. To change scope:

1. **Delete the old sealed secret**:
   ```bash
   kubectl delete sealedsecret old-secret -n production
   ```

2. **Re-encrypt with new scope**:
   ```bash
   kubectl create secret generic old-secret \
     --namespace production \
     --from-literal=password=value \
     --dry-run=client -o yaml | \
   kubeseal --cert cert.pem --scope namespace-wide --format yaml > new-sealed-secret.yaml
   ```

3. **Apply new sealed secret**:
   ```bash
   kubectl apply -f new-sealed-secret.yaml
   ```

## Security Best Practices

### 1. Default to Strict

Always use **strict scope** unless you have a specific reason not to:

✅ **Good:**
```bash
# Explicit strict scope
kubeseal --scope strict
```

❌ **Risky:**
```bash
# Using cluster-wide for credentials
kubeseal --scope cluster-wide  # Don't do this for secrets!
```

### 2. Audit Your Scopes

List all sealed secrets and their scopes:

```bash
kubectl get sealedsecrets --all-namespaces -o json | \
  jq -r '.items[] | "\(.metadata.namespace)/\(.metadata.name): \(.spec.template.type // "strict")"'
```

### 3. Separate Sensitive from Non-Sensitive

```bash
# Sensitive → strict
kubectl create secret generic db-creds --from-literal=password=... | \
  kubeseal --scope strict

# Non-sensitive → namespace-wide or cluster-wide
kubectl create secret generic app-urls --from-literal=api=https://... | \
  kubeseal --scope namespace-wide
```

### 4. Document Scope Choices

Add annotations to explain why a scope was chosen:

```yaml
apiVersion: bitnami.com/v1alpha1
kind: SealedSecret
metadata:
  name: db-credentials
  namespace: production
  annotations:
    sealedsecrets.scope: "strict"
    sealedsecrets.reason: "Database credentials must not be accessible outside production namespace"
spec:
  encryptedData:
    password: AgB...
```

## Common Mistakes

### ❌ Using Cluster-Wide for Everything

```bash
# DON'T: Encrypting passwords with cluster-wide scope
kubeseal --scope cluster-wide < secret-with-passwords.yaml
```

**Problem**: Anyone in any namespace can create a secret with the same key name and unseal it.

**Solution**: Use strict scope for credentials.

### ❌ Renaming Strict-Scoped Secrets

```bash
# Create strict-scoped secret
kubectl apply -f db-secret.yaml  # name: db-credentials

# Later, try to rename
kubectl apply -f db-secret.yaml  # name: database-creds (DIFFERENT NAME)
```

**Problem**: Sealed secret won't unseal because name changed.

**Solution**: Re-encrypt with new name or use namespace-wide scope.

### ❌ Moving Secrets Between Namespaces

```bash
# Seal for production
kubectl create secret generic app-secret --namespace production | kubeseal

# Try to use in staging
kubectl apply -f sealed-secret.yaml --namespace staging
```

**Problem**: Won't unseal (namespace mismatch with strict or namespace-wide scope).

**Solution**: Re-encrypt for the target namespace or use cluster-wide (if appropriate).

## Next Steps

- **[RBAC Permissions](rbac-permissions.md)** - Control who can create/view sealed secrets
- **[Creating Secrets](creating-secrets.md)** - Complete guide to secret creation
- **[Secret Rotation](../tutorials/secret-rotation.md)** - Rotate secrets and keys

## Resources

- [Sealed Secrets Scopes Documentation](https://github.com/bitnami-labs/sealed-secrets#scopes)
- [Security Best Practices](../deployment/security-hardening.md)
