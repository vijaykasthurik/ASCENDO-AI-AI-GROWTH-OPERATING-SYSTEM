import { API_BASE } from '../config'

const TOKEN_KEY = 'ascendo_token'
const USER_KEY = 'ascendo_user'
const PROJECT_KEY = 'ascendo_project_id'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || ''
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY)
  return raw ? JSON.parse(raw) : null
}

export function setAuth(token, user) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem(PROJECT_KEY)
}

export function getProjectId() {
  return localStorage.getItem(PROJECT_KEY) || ''
}

export function setProjectId(id) {
  localStorage.setItem(PROJECT_KEY, id)
}

function extractErrorDetail(data, fallback) {
  const detail = data?.detail
  if (!detail) return fallback
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return detail
      .map((d) => (typeof d === 'string' ? d : d.msg || JSON.stringify(d)))
      .map((msg) => msg.replace(/^Value error,\s*/, ''))
      .join(' ')
  }
  return fallback
}

async function request(path, options = {}) {
  const token = getToken()
  const headers = { ...(options.headers || {}) }
  if (!(options.body instanceof FormData) && options.body) {
    headers['Content-Type'] = 'application/json'
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers })

  // Only treat a 401 as "your session expired" when a token was actually sent -
  // a 401 from /auth/login itself just means wrong credentials, not a stale session.
  if (response.status === 401 && token) {
    clearAuth()
    if (typeof window !== 'undefined') window.location.href = '/login'
    throw new Error('Session expired, please log in again')
  }

  if (!response.ok) {
    let detail = `Request failed (${response.status})`
    try {
      const data = await response.json()
      detail = extractErrorDetail(data, detail)
    } catch {
      // response had no JSON body
    }
    const err = new Error(detail)
    err.status = response.status
    throw err
  }

  if (response.status === 204) return null
  return response.json()
}

// --- Auth ---

export async function register({ email, password, full_name }) {
  const data = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, full_name }),
  })
  setAuth(data.access_token, data.user)
  return data
}

export async function login({ email, password }) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  setAuth(data.access_token, data.user)
  return data
}

export async function forgotPassword(email) {
  return request('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export async function verifyOtp(email, otp) {
  return request('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ email, otp }),
  })
}

export async function resetPassword(resetToken, newPassword) {
  return request('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ reset_token: resetToken, new_password: newPassword }),
  })
}

// --- Projects ---

export async function listProjects() {
  return request('/projects')
}

export async function getProject(projectId) {
  return request(`/projects/${projectId}`)
}

export async function deleteProject(projectId) {
  return request(`/projects/${projectId}`, { method: 'DELETE' })
}

export async function uploadOnboarding(formData) {
  return request('/upload', { method: 'POST', body: formData })
}

// --- Analysis pipeline ---

export async function startAnalysis(projectId) {
  return request(`/analyze/${projectId}`, { method: 'POST' })
}

// --- Dashboard / agents / report ---

export async function getDashboard(projectId) {
  return request(`/dashboard/${projectId}`)
}

export async function getAgents(projectId) {
  return request(`/agents/${projectId}`)
}

export async function getReport(projectId) {
  return request(`/report/${projectId}`)
}

// --- Copilot ---

export async function askCopilot(projectId, question) {
  return request(`/copilot/${projectId}`, {
    method: 'POST',
    body: JSON.stringify({ question }),
  })
}

// --- Engines ---

export const ENGINE_ROUTES = {
  strategy: 'strategy',
  marketing: 'marketing',
  leadgen: 'leadgen',
  sales: 'sales',
  analytics: 'analytics',
  customer_success: 'customer-success',
}

export async function getAllEngines(projectId) {
  return request(`/engines/${projectId}`)
}

export async function getEngine(name, projectId) {
  return request(`/${ENGINE_ROUTES[name]}/${projectId}`)
}

export async function generateEngine(name, projectId) {
  return request(`/${ENGINE_ROUTES[name]}/${projectId}/generate`, { method: 'POST' })
}

// --- Billing ---

export async function getBillingStatus() {
  return request('/billing/status')
}

export async function createCheckoutSession(plan) {
  return request('/billing/checkout-session', {
    method: 'POST',
    body: JSON.stringify({ plan }),
  })
}

export async function createPortalSession() {
  return request('/billing/portal-session', { method: 'POST' })
}
