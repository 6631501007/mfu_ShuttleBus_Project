<template>
  <div class="container" :class="{ 'right-panel-active': isSignUp }">
    
    <div class="form-container sign-up-container">
      <form @submit.prevent="handleSignUp">
        <h1>Create Account</h1>
        <input v-model="signupUsername" type="text" placeholder="Username" required />
        <input v-model="signupPassword" type="password" placeholder="Password" required />
        <input v-model="signupConfirmPassword" type="password" placeholder="Confirm Password" required />
        <button type="submit">SIGN UP</button>
      </form>
    </div>

    <div class="form-container sign-in-container">
      <form @submit.prevent="handleLogin">
        <h1>Sign in</h1>
        <input v-model="loginUsername" type="text" placeholder="Username" required />
        <input v-model="loginPassword" type="password" placeholder="Password" required />
        <a href="#">Forgot your password?</a>
        <button type="submit">SIGN IN</button>
      </form>
    </div>

    <div class="overlay-container">
      <div class="overlay">
        <div class="overlay-panel overlay-left">
          <h1>Welcome Back!</h1>
          <p>To keep connected with us please login</p>
          <button class="ghost" @click="isSignUp = false">SIGN IN</button>
        </div>
        <div class="overlay-panel overlay-right">
          <h1>Hello, Friend!</h1>
          <p>Enter your details and start journey</p>
          <button class="ghost" @click="isSignUp = true">SIGN UP</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isSignUp = ref(false)

const loginUsername = ref('')
const loginPassword = ref('')

const signupUsername = ref('')
const signupPassword = ref('')
const signupConfirmPassword = ref('')

const handleLogin = async () => {
  try {
    const res = await fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: loginUsername.value,
        password: loginPassword.value
      })
    })

    const data = await res.json()

    if (!res.ok) {
      alert(data.message)
      return
    }

    localStorage.setItem('token', data.token)
    localStorage.setItem('role', data.user.role)

    if (data.user.role === 'admin') {
      router.push('/dashboard')
    } else {
      router.push('/home')
    }

  } catch (err) {
    alert('Cannot connect to server')
    console.error(err)
  }
}

const handleSignUp = async () => {
  try {
    const res = await fetch('http://localhost:3000/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: signupUsername.value,
        password: signupPassword.value,
        confirmPassword: signupConfirmPassword.value
      })
    })

    const data = await res.json()

    if (!res.ok) {
      alert(data.message)
      return
    }

    alert('Register Success! Please Sign In')
    isSignUp.value = false

  } catch (err) {
    alert('Cannot connect to server')
    console.error(err)
  }
}
</script>

<style scoped>
* {
  box-sizing: border-box;
  font-family: 'Segoe UI', sans-serif;
}

.container {
  width: 100vw;
  height: 100vh;
  border-radius: 0;
  margin: 0;
}

body {
  margin: 0;
}

form {
  padding: 0 50px;   /* ไม่ต้อง padding บนล่างเยอะ */
}

/* FORM */
.form-container {
  position: absolute;
  top: 0;
  height: 100%;
  width: 50%;
  transition: all 0.6s ease-in-out;
}

.sign-in-container {
  left: 0;
  z-index: 2;
}

.sign-up-container {
  left: 0;
  opacity: 0;
  z-index: 1;
}

/* ACTIVE STATE */
.container.right-panel-active .sign-in-container {
  transform: translateX(100%);
}

.container.right-panel-active .sign-up-container {
  transform: translateX(100%);
  opacity: 1;
  z-index: 5;
}

/* FORM STYLE */
form {
  background: #fff;
  display: flex;
  flex-direction: column;
  padding: 50px;
  height: 100%;
  justify-content: center;
  align-items: center;
}

input {
  background: #eee;
  border: none;
  padding: 20px;
  margin: 10px 0;
  width: 60%;
  border-radius: 10px;
}

button {
  margin-top: 10px;
  padding: 12px 45px;
  border-radius: 20px;
  border: none;
  background: #ff4b2b;
  color: white;
  cursor: pointer;
}

button.ghost {
  background: transparent;
  border: 1px solid white;
}

/* OVERLAY */
.overlay-container {
  position: absolute;
  top: 0;
  left: 50%;
  width: 50%;
  height: 100%;
  overflow: hidden;
  transition: transform 0.6s ease-in-out;
}

.container.right-panel-active .overlay-container {
  transform: translateX(-100%);
}

.overlay {
  background: linear-gradient(to right, #ff4b2b, #ff416c);
  color: white;
  position: relative;
  left: -100%;
  width: 200%;
  height: 100%;
  display: flex;
  transition: transform 0.6s ease-in-out;
}

.container.right-panel-active .overlay {
  transform: translateX(50%);
}

/* PANELS */
.overlay-panel {
  width: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0 40px;
  text-align: center;
}

.overlay-left {
  transform: translateX(-20%);
}

.container.right-panel-active .overlay-left {
  transform: translateX(0);
}

.overlay-right {
  transform: translateX(0);
}

.container.right-panel-active .overlay-right {
  transform: translateX(20%);
}

a {
  text-decoration: none;
  color: inherit;        
}

</style>