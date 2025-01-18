# Mock File Structure Generator

A simple Node.js CLI that recursively scans a directory to gather all non-hidden files and generates a `mockFileStructure.ts` file.

## Features

- Recursively lists **non-hidden** files (ignores files/folders starting with `.`).
- Builds an array of objects with the structure:
  ```js
  {
    uri: 'file:///workspace/<relative-path>',
    uniquePath: '<relative-path>'
  }
  ```
- Outputs a `mockFileStructure.ts` file in the current working directory.
- Installs globally for easy CLI usage.

## Installation

   ```bash
   npm install -g .
   ```

## Usage

### CLI Usage

Once installed globally, you can run:

```bash
generateMockFileStructure target_folder
```

- **`/path/to/target`**: The directory you want to scan for files.

### Example 

```bash
generateMockStructure .
```

Outputs the current directory and all files in it's subdirectories.

A sample of `mockFileStructure.ts`:

```ts
export const mockFileStructure = [
  { uri: 'file:///workspace/index.ts', uniquePath: 'index.ts' },
  { uri: 'file:///workspace/src/app.ts', uniquePath: 'src/app.ts' },
  // ...
];
```

## License

This project is licensed under the [MIT License](LICENSE). Feel free to use, modify, and distribute as needed.
