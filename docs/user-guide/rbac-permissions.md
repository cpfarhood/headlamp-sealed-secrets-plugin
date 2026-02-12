# RBAC Permissions Guide

Configure Role-Based Access Control for Sealed Secrets operations.

## Overview

The Headlamp Sealed Secrets plugin integrates with Kubernetes RBAC to control:
- Who can **view** SealedSecrets
- Who can **create** SealedSecrets
- Who can **delete** SealedSecrets
- Who can **view unsealed Secrets**
- Who can **download sealing certificates**

The plugin automatically checks permissions and hides/disables UI elements based on your RBAC roles.

## Required Permissions

### Minimum Read-Only Access

To **view** sealed secrets in Headlamp:

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: sealed-secrets-viewer
rules:
# View SealedSecrets
- apiGroups: ["bitnami.com"]
  resources: ["sealedsecrets"]
  verbs: ["get", "list"]

# View namespaces (for filtering)
- apiGroups: [""]
  resources: ["namespaces"]
  verbs: ["list"]
```

**What you can do:**
- ✅ List all sealed secrets
- ✅ View sealed secret details
- ✅ See encrypted data (safe to view)
- ❌ Create new sealed secrets
- ❌ Delete sealed secrets
- ❌ View unsealed secret values

### Creator Access

To **create** sealed secrets:

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: sealed-secrets-creator
rules:
# Create and view SealedSecrets
- apiGroups: ["bitnami.com"]
  resources: ["sealedsecrets"]
  verbs: ["get", "list", "create"]

# Download sealing certificates
- apiGroups: [""]
  resources: ["services/proxy"]
  verbs: ["get"]
  resourceNames: ["sealed-secrets-controller"]

# Or direct service access
- apiGroups: [""]
  resources: ["services"]
  verbs: ["get"]
  resourceNames: ["sealed-secrets-controller"]

# View namespaces
- apiGroups: [""]
  resources: ["namespaces"]
  verbs: ["list"]
```

**What you can do:**
- ✅ Everything from viewer role
- ✅ Create new sealed secrets
- ✅ Download sealing certificates
- ❌ Delete sealed secrets
- ❌ View unsealed secret values

### Full Access

To have **complete control** over sealed secrets:

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: sealed-secrets-admin
rules:
# Full SealedSecret access
- apiGroups: ["bitnami.com"]
  resources: ["sealedsecrets"]
  verbs: ["get", "list", "create", "update", "patch", "delete"]

# View unsealed Secrets
- apiGroups: [""]
  resources: ["secrets"]
  verbs: ["get", "list"]

# Access controller
- apiGroups: [""]
  resources: ["services", "services/proxy"]
  verbs: ["get"]

# View namespaces
- apiGroups: [""]
  resources: ["namespaces"]
  verbs: ["list"]
```

**What you can do:**
- ✅ Everything from creator role
- ✅ Delete sealed secrets
- ✅ View unsealed secret values (decrypt)
- ✅ Update sealed secrets

## Example RBAC Configurations

### Example 1: Development Team (Namespace-Scoped)

Allow developers to manage sealed secrets in their namespace:

```yaml
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: dev-team-sealed-secrets
  namespace: development
rules:
- apiGroups: ["bitnami.com"]
  resources: ["sealedsecrets"]
  verbs: ["get", "list", "create", "delete"]

- apiGroups: [""]
  resources: ["services"]
  verbs: ["get"]
  resourceNames: ["sealed-secrets-controller"]

---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: dev-team-sealed-secrets
  namespace: development
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: dev-team-sealed-secrets
subjects:
- kind: Group
  name: developers
  apiGroup: rbac.authorization.k8s.io
```

### Example 2: Platform Team (Cluster-Wide)

Allow platform team to manage all sealed secrets:

```yaml
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: platform-sealed-secrets
rules:
- apiGroups: ["bitnami.com"]
  resources: ["sealedsecrets"]
  verbs: ["*"]

- apiGroups: [""]
  resources: ["secrets"]
  verbs: ["get", "list"]

- apiGroups: [""]
  resources: ["services", "services/proxy"]
  verbs: ["get"]

- apiGroups: [""]
  resources: ["namespaces"]
  verbs: ["list"]

---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: platform-sealed-secrets
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: platform-sealed-secrets
subjects:
- kind: Group
  name: platform-team
  apiGroup: rbac.authorization.k8s.io
```

### Example 3: Read-Only Auditor

Allow security team to audit sealed secrets without modification:

```yaml
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: sealed-secrets-auditor
rules:
- apiGroups: ["bitnami.com"]
  resources: ["sealedsecrets"]
  verbs: ["get", "list"]

- apiGroups: [""]
  resources: ["secrets"]
  verbs: ["get", "list"]

- apiGroups: [""]
  resources: ["namespaces"]
  verbs: ["list"]

---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: security-team-auditor
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: sealed-secrets-auditor
subjects:
- kind: Group
  name: security-auditors
  apiGroup: rbac.authorization.k8s.io
```

### Example 4: CI/CD Service Account

Allow automated systems to create sealed secrets:

```yaml
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: ci-cd-sealed-secrets
  namespace: ci-cd

---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: ci-cd-sealed-secrets-creator
rules:
- apiGroups: ["bitnami.com"]
  resources: ["sealedsecrets"]
  verbs: ["create", "get", "list"]

