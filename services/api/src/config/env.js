export function env(name, { defaultValue, required = false } = {}) {
  const v = process.env[name];
  if (v === undefined || v === "") {
    if (required) throw new Error(`Missing required env var: ${name}`);
    return defaultValue;
  }
  return v;
}

export function envBool(name, { defaultValue = false } = {}) {
  const v = process.env[name];
  if (v === undefined || v === "") return defaultValue;
  return ["1", "true", "yes", "on"].includes(String(v).toLowerCase());
}
