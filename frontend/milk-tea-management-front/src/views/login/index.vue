<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-left">
        <div class="illustration">
          <img src="/src/assets/icon/left.png" alt="Milk Tea" />
        </div>
        <div class="welcome-text">
          <h2>Welcome Back!</h2>
          <p>Milk Tea Management System</p>
        </div>
      </div>
      <div class="login-right">
        <div class="login-form">
          <div class="logo">
            <img src="/src/assets/icon/header.png" alt="" />
          </div>
          <el-form
            ref="loginFormRef"
            :model="loginForm"
            :rules="loginRules"
            class="login-form-content"
          >
            <el-form-item prop="username">
              <el-input v-model="loginForm.username" placeholder="Username" prefix-icon="User" />
            </el-form-item>
            <el-form-item prop="password">
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="Password"
                prefix-icon="Lock"
                show-password
              />
            </el-form-item>

            <el-form-item prop="captcha">
              <div class="captcha-container">
                <el-input
                  v-model="loginForm.captcha"
                  placeholder="Captcha"
                  prefix-icon="Key"
                  class="captcha-input"
                />
                <img
                  :src="captchaImage"
                  @click="refreshCaptcha"
                  class="captcha-img"
                  alt="Captcha"
                />
              </div>
            </el-form-item>
            <el-form-item>
              <el-button :loading="loading" type="primary" class="login-btn" @click="handleLogin"
                >LOG IN</el-button
              >
            </el-form-item>
            <div class="remember-me-container">
              <el-checkbox v-model="rememberMe">Remember Password</el-checkbox>
            </div>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getCaptcha } from '@/api/auth'
import { User, Lock, Key } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

const loginForm = reactive({
  username: '',
  password: '',
  captcha: '',
  key: '',
})

const loginRules = {
  username: [{ required: true, trigger: 'blur', message: 'Please enter username' }],
  password: [{ required: true, trigger: 'blur', message: 'Please enter password' }],
  captcha: [{ required: true, trigger: 'blur', message: 'Please enter captcha' }],
}

const loading = ref(false)
const captchaImage = ref('')
const loginFormRef = ref(null)
const rememberMe = ref(false)

const refreshCaptcha = () => {
  getCaptcha().then((res) => {
    if (res.code === 0 || res.code === 200) {
      loginForm.key = res.data.captchaId
      // captchaImage 字段已包含完整的 data URL
      captchaImage.value = res.data.captchaImage
    }
  })
}

const handleLogin = () => {
  loginFormRef.value.validate((valid) => {
    if (valid) {
      loading.value = true
      userStore
        .login(loginForm)
        .then(() => {
          if (rememberMe.value) {
            localStorage.setItem('remember_username', loginForm.username)
            localStorage.setItem('remember_password', window.btoa(loginForm.password))
            localStorage.setItem('remember_me', 'true')
          } else {
            localStorage.removeItem('remember_username')
            localStorage.removeItem('remember_password')
            localStorage.removeItem('remember_me')
          }
          router.push('/')
          loading.value = false
        })
        .catch(() => {
          loading.value = false
          refreshCaptcha()
        })
    } else {
      return false
    }
  })
}

onMounted(() => {
  refreshCaptcha()
  const isRemember = localStorage.getItem('remember_me')
  if (isRemember === 'true') {
    loginForm.username = localStorage.getItem('remember_username') || ''
    const savedPwd = localStorage.getItem('remember_password')
    loginForm.password = savedPwd ? window.atob(savedPwd) : ''
    rememberMe.value = true
  }
})
</script>

<style lang="scss" scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;

  background-image: url('/src/assets/icon/bc2.png');

  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.login-box {
  width: 900px;
  height: 550px;
  background-color: #fff;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  display: flex;
  overflow: hidden;
}

.login-left {
  width: 50%;
  background-color: #fceabb; // Warm yellow
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px;

  .illustration {
    width: 100%;
    max-width: 300px;
    margin-bottom: 20px;
    img {
      width: 100%;
      height: auto;
      border-radius: 10px;
      mix-blend-mode: multiply;
    }
  }

  .welcome-text {
    text-align: center;
    color: #5d4037;
    h2 {
      font-size: 28px;
      margin-bottom: 10px;
    }
    p {
      font-size: 16px;
    }
  }
}

.login-right {
  width: 50%;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;

  .login-form {
    width: 100%;
    max-width: 320px;
    margin: 0 auto;

    .logo {
      text-align: center;
      margin-bottom: 30px;
      h3 {
        font-size: 24px;
        color: #fbc02d; // Yellow text
        letter-spacing: 2px;
      }
    }

    .login-btn {
      width: 100%;
      background-color: #ffca28;
      border-color: #ffca28;
      color: #fff;
      font-weight: bold;
      height: 48px;
      font-size: 16px;
      border-radius: 4px;
      &:hover {
        background-color: #ffc107;
        border-color: #ffc107;
      }
    }

    .captcha-container {
      display: flex;
      align-items: center;
      width: 100%;

      .captcha-input {
        flex: 1;
        margin-right: 10px;
      }

      .captcha-img {
        height: 32px;
        cursor: pointer;
        border: 1px solid #dcdfe6;
        border-radius: 4px;
      }
    }

    .remember-me-container {
      margin-top: 10px;
      text-align: left;
    }

    .test-accounts {
      margin-top: 20px;
      text-align: center;
      font-size: 12px;
      color: #999;
    }
  }
}
</style>
