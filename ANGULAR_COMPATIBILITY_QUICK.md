# Angular Compatibility Quick Reference

This is a quick reference guide for the detailed [ANGULAR_COMPATIBILITY.md](./ANGULAR_COMPATIBILITY.md) report.

## TL;DR

**Minimum Supported Version: Angular 17.1.0**

The `angular-chrts` library uses modern Angular Signals API which requires Angular 17.1 or higher.

## Quick Compatibility Matrix

| Angular Version | Status | Notes |
|----------------|--------|-------|
| 19.x | ✅ **Fully Supported** | Recommended version |
| 18.x | ⚠️ Requires config changes | Need to modify `angular.json` |
| 17.1+ | ⚠️ Requires config changes | Minimum viable version |
| 17.0 | ❌ Not supported | Signals still in dev preview |
| 16.x and below | ❌ Not supported | Signals not stable/available |

## For Users

### If you're on Angular 19.x
✅ You're good to go! Just install:
```bash
npm install angular-chrts @unovis/angular @unovis/ts
```

### If you're on Angular 18.x
⚠️ You can use this library, but need to:
1. Modify `angular.json` to use `@angular-devkit/build-angular` builders
2. See detailed instructions in [ANGULAR_COMPATIBILITY.md](./ANGULAR_COMPATIBILITY.md#angular-18x-)

### If you're on Angular 17.1+
⚠️ Same as Angular 18.x - requires build configuration changes

### If you're on Angular 16 or older
❌ Please upgrade to Angular 17.1+ before using this library

**Why?** This library is built on Angular Signals (`input()`, `output()`, `computed()`, `effect()`) which were only stabilized in Angular 17.1.

## Quick Upgrade Path

```bash
# From Angular 15/16 to 17.1
ng update @angular/core@17.1 @angular/cli@17.1

# Then install angular-chrts
npm install angular-chrts @unovis/angular @unovis/ts
```

## Need More Details?

See the complete [ANGULAR_COMPATIBILITY.md](./ANGULAR_COMPATIBILITY.md) report for:
- Detailed version-by-version analysis
- Migration guides
- Technical explanations
- Alternative solutions
- Code examples

## Support

For issues or questions:
- GitHub Issues: [angular-chrts/issues](https://github.com/dennisadriaans/angular-chrts/issues)
- Documentation: [nuxtcharts.com/docs](https://nuxtcharts.com/docs)
