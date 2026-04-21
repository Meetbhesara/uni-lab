import React from 'react'
import { createRoot } from 'react-dom/client'
import { ChakraProvider } from "@chakra-ui/react"
import App from './App.jsx'
import theme from './theme'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { registerSW } from 'virtual:pwa-register'

// Register service worker
registerSW({ immediate: true })

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <AuthProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </AuthProvider>
    </ChakraProvider>
  </React.StrictMode>,
)
