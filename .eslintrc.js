module.exports = {
  "extends": "airbnb-base",
  "rules": {
    "new-cap": ["error", { "capIsNew": false }],
    "no-console": [2, { "allow": ["warn", "error"] }],
    "no-unused-expressions": ["error", { "allowShortCircuit": true }],
    "radix": ["error", "as-needed"],
    "linebreak-style": 0,
  },
};