- apiGroups: [""]
  resources: ["services"]
  verbs: ["get"]
  resourceNames: ["sealed-secrets-controller"]

---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: ci-cd-sealed-secrets
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: ci-cd-sealed-secrets-creator
subjects:
- kind: ServiceAccount
  name: ci-cd-sealed-secrets
  namespace: ci-cd
```

## Plugin UI Behavior

The plugin automatically adjusts the UI based on permissions:

### With Full Permissions
- ✅ "Create Sealed Secret" button visible
- ✅ "Delete" button visible on details page
- ✅ "Decrypt" button visible (if Secret access granted)
- ✅ Download sealing certificates

### With Read-Only Permissions
- ❌ "Create Sealed Secret" button hidden
- ❌ "Delete" button hidden/disabled
- ❌ "Decrypt" button hidden
- ❌ Download button hidden/disabled

### Testing Permissions

The plugin uses Kubernetes `SelfSubjectAccessReview` to check permissions in real-time.

You can test manually:

```bash
# Check if you can create SealedSecrets
kubectl auth can-i create sealedsecrets.bitnami.com

# Check if you can list SealedSecrets
kubectl auth can-i list sealedsecrets.bitnami.com

# Check if you can view Secrets (for decryption)
kubectl auth can-i get secrets

# Check in specific namespace
kubectl auth can-i create sealedsecrets.bitnami.com -n production
```

## Common Permission Issues

### Issue 1: "Create Sealed Secret" Button Not Showing

**Cause**: Missing `create` permission for SealedSecrets.

**Solution**:
```yaml
rules:
- apiGroups: ["bitnami.com"]
  resources: ["sealedsecrets"]
  verbs: ["create"]  # Add this verb
```

### Issue 2: Cannot Download Sealing Certificates

**Cause**: Missing service access permission.

**Solution**:
```yaml
rules:
- apiGroups: [""]
  resources: ["services"]
  verbs: ["get"]
  resourceNames: ["sealed-secrets-controller"]
```

Or for proxy access:
```yaml
rules:
- apiGroups: [""]
  resources: ["services/proxy"]
  verbs: ["get", "create"]
```

### Issue 3: "Decrypt" Button Not Showing

**Cause**: Missing `get` permission for Secrets.

**Solution**:
```yaml
rules:
- apiGroups: [""]
  resources: ["secrets"]
  verbs: ["get"]  # Required for decryption
```

### Issue 4: Cannot See SealedSecrets in Other Namespaces

**Cause**: Using `Role` instead of `ClusterRole`, or missing namespace list permission.

**Solution**: Use `ClusterRole` and `ClusterRoleBinding`:
```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole  # Not Role
metadata:
  name: sealed-secrets-viewer
rules:
- apiGroups: ["bitnami.com"]
  resources: ["sealedsecrets"]
  verbs: ["get", "list"]
- apiGroups: [""]
  resources: ["namespaces"]
  verbs: ["list"]  # Required
```

## Security Best Practices

### 1. Principle of Least Privilege

Only grant the minimum permissions needed:

```yaml
# Good: Namespace-scoped for dev team
kind: Role
metadata:
  namespace: dev-team-namespace

# Risky: Cluster-wide for dev team
kind: ClusterRole  # Only if truly needed
```

### 2. Separate Secret Access

Don't grant Secret access unless absolutely necessary:

```yaml
# ✅ Good: Can create SealedSecrets but not view Secrets
- apiGroups: ["bitnami.com"]
  resources: ["sealedsecrets"]
  verbs: ["create"]

# ❌ Risky: Can view unsealed Secrets
- apiGroups: [""]
  resources: ["secrets"]
  verbs: ["get", "list"]  # Only for authorized users
```

### 3. Use Groups, Not Individual Users

```yaml
# ✅ Good: Use groups
subjects:
- kind: Group
  name: developers

# ❌ Harder to maintain: Individual users
subjects:
- kind: User
  name: alice
- kind: User
  name: bob
```

### 4. Audit RBAC Changes

```bash
# List all ClusterRoleBindings for SealedSecrets
kubectl get clusterrolebindings -o json | \
  jq '.items[] | select(.roleRef.name | contains("sealed-secrets"))'

# List all RoleBindings in a namespace
kubectl get rolebindings -n production -o yaml
```

## Troubleshooting Commands

```bash
# 1. Check your current permissions
kubectl auth can-i --list

# 2. Check specific permission
kubectl auth can-i create sealedsecrets.bitnami.com -n production

# 3. Check as another user (requires admin)
kubectl auth can-i create sealedsecrets --as alice --as-group developers

# 4. View your roles
kubectl get rolebindings,clusterrolebindings --all-namespaces -o wide | grep $(kubectl auth whoami)

# 5. Describe a role
kubectl describe clusterrole sealed-secrets-creator
```

## Next Steps

- **[Creating Secrets](creating-secrets.md)** - Create your first sealed secret
- **[Scopes Explained](scopes-explained.md)** - Understand security scopes
- **[Security Hardening](../deployment/security-hardening.md)** - Production security guide

## Resources

- [Kubernetes RBAC Documentation](https://kubernetes.io/docs/reference/access-authn-authz/rbac/)
- [SelfSubjectAccessReview API](https://kubernetes.io/docs/reference/access-authn-authz/authorization/#checking-api-access)
- [Best Practices for RBAC](https://kubernetes.io/docs/concepts/security/rbac-good-practices/)
