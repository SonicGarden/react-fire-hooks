# react-fire-hooks

React hooks for Firebase

# Installation

## npm

```
npm install --save @sonicgarden/react-fire-hooks
```

## pnpm

```
pnpm add @sonicgarden/react-fire-hooks
```

# Hooks

## Authentication

- [useAuth](https://github.com/SonicGarden/react-fire-hooks/blob/main/src/auth/useAuth.ts)

## Firestore

- [useCollectionData](https://github.com/SonicGarden/react-fire-hooks/blob/main/src/firestore/useCollectionData.ts)
- [useDocumentData](https://github.com/SonicGarden/react-fire-hooks/blob/main/src/firestore/useDocumentData.ts)
- [usePaginatedCollectionData](https://github.com/SonicGarden/react-fire-hooks/blob/main/src/firestore/usePaginatedCollectionData.ts)
- [useQueriesEffect](https://github.com/SonicGarden/react-fire-hooks/blob/main/src/firestore/useQueriesEffect.ts)
- [useRefsEffect](https://github.com/SonicGarden/react-fire-hooks/blob/main/src/firestore/useRefsEffect.ts)

## Storage

- [useStorageUrl](https://github.com/SonicGarden/react-fire-hooks/blob/main/src/storage/useStorageUrl.ts)

## Utility

- [useCustomCompareEffect](https://github.com/SonicGarden/react-fire-hooks/blob/main/src/utils/useCustomCompareEffect.ts)
- [useDeepCompareEffect](https://github.com/SonicGarden/react-fire-hooks/blob/main/src/utils/useDeepCompareEffect.ts)

# Publish

```
git tag v1.0.0 && git push --tags
npm publish --access=public
```
