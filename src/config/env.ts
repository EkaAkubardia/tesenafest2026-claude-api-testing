import dotenv from 'dotenv';

dotenv.config({ quiet: true });

/**
 * Known environments. Todoist offers only production to API users today;
 * adding another environment is one entry here plus TEST_ENV=<name>.
 */
const environments = {
  prod: { baseUrl: 'https://api.todoist.com/api/v1/' },
} as const;

export type EnvName = keyof typeof environments;

function resolveEnvName(): EnvName {
  const name = process.env.TEST_ENV ?? 'prod';
  if (!(name in environments)) {
    const known = Object.keys(environments).join(', ');
    throw new Error(`Unknown TEST_ENV "${name}". Known environments: ${known}`);
  }
  return name as EnvName;
}

const envName = resolveEnvName();

export const env = {
  name: envName,
  baseUrl: environments[envName].baseUrl,
};

/**
 * Read lazily, so lint, typecheck and `playwright test --list` work without a token.
 * Never log the returned value.
 */
export function getToken(): string {
  const token = process.env.TODOIST_TOKEN;
  if (!token) {
    throw new Error(
      'TODOIST_TOKEN is not set. Copy .env.example to .env and fill it in, or set the GitHub Actions secret.',
    );
  }
  return token;
}
