import "server-only";

import { randomUUID } from "node:crypto";

import { createIntakeSession } from "../services/intake";
import type { IntakeCompletion, IntakeSession } from "../types/contracts";

export type StoredIntakeSession = {
  session: IntakeSession;
  completion?: IntakeCompletion;
  createdAt: string;
  updatedAt: string;
};

const globalForSessions = globalThis as typeof globalThis & {
  klikMpIntakeSessions?: Map<string, StoredIntakeSession>;
};

const sessions =
  globalForSessions.klikMpIntakeSessions ??
  new Map<string, StoredIntakeSession>();

globalForSessions.klikMpIntakeSessions = sessions;

export function createServerIntakeSession(): StoredIntakeSession {
  const now = new Date().toISOString();
  const session = createIntakeSession(randomUUID());
  const stored = { session, createdAt: now, updatedAt: now };
  sessions.set(session.sessionId, stored);
  return stored;
}

export function getServerIntakeSession(sessionId: string) {
  return sessions.get(sessionId);
}

export function requireServerIntakeSession(sessionId: string) {
  const stored = getServerIntakeSession(sessionId);
  if (!stored) throw new Error("INTAKE_SESSION_NOT_FOUND");
  return stored;
}

export function listServerIntakeSessions() {
  return [...sessions.values()].sort((left, right) =>
    right.updatedAt.localeCompare(left.updatedAt),
  );
}

export function saveServerIntakeSession(session: IntakeSession) {
  const current = requireServerIntakeSession(session.sessionId);
  const updated = {
    ...current,
    session,
    updatedAt: new Date().toISOString(),
  };
  sessions.set(session.sessionId, updated);
  return updated;
}

export function saveServerIntakeCompletion(completion: IntakeCompletion) {
  const updated = {
    ...saveServerIntakeSession(completion.session),
    completion,
  };
  sessions.set(completion.session.sessionId, updated);
  return updated;
}
