# Deployment Trigger

This file is used to trigger redeployments when environment variables are updated.

Last updated: 2025-06-15

## Why This File?

When environment variables are added/updated in Vercel, a new deployment is required to load them.
This file triggers that deployment without modifying actual code.
