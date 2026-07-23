// src/services/api.ts
// ─────────────────────────────────────────────────────────────
// Serviço central de conexão com o backend FastAPI
// ─────────────────────────────────────────────────────────────

const API_BASE = "https://tigers-celebrities-continuing-growing.trycloudflare.com";

// ─── Token JWT ───────────────────────────────────────────────

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("access_token");
}

function setToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("access_token", token);
}

function clearToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem("access_token");
}

// ─── Fetch base com autenticação ─────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    clearToken();
    if (path.includes("/auth/login")) {
      throw new Error("E-mail ou senha incorretos.");
    }
    if (typeof window !== "undefined" && window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
    throw new Error("Sessão expirada");
  }

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Erro desconhecido" }));
    throw new Error(error.detail || `Erro ${response.status}`);
  }

  if (response.status === 204) return {} as T;
  return response.json();
}

// ─── AUTH ────────────────────────────────────────────────────

export const auth = {
  async register(email: string, password: string, fullName: string) {
    const data = await apiFetch<{ access_token: string; user: any }>(
      "/api/v1/auth/register",
      {
        method: "POST",
        body: JSON.stringify({ email, password, full_name: fullName }),
      },
    );
    setToken(data.access_token);
    return data;
  },

  async login(email: string, password: string) {
    const data = await apiFetch<{ access_token: string }>(
      "/api/v1/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      },
    );
    setToken(data.access_token);
    return data;
  },

  logout() {
    clearToken();
    if (typeof window !== "undefined") window.location.href = "/login";
  },

  isAuthenticated() {
    return !!getToken();
  },
};

// ─── USER / PROFILE ──────────────────────────────────────────

export const user = {
  async getMe() {
    return apiFetch<{
      id: string;
      email: string;
      full_name: string;
      onboarding_done: boolean;
      telegram_notifications: boolean;
      has_telegram: boolean;
      search_time: string;
    }>("/api/v1/users/me");
  },

  async updateProfile(data: {
    full_name?: string;
    search_time?: string;
    telegram_bot_token?: string;
    telegram_chat_id?: string;
    telegram_notifications?: boolean;
    email_notifications?: boolean;
  }) {
    return apiFetch("/api/v1/users/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  async completeOnboarding() {
    return apiFetch("/api/v1/users/me/onboarding-complete", { method: "POST" });
  },

  async getVariations() {
    return apiFetch<
      Array<{ id: string; variation: string; is_active: boolean }>
    >("/api/v1/users/me/variations");
  },

  async addVariation(variation: string) {
    return apiFetch("/api/v1/users/me/variations", {
      method: "POST",
      body: JSON.stringify({ variation }),
    });
  },

  async deleteVariation(id: string) {
    return apiFetch(`/api/v1/users/me/variations/${id}`, { method: "DELETE" });
  },

  async regenerateVariations() {
    return apiFetch("/api/v1/users/me/variations/regenerate", {
      method: "POST",
    });
  },
};

// ─── COMPETITIONS ────────────────────────────────────────────

export type ApiCompetition = {
  id: string;
  organ_name: string;
  position: string;
  year: number;
  status: string;
  registration_number: string | null;
  organizing_body: string | null;
  edital_url: string | null;
  is_active: boolean;
};

export type CompetitionInput = {
  organ_name: string;
  position: string;
  year: number;
  status?: string;
  registration_number?: string;
  organizing_body?: string;
  edital_url?: string;
  notes?: string;
  is_active?: boolean;
};

export const competitions = {
  async list() {
    return apiFetch<ApiCompetition[]>("/api/v1/competitions");
  },

  async create(data: CompetitionInput) {
    return apiFetch<ApiCompetition>("/api/v1/competitions", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: Partial<CompetitionInput>) {
    return apiFetch<ApiCompetition>(`/api/v1/competitions/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  async delete(id: string) {
    return apiFetch(`/api/v1/competitions/${id}`, { method: "DELETE" });
  },
};

// ─── KEYWORDS ────────────────────────────────────────────────

export type ApiKeyword = {
  id: string;
  word: string;
  priority: "high" | "medium" | "low";
  category: "positive" | "negative" | "neutral";
  is_active: boolean;
  is_system_default: boolean;
};

export const keywords = {
  async list() {
    return apiFetch<ApiKeyword[]>("/api/v1/keywords");
  },

  async create(data: { word: string; priority?: string; category?: string }) {
    return apiFetch<ApiKeyword>("/api/v1/keywords", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async toggle(id: string) {
    return apiFetch<ApiKeyword>(`/api/v1/keywords/${id}/toggle`, {
      method: "PATCH",
    });
  },

  async delete(id: string) {
    return apiFetch(`/api/v1/keywords/${id}`, { method: "DELETE" });
  },
};

// ─── SEARCH ──────────────────────────────────────────────────

export type ApiHistoryRecord = {
  id: string;
  journal: string;
  edition_date: string;
  extraction_method: string;
  pages_searched: number;
  matches_found: number;
  duration_seconds: number;
  success: boolean;
  created_at: string;
};

export type ApiMatch = {
  id: string;
  journal: string;
  edition_date: string;
  page_number: number;
  variation_found: string;
  context_text: string;
  keywords_nearby: string[];
  relevance_score: number;
  ai_summary: string | null;
  is_reviewed?: boolean;
  created_at?: string;
  source_url?: string;
};

export const search = {
  async run(journals: string[] = ["DOU", "DOBA"], targetDate?: string) {
    return apiFetch<{ message: string; journals: string[]; date: string }>(
      "/api/v1/search/run",
      {
        method: "POST",
        body: JSON.stringify({ journals, target_date: targetDate || null }),
      },
    );
  },

  async getHistory(page = 1, limit = 20, journal?: string, onlyMatches = false) {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      only_matches: String(onlyMatches),
    });
    if (journal) params.set("journal", journal);
    return apiFetch<{
      page: number;
      limit: number;
      records: ApiHistoryRecord[];
    }>(`/api/v1/search/history?${params}`);
  },

  async getMatches() {
    return apiFetch<ApiMatch[]>("/api/v1/search/matches");
  },

  async getMatchDetail(id: string) {
    return apiFetch<ApiMatch>(`/api/v1/search/matches/${id}`);
  },

  async markReviewed(id: string) {
    return apiFetch(`/api/v1/search/matches/${id}/reviewed`, {
      method: "PATCH",
    });
  },
};

// ─── DASHBOARD ───────────────────────────────────────────────

export type ApiDashboardStats = {
  total_searches: number;
  total_matches: number;
  last_search: {
    journal: string;
    date: string;
    pages: number;
  } | null;
  next_search_time: string;
  recent_matches: Array<{
    id: string;
    journal: string;
    edition_date: string;
    page_number: number;
    variation_found: string;
    context_preview: string;
    keywords_nearby: string[];
  }>;
};

export const dashboard = {
  async getStats() {
    return apiFetch<ApiDashboardStats>("/api/v1/dashboard/stats");
  },
};

// ─── NOTIFICATIONS ───────────────────────────────────────────

export const notifications = {
  async testTelegram() {
    return apiFetch("/api/v1/notifications/telegram/test", { method: "POST" });
  },
};

// ─── HEALTH ──────────────────────────────────────────────────

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`);
    return res.ok;
  } catch {
    return false;
  }
}
