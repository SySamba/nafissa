/**
 * Définissez EXPO_PUBLIC_API_URL dans un fichier `.env` à la racine de `mobile/`, par ex. :
 *   EXPO_PUBLIC_API_URL=http://192.168.1.xx:3001/api
 *
 * Émulateur Android vers le PC Windows : utilisez souvent :
 *   http://10.0.2.2:3001/api
 *
 * Sinon : adb reverse tcp:3001 tcp:3001 puis http://127.0.0.1:3001/api
 *
 * ⚠ Sans espace après http:// — une typo casse tout le réseau.
 */
module.exports = ({ config }) => {
  const fromEnv =
    typeof process.env.EXPO_PUBLIC_API_URL === 'string'
      ? process.env.EXPO_PUBLIC_API_URL.trim().replace(/\s+/g, '')
      : '';

  const apiBaseUrl = fromEnv || 'http://127.0.0.1:3001/api';

  return {
    ...config,
    name: 'Nafissa',
    slug: 'nafissa-mobile',
    extra: {
      ...config.extra,
      apiBaseUrl,
    },
  };
};
