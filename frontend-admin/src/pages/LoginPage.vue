<template>
  <div class="login">
    <div class="login__card">
      <div class="login__header">
        <span class="login__icon">❄️</span>
        <h1>Boris <strong>IceBox</strong></h1>
        <p>Administration</p>
      </div>

      <form @submit.prevent="handleLogin" class="login__form">
        <div class="login__field">
          <label>Email</label>
          <input v-model="email" type="email" placeholder="admin@borisicebox.com" required autocomplete="email" />
        </div>

        <div class="login__field">
          <label>Mot de passe</label>
          <input v-model="password" type="password" placeholder="••••••••" required autocomplete="current-password" />
        </div>

        <p v-if="error" class="login__error">{{ error }}</p>

        <button type="submit" :disabled="loading" class="login__btn">
          <span v-if="loading" class="login__spinner"></span>
          {{ loading ? 'Connexion...' : 'Se connecter' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  try {
    await auth.login(email.value, password.value)
    router.push(auth.defaultRoute || '/dashboard')
  } catch (err) {
    const msg = err.response?.data?.message
    if (msg) {
      error.value = msg
    } else {
      error.value = 'Email ou mot de passe incorrect'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
}

.login__card {
  background: #fff;
  border-radius: 24px;
  padding: 44px 36px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.3);
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

.login__header {
  text-align: center;
  margin-bottom: 36px;
}

.login__icon {
  font-size: 44px;
  display: block;
  margin-bottom: 8px;
}

.login__header h1 {
  font-size: 26px;
  font-weight: 700;
  color: #0f172a;
}

.login__header h1 strong {
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.login__header p {
  color: #94a3b8;
  font-size: 14px;
  margin-top: 4px;
}

.login__form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.login__field label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 6px;
}

.login__field input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 15px;
  transition: all 0.2s ease;
  background: #f8fafc;
  color: #0f172a;
}

.login__field input:focus {
  border-color: #3b82f6;
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  background: #fff;
}

.login__field input::placeholder {
  color: #cbd5e1;
}

.login__error {
  background: #fef2f2;
  color: #dc2626;
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  text-align: center;
}

.login__btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
}

.login__btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.45);
}

.login__btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.login__spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 480px) {
  .login__card {
    padding: 32px 20px;
    border-radius: 20px;
  }
}
</style>