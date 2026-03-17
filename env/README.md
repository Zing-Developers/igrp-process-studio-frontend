# Environment Configuration

This directory should contain environment-specific configuration files for deployment.

## Production Environment

Create a `.env.production` file in this directory with the following variables:

```bash
# NextAuth Configuration
NEXTAUTH_URL=https://your-production-domain.com
NEXTAUTH_SECRET=your-secure-random-secret-string

# Keycloak Configuration
KEYCLOAK_CLIENT_ID=your-keycloak-client-id
KEYCLOAK_CLIENT_SECRET=your-keycloak-client-secret
KEYCLOAK_ISSUER=https://your-keycloak-server/realms/your-realm

# iGRP Configuration
IGRP_APP_MANAGER_API=https://your-api-domain.com
IGRP_APP_BASE_PATH=
IGRP_LOGOUT_URL=/logout
IGRP_PREVIEW_MODE=false
```

## Docker Build

The Dockerfile will copy `.env.production` from this directory if it exists. If the file doesn't exist, the build will continue without it, but you'll need to provide environment variables at runtime through:

- Docker run: `docker run -e NEXTAUTH_URL=... -e KEYCLOAK_CLIENT_ID=... your-image`
- Docker Compose: Set environment variables in your `docker-compose.yml`
- Kubernetes: Use ConfigMaps and Secrets

## Important Notes

1. **Never commit** `.env.production` files with real credentials to version control
2. The `NEXTAUTH_SECRET` should be a secure random string (generate with: `openssl rand -base64 32`)
3. All Keycloak variables must be set for authentication to work
4. The application will fail to start if required environment variables are missing


