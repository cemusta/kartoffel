# Kartoffel UI Library

Monorepo with React component library + Storybook.

## Structure

```
kartoffel/
├── packages/
│   └── ui-library/          # React component library
│       ├── src/
│       │   ├── components/  # Components (Button, Card)
│       │   └── index.ts     # Barrel exports
│       └── .storybook/      # Storybook config
├── package.json             # Root workspace config
└── tsconfig.json            # Shared TypeScript config
```

## Setup

```bash
# Install dependencies
npm install

# Start Storybook (dev mode)
npm run storybook

# Build library
npm run build:lib

# Lint code
npm run lint

# Format code
npm run format
```

## Tech Stack

- **Node.js**: v24.14.1
- **TypeScript**: 5.7.2
- **React**: 18.x
- **Vite**: Build tool + dev server
- **Storybook**: Component documentation
- **CSS Modules**: Component styling
- **npm workspaces**: Monorepo management

## Components

### Button

Variants: primary, secondary, danger  
Sizes: small, medium, large

```tsx
import { Button } from '@kartoffel/ui-library';

<Button variant="primary" size="medium">
  Click me
</Button>;
```

### Card

Container with optional title + footer

```tsx
import { Card } from '@kartoffel/ui-library';

<Card title="Title" footer="Footer">
  Content
</Card>;
```

## Development

Storybook run on `http://localhost:6006` when start dev mode.

## Build Output

Library build to `packages/ui-library/dist/`:

- `index.js` - ESM bundle
- `index.cjs` - CommonJS bundle
- `index.d.ts` - TypeScript declarations
- `style.css` - Component styles

## Next Steps

- Add React app package that consume library
- Add testing (Vitest + React Testing Library)
- Add CI/CD pipeline
- Configure npm publishing
