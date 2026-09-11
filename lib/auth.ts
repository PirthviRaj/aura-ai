export type AuraSession = {
  email: string;
  name: string;
  company?: string;
  website?: string;
  role?: string;
  teamSize?: string;
  plan?: string;
  provider?: "email" | "google" | "github" | "microsoft";
};

export type SignUpInput = {
  email: string;
  password: string;
  confirmPassword?: string;
  firstName: string;
  lastName: string;
  role: string;
  provider?: AuraSession["provider"];
};

const SESSION_KEY = "aura-session";
const USERS_KEY = "aura-users";

type StoredUser = SignUpInput & {
  name: string;
};

function readUsers(): StoredUser[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) ?? "[]") as StoredUser[];
  } catch {
    return [];
  }
}

function writeUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getSession(): AuraSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AuraSession) : null;
  } catch {
    return null;
  }
}

export function setSession(session: AuraSession) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function signOut() {
  localStorage.removeItem(SESSION_KEY);
  if (typeof window !== "undefined") {
    void fetch("/api/db/auth/session", { method: "DELETE" }).catch(() => undefined);
  }
}

export function signInWithSocial(input: {
  provider: Exclude<NonNullable<AuraSession["provider"]>, "email">;
  email: string;
  name: string;
}) {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim() || email.split("@")[0] || "Aura User";
  if (!email || !email.includes("@")) {
    return { ok: false as const, error: "A valid email is required from the provider." };
  }

  const users = readUsers();
  const existing = users.find((user) => user.email === email);
  if (existing) {
    const updated = {
      ...existing,
      name,
      provider: input.provider,
    };
    writeUsers(users.map((user) => (user.email === email ? updated : user)));
    setSession(toSession(updated));
  } else {
    const [firstName, ...rest] = name.split(/\s+/);
    const record: StoredUser = {
      email,
      password: `oauth-${input.provider}-${Date.now()}`,
      firstName: firstName || "Aura",
      lastName: rest.join(" ") || "User",
      role: "Founder / Operator",
      name,
      provider: input.provider,
    };
    writeUsers([...users, record]);
    setSession(toSession(record));
  }

  if (typeof window !== "undefined") {
    void fetch("/api/db/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "oauth",
        provider: input.provider,
        email,
        name,
      }),
    }).catch(() => undefined);
  }

  return { ok: true as const };
}

function toSession(user: StoredUser): AuraSession {
  return {
    email: user.email,
    name: user.name,
    role: user.role,
    provider: user.provider ?? "email",
  };
}

export function signUp(input: SignUpInput) {
  const email = input.email.trim().toLowerCase();
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();

  if (!firstName || !lastName) {
    return { ok: false as const, error: "Enter your first and last name." };
  }
  if (!email || !email.includes("@")) {
    return { ok: false as const, error: "Enter a valid work email." };
  }
  if (input.password.length < 6) {
    return { ok: false as const, error: "Password must be at least 6 characters." };
  }
  if (input.confirmPassword !== undefined && input.password !== input.confirmPassword) {
    return { ok: false as const, error: "Passwords do not match." };
  }
  if (!input.role) {
    return { ok: false as const, error: "Choose your role." };
  }

  const users = readUsers();
  if (users.some((user) => user.email === email)) {
    return { ok: false as const, error: "This email already has an account. Log in instead." };
  }

  const name = `${firstName} ${lastName}`.trim();
  const record: StoredUser = {
    ...input,
    email,
    firstName,
    lastName,
    name,
    provider: input.provider ?? "email",
  };
  writeUsers([...users, record]);
  setSession(toSession(record));
  return { ok: true as const };
}

export function signIn(email: string, password: string) {
  const normalized = email.trim().toLowerCase();
  if (!normalized || !password) {
    return { ok: false as const, error: "Email and password are required." };
  }

  const users = readUsers();
  const match = users.find((user) => user.email === normalized);

  if (!match) {
    return {
      ok: false as const,
      error: "No account found for this email. Create one first.",
    };
  }
  if (match.password !== password) {
    return { ok: false as const, error: "Incorrect password." };
  }

  setSession(toSession(match));
  return { ok: true as const };
}
