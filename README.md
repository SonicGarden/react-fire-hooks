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
- [useCollectionDataOnce](https://github.com/SonicGarden/react-fire-hooks/blob/main/src/firestore/useCollectionDataOnce.ts)
- [useDocumentData](https://github.com/SonicGarden/react-fire-hooks/blob/main/src/firestore/useDocumentData.ts)
- [useDocumentDataOnce](https://github.com/SonicGarden/react-fire-hooks/blob/main/src/firestore/useDocumentDataOnce.ts)
- [useDocumentsData](https://github.com/SonicGarden/react-fire-hooks/blob/main/src/firestore/useDocumentsData.ts)
- [useDocumentsDataOnce](https://github.com/SonicGarden/react-fire-hooks/blob/main/src/firestore/useDocumentsDataOnce.ts)
- [usePaginatedCollectionData](https://github.com/SonicGarden/react-fire-hooks/blob/main/src/firestore/usePaginatedCollectionData.ts)
- [usePaginatedCollectionDataOnce](https://github.com/SonicGarden/react-fire-hooks/blob/main/src/firestore/usePaginatedCollectionDataOnce.ts)
- [useQueriesEffect](https://github.com/SonicGarden/react-fire-hooks/blob/main/src/firestore/useQueriesEffect.ts)
- [useRefsEffect](https://github.com/SonicGarden/react-fire-hooks/blob/main/src/firestore/useRefsEffect.ts)

## Storage

- [useStorageUrl](https://github.com/SonicGarden/react-fire-hooks/blob/main/src/storage/useStorageUrl.ts)

## Utility

- [useAsync](https://github.com/SonicGarden/react-fire-hooks/blob/main/src/utils/useAsync.ts)
- [useCustomCompareEffect](https://github.com/SonicGarden/react-fire-hooks/blob/main/src/utils/useCustomCompareEffect.ts)
- [useDeepCompareEffect](https://github.com/SonicGarden/react-fire-hooks/blob/main/src/utils/useDeepCompareEffect.ts)

# Publish

```
git tag v1.0.0 && git push --tags
npm publish --access=public
```
