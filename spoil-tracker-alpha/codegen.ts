import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "http://localhost:4000/graphql",
  documents: "src/**/*.{ts,tsx,graphql}",
  generates: {
    "src/gql/generated.tsx": { // <-- Ensure the file has `.ts` or `.tsx` extension
      plugins: [
        "typescript",
        "typescript-operations",
        "typescript-react-apollo",
      ],
    },
  },
};

export default config;
