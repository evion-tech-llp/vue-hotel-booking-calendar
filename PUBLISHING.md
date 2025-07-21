# Publishing Guide

This guide covers how to publish the Vue Hotel Booking Calendar to npm.

## Pre-publishing Checklist

Before publishing, ensure you've completed these steps:

### 1. Version Management

```bash
# Update the version in package.json (choose one):
npm version patch   # for bug fixes (1.0.0 -> 1.0.1)
npm version minor   # for new features (1.0.0 -> 1.1.0)
npm version major   # for breaking changes (1.0.0 -> 2.0.0)
```

### 2. Quality Checks

```bash
# Run all quality checks
npm run type-check
npm run lint
npm run format

# Build the library
npm run build:lib
```

### 3. Test the Build

```bash
# Test the built package locally
npm pack

# This creates a .tgz file you can test in another project:
# npm install path/to/vue-hotel-booking-calendar-x.x.x.tgz
```

### 4. Update Documentation

- [ ] Update CHANGELOG.md with new features/fixes
- [ ] Update version in README.md if needed
- [ ] Update examples if API changed

## Publishing to npm

### First-time Setup

1. **Create an npm account** at https://npmjs.com if you don't have one

2. **Login to npm:**

```bash
npm login
```

3. **Verify your login:**

```bash
npm whoami
```

### Publishing

1. **Dry run to see what will be published:**

```bash
npm publish --dry-run
```

2. **Publish to npm:**

```bash
npm publish
```

For beta/alpha versions:

```bash
npm publish --tag beta
npm publish --tag alpha
```

### Post-Publishing

1. **Verify the package:**
   - Check on https://www.npmjs.com/package/vue-hotel-booking-calendar
   - Test installation: `npm install vue-hotel-booking-calendar`

2. **Create a GitHub release:**
   - Tag the commit: `git tag v1.0.0`
   - Push tags: `git push origin --tags`
   - Create release on GitHub with changelog

3. **Update documentation:**
   - Update any external documentation
   - Update demo sites if applicable

## Automated Publishing (Recommended)

Consider setting up automated publishing with GitHub Actions:

1. Create `.github/workflows/publish.yml`:

```yaml
name: Publish to npm

on:
  release:
    types: [published]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm run type-check
      - run: npm run build:lib
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

2. Add your npm token as a GitHub secret named `NPM_TOKEN`

## Beta/Development Releases

For testing purposes:

```bash
# Publish a beta version
npm version prerelease --preid=beta
npm publish --tag beta

# Users install with:
npm install vue-hotel-booking-calendar@beta
```

## Troubleshooting

### Common Issues

1. **"Package already exists"**
   - Version already published
   - Use `npm version` to increment

2. **"403 Forbidden"**
   - Not logged in: `npm login`
   - No publish permissions
   - Package name conflicts with existing package

3. **"Files not included"**
   - Check `.npmignore` and `package.json` "files" field
   - Use `npm pack` to verify contents

### Recovery

If you need to unpublish (within 72 hours):

```bash
npm unpublish vue-hotel-booking-calendar@1.0.0 --force
```

**Note:** Unpublishing is discouraged and has restrictions.

## Package Maintenance

### Regular Tasks

- [ ] Monitor for security vulnerabilities
- [ ] Update dependencies regularly
- [ ] Respond to issues and pull requests
- [ ] Keep documentation up to date

### Analytics

- Check npm download stats
- Monitor GitHub stars/forks
- Review user feedback and issues
