<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk'

// Registry address - update this after contract deployment
const REGISTRY_ADDRESS = ref('0xea3dea8b6390b119fc52d3c81b5d40a870594da21cdcc041dbb55e6c8968e886')
const TEST_MODE = ref(true) // Toggle between mainnet and testnet

// App state
const connected = ref(false)
const walletAddress = ref('')
const walletName = ref('')
const developerApps = ref([])
const developerAppIndices = ref([]) // Store app indices alongside apps
const allActiveApps = ref([])
const loading = ref(false)
const error = ref('')
const success = ref('')
const activeTab = ref('submit') // 'submit' | 'my-apps' | 'browse'
const showWalletModal = ref(false)
const submissionFeeOctas = ref(0) // Fee in octas
const submissionFeeMOVE = computed(() => (submissionFeeOctas.value / 100000000).toFixed(0)) // Convert to MOVE
const editingAppIndex = ref<number | null>(null) // Track which app is being edited
const hasPendingChange = ref<Record<number, boolean>>({}) // Track pending changes per app

// Auto-dismiss messages after 8 seconds
let messageTimeout: NodeJS.Timeout | null = null
function showMessage(type: 'error' | 'success', message: string) {
  // Clear existing timeout
  if (messageTimeout) {
    clearTimeout(messageTimeout)
  }

  // Set message
  if (type === 'error') {
    error.value = message
    success.value = ''
  } else {
    success.value = message
    error.value = ''
  }

  // Scroll to the alert message after it renders
  nextTick(() => {
    const alertElement = document.querySelector('.alert')
    if (alertElement) {
      alertElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  })

  // Auto-dismiss after 8 seconds
  messageTimeout = setTimeout(() => {
    error.value = ''
    success.value = ''
  }, 8000)
}

// Available wallets with their actual window object names
// Some wallets may be accessible via multiple keys (e.g., Petra via both 'aptos' and 'petra')
// For multi-chain wallets like Nightly, we need to access the chain-specific API (e.g., window.nightly.aptos)
const availableWallets = ref([
  {
    name: 'Nightly',
    icon: '/wallets/nightly_logo.png',
    windowKey: 'nightly',
    chainKey: 'aptos',
    available: false
  },
  {
    name: 'Razor',
    icon: '/wallets/razor.svg',
    windowKey: 'razor',
    available: false
  },
])

// Unsupported wallets to filter out (similar to staking site)
const unsupportedWallets = [
  'Dev T wallet',
  'Pontem Wallet',
  'Pontem',
  'TrustWallet',
  'TokenPocket',
  'Martian',
  'Rise',
  'Petra',
  'Aptos Connect',
  'Continue with Google',
  'Continue with Apple'
]

// Filter available wallets (remove unsupported ones)
const filteredWallets = computed(() => {
  return availableWallets.value.filter(wallet => {
    // Filter out unsupported wallets
    if (unsupportedWallets.includes(wallet.name)) {
      return false
    }
    // Filter out wallets with 'aptos connect' in name (case-insensitive)
    if (wallet.name.toLowerCase().includes('aptos connect')) {
      return false
    }
    return true
  })
})

// Form state
const appForm = ref({
  name: '',
  description: '',
  icon: '',
  url: '',
  slug: '',
  developerName: '',
  category: 'game',
  language: 'all',
  permissions: []
})

// Auto-generate slug from app name
watch(() => appForm.value.name, (newName) => {
  // Only auto-generate if slug is empty or matches the previous auto-generated value
  if (!appForm.value.slug || appForm.value.slug === generateSlug(appForm.value.name)) {
    appForm.value.slug = generateSlug(newName)
  }
})

// Generate URL-friendly slug
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
}

// Validate slug format
function isValidSlug(slug: string): boolean {
  // Must be lowercase letters, numbers, and hyphens only
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)
}

// Validate icon URL: must start with https:// and end with .png or .jpg
function isValidIconUrl(url: string): boolean {
  return /^https:\/\/.+\.(png|jpg)$/i.test(url || '')
}

const categories = ['game', 'defi', 'social', 'utility', 'nft']

// ISO 639-1 language codes with display names (sorted alphabetically after "All")
const languages = [
  { code: 'all', name: 'All Languages (Universal)' },
  { code: 'af', name: 'Afrikaans' },
  { code: 'am', name: 'Amharic (አማርኛ)' },
  { code: 'ar', name: 'Arabic (العربية)' },
  { code: 'az', name: 'Azerbaijani (Azərbaycan)' },
  { code: 'be', name: 'Belarusian (Беларуская)' },
  { code: 'bg', name: 'Bulgarian (Български)' },
  { code: 'bn', name: 'Bengali (বাংলা)' },
  { code: 'bs', name: 'Bosnian (Bosanski)' },
  { code: 'ca', name: 'Catalan (Català)' },
  { code: 'cs', name: 'Czech (Čeština)' },
  { code: 'cy', name: 'Welsh (Cymraeg)' },
  { code: 'da', name: 'Danish (Dansk)' },
  { code: 'de', name: 'German (Deutsch)' },
  { code: 'el', name: 'Greek (Ελληνικά)' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish (Español)' },
  { code: 'et', name: 'Estonian (Eesti)' },
  { code: 'eu', name: 'Basque (Euskara)' },
  { code: 'fa', name: 'Persian (فارسی)' },
  { code: 'fi', name: 'Finnish (Suomi)' },
  { code: 'fil', name: 'Filipino (Tagalog)' },
  { code: 'fr', name: 'French (Français)' },
  { code: 'ga', name: 'Irish (Gaeilge)' },
  { code: 'gl', name: 'Galician (Galego)' },
  { code: 'gu', name: 'Gujarati (ગુજરાતી)' },
  { code: 'he', name: 'Hebrew (עברית)' },
  { code: 'hi', name: 'Hindi (हिन्दी)' },
  { code: 'hr', name: 'Croatian (Hrvatski)' },
  { code: 'hu', name: 'Hungarian (Magyar)' },
  { code: 'hy', name: 'Armenian' },
  { code: 'id', name: 'Indonesian (Bahasa Indonesia)' },
  { code: 'is', name: 'Icelandic (Íslenska)' },
  { code: 'it', name: 'Italian (Italiano)' },
  { code: 'ja', name: 'Japanese (日本語)' },
  { code: 'ka', name: 'Georgian (ქართული)' },
  { code: 'kk', name: 'Kazakh (Қазақша)' },
  { code: 'km', name: 'Khmer (ភាសាខ្មែរ)' },
  { code: 'kn', name: 'Kannada (ಕನ್ನಡ)' },
  { code: 'ko', name: 'Korean (한국어)' },
  { code: 'ky', name: 'Kyrgyz (Кыргызча)' },
  { code: 'lo', name: 'Lao (ລາວ)' },
  { code: 'lt', name: 'Lithuanian (Lietuvių)' },
  { code: 'lv', name: 'Latvian (Latviešu)' },
  { code: 'mk', name: 'Macedonian (Македонски)' },
  { code: 'ml', name: 'Malayalam (മലയാളം)' },
  { code: 'mn', name: 'Mongolian (Монгол)' },
  { code: 'mr', name: 'Marathi (मराठी)' },
  { code: 'ms', name: 'Malay (Bahasa Melayu)' },
  { code: 'my', name: 'Burmese (မြန်မာ)' },
  { code: 'ne', name: 'Nepali (नेपाली)' },
  { code: 'nl', name: 'Dutch (Nederlands)' },
  { code: 'no', name: 'Norwegian (Norsk)' },
  { code: 'pa', name: 'Punjabi (ਪੰਜਾਬੀ)' },
  { code: 'pl', name: 'Polish (Polski)' },
  { code: 'ps', name: 'Pashto (پښتو)' },
  { code: 'pt', name: 'Portuguese (Português)' },
  { code: 'ro', name: 'Romanian (Română)' },
  { code: 'ru', name: 'Russian (Русский)' },
  { code: 'si', name: 'Sinhala (සිංහල)' },
  { code: 'sk', name: 'Slovak (Slovenčina)' },
  { code: 'sl', name: 'Slovenian (Slovenščina)' },
  { code: 'so', name: 'Somali (Soomaali)' },
  { code: 'sq', name: 'Albanian (Shqip)' },
  { code: 'sr', name: 'Serbian (Српски)' },
  { code: 'sv', name: 'Swedish (Svenska)' },
  { code: 'sw', name: 'Swahili (Kiswahili)' },
  { code: 'ta', name: 'Tamil (தமிழ்)' },
  { code: 'te', name: 'Telugu (తెలుగు)' },
  { code: 'th', name: 'Thai (ไทย)' },
  { code: 'tr', name: 'Turkish (Türkçe)' },
  { code: 'uk', name: 'Ukrainian (Українська)' },
  { code: 'ur', name: 'Urdu (اردو)' },
  { code: 'uz', name: 'Uzbek (Oʻzbek)' },
  { code: 'vi', name: 'Vietnamese (Tiếng Việt)' },
  { code: 'zh', name: 'Chinese (中文)' },
  { code: 'zu', name: 'Zulu (isiZulu)' },
]

const availablePermissions = [
  'wallet.read',
  'wallet.sign',
  'storage.read',
  'storage.write',
  'camera',
  'location',
  'notify'
]

// Initialize Aptos client for Movement Network
const aptosClient = computed(() => {
  if (TEST_MODE.value) {
    // Movement Testnet (chain ID 250)
    return new Aptos(new AptosConfig({
      network: Network.CUSTOM,
      fullnode: 'https://testnet.movementnetwork.xyz/v1',
      chainId: 250
    }))
  } else {
    // Movement Mainnet (chain ID 126)
    return new Aptos(new AptosConfig({
      network: Network.CUSTOM,
      fullnode: 'https://mainnet.movementnetwork.xyz/v1',
      chainId: 126
    }))
  }
})

// Check available wallets
function checkWallets() {
  if (typeof window === 'undefined') return

  console.log('[AppPublisher] Checking wallets...')

  availableWallets.value = availableWallets.value.map(wallet => {
    let hasWallet = false

    // Check primary key
    const windowObj = (window as any)[wallet.windowKey]
    if (windowObj) {
      // If wallet has a chainKey (e.g., nightly.aptos), check if that chain API exists
      if (wallet.chainKey) {
        hasWallet = !!(windowObj[wallet.chainKey])
        console.log(`[AppPublisher] ${wallet.name}: window.${wallet.windowKey}.${wallet.chainKey} = ${hasWallet}`)
      } else {
        hasWallet = true
        console.log(`[AppPublisher] ${wallet.name}: window.${wallet.windowKey} = ${hasWallet}`)
      }
    } else {
      console.log(`[AppPublisher] ${wallet.name}: window.${wallet.windowKey} not found`)
    }

    // Check fallback key if primary not found
    if (!hasWallet && wallet.fallbackKey) {
      hasWallet = !!(window as any)[wallet.fallbackKey]
      console.log(`[AppPublisher] ${wallet.name}: fallback window.${wallet.fallbackKey} = ${hasWallet}`)
    }

    return {
      ...wallet,
      available: hasWallet
    }
  })

  console.log('[AppPublisher] Wallet check complete:', availableWallets.value.map(w => ({ name: w.name, available: w.available })))
}

// Check wallets with retry mechanism (wallet extensions inject asynchronously)
async function checkWalletsWithRetry() {
  // First immediate check
  checkWallets()

  // Retry up to 5 times with increasing delays
  const delays = [100, 200, 500, 1000, 2000]

  for (const delay of delays) {
    // Wait before next check
    await new Promise(resolve => setTimeout(resolve, delay))

    // Check again
    const previousState = availableWallets.value.map(w => w.available)
    checkWallets()
    const currentState = availableWallets.value.map(w => w.available)

    // If we found all wallets or state hasn't changed, stop retrying
    const allFound = currentState.every(available => available === true)
    const stateChanged = JSON.stringify(previousState) !== JSON.stringify(currentState)

    if (allFound || !stateChanged) {
      break
    }
  }
}

// Open wallet modal and check wallets
function openWalletModal() {
  showWalletModal.value = true
  // Check wallets again when modal opens to catch any late-loading extensions
  checkWalletsWithRetry()
}

// Connect Wallet
async function connectWallet(walletNameParam: string) {
  try {
    loading.value = true
    error.value = ''

    // Find wallet config by name
    const walletConfig = availableWallets.value.find(w => w.name === walletNameParam)
    if (!walletConfig) {
      throw new Error(`Wallet ${walletNameParam} not found`)
    }

    // Get wallet object - handle multi-chain wallets (e.g., nightly.aptos)
    let walletObj = (window as any)[walletConfig.windowKey]

    // If this is a multi-chain wallet, get the chain-specific API
    if (walletObj && walletConfig.chainKey) {
      walletObj = walletObj[walletConfig.chainKey]
    }

    // Try fallback key if primary not found
    if (!walletObj && walletConfig.fallbackKey) {
      walletObj = (window as any)[walletConfig.fallbackKey]
    }

    if (!walletObj) {
      throw new Error(`${walletNameParam} wallet is not installed`)
    }

    console.log('[AppPublisher] Wallet object found:', walletConfig.windowKey + (walletConfig.chainKey ? `.${walletConfig.chainKey}` : ''), walletObj)
    console.log('[AppPublisher] Available methods:', Object.keys(walletObj))

    // Different wallets have different APIs
    let accountInfo: any = null

    // Try Aptos Wallet Standard (most common)
    if (typeof walletObj.connect === 'function') {
      console.log('[AppPublisher] Calling connect()')
      const connectResult = await walletObj.connect()
      console.log('[AppPublisher] Connect result:', connectResult)

      // Some wallets return account info from connect, others don't
      if (connectResult && connectResult.address) {
        accountInfo = connectResult
      }
    }

    // If we don't have account info yet, try calling account()
    if (!accountInfo && typeof walletObj.account === 'function') {
      console.log('[AppPublisher] Calling account()')
      accountInfo = await walletObj.account()
      console.log('[AppPublisher] Account result:', accountInfo)
    }

    // Fallback: check if wallet has address property directly
    if (!accountInfo && walletObj.address) {
      accountInfo = { address: walletObj.address }
    }

    if (!accountInfo || !accountInfo.address) {
      throw new Error(`Could not get account from ${walletNameParam} wallet`)
    }

    walletAddress.value = accountInfo.address
    walletName.value = walletNameParam
    connected.value = true
    showWalletModal.value = false
    showMessage('success', 'Wallet connected successfully!')

    // Load developer's apps
    await loadDeveloperApps()
  } catch (err: any) {
    showMessage('error', err.message || 'Failed to connect wallet')
    console.error('Wallet connection error:', err)
  } finally {
    loading.value = false
  }
}

// Disconnect Wallet
async function disconnectWallet() {
  try {
    // Find wallet config by name
    const walletConfig = availableWallets.value.find(w => w.name === walletName.value)
    if (walletConfig) {
      // Get wallet object - handle multi-chain wallets
      let walletObj = (window as any)[walletConfig.windowKey]

      // If this is a multi-chain wallet, get the chain-specific API
      if (walletObj && walletConfig.chainKey) {
        walletObj = walletObj[walletConfig.chainKey]
      }

      // Try fallback key if primary not found
      if (!walletObj && walletConfig.fallbackKey) {
        walletObj = (window as any)[walletConfig.fallbackKey]
      }

      if (walletObj && walletObj.disconnect) {
        await walletObj.disconnect()
      }
    }

    connected.value = false
    walletAddress.value = ''
    walletName.value = ''
    developerApps.value = []
    showMessage('success', 'Wallet disconnected')
  } catch (err: any) {
    showMessage('error', err.message || 'Failed to disconnect wallet')
  }
}

// Load developer's apps
async function loadDeveloperApps() {
  try {
    loading.value = true
    error.value = ''

    const result = await aptosClient.value.view({
      payload: {
        function: `${REGISTRY_ADDRESS.value}::app_registry::get_developer_apps`,
        functionArguments: [walletAddress.value],
      },
    })

    developerAppIndices.value = result[0] || []
    developerApps.value = result[1] || []

    // Check for pending changes for each app
    for (let i = 0; i < developerAppIndices.value.length; i++) {
      const appIndex = developerAppIndices.value[i]
      try {
        const hasPending = await aptosClient.value.view({
          payload: {
            function: `${REGISTRY_ADDRESS.value}::app_registry::has_pending_change`,
            functionArguments: [appIndex],
          },
        })
        hasPendingChange.value[appIndex] = hasPending[0] || false
      } catch {
        hasPendingChange.value[appIndex] = false
      }
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to load your apps'
    console.error('Load developer apps error:', err)
  } finally {
    loading.value = false
  }
}

// Load all active apps
async function loadAllActiveApps() {
  try {
    loading.value = true
    error.value = ''

    const apps = await aptosClient.value.view({
      payload: {
        function: `${REGISTRY_ADDRESS.value}::app_registry::get_all_active_apps`,
        functionArguments: [],
      },
    })

    console.log('Raw active apps response:', apps)
    console.log('Active apps array:', apps[0])

    allActiveApps.value = apps[0] || []
  } catch (err: any) {
    error.value = err.message || 'Failed to load active apps'
    console.error('Load active apps error:', err)
  } finally {
    loading.value = false
  }
}

// Edit app - populate form with existing app data
function editApp(appIndex: number, app: any) {
  editingAppIndex.value = appIndex
  appForm.value = {
    name: app.name || '',
    description: app.description || '',
    icon: app.icon || '',
    url: app.url || '',
    slug: app.slug || '', // Slug cannot be changed
    developerName: app.developer_name || '',
    category: app.category || 'game',
    language: app.language || 'all',
    permissions: app.permissions || []
  }
  activeTab.value = 'submit'
  showMessage('success', 'App data loaded. Make your changes and submit to request an update.')
}

// Cancel editing
function cancelEdit() {
  editingAppIndex.value = null
  appForm.value = {
    name: '',
    description: '',
    icon: '',
    url: '',
    slug: '',
    developerName: '',
    category: 'game',
    language: 'all',
    permissions: []
  }
}

// Submit app or request update
async function submitApp() {
  try {
    loading.value = true
    error.value = ''
    success.value = ''

    // Find wallet config by name
    const walletConfig = availableWallets.value.find(w => w.name === walletName.value)
    if (!walletConfig) {
      throw new Error('Wallet not found')
    }

    // Get wallet object - handle multi-chain wallets
    let walletObj = (window as any)[walletConfig.windowKey]

    // If this is a multi-chain wallet, get the chain-specific API
    if (walletObj && walletConfig.chainKey) {
      walletObj = walletObj[walletConfig.chainKey]
    }

    // Try fallback key if primary not found
    if (!walletObj && walletConfig.fallbackKey) {
      walletObj = (window as any)[walletConfig.fallbackKey]
    }

    if (!walletObj) {
      throw new Error('Wallet not available')
    }

    // Validate icon URL
    if (!isValidIconUrl(appForm.value.icon)) {
      throw new Error('Invalid icon URL. It must start with "https://" and end with ".png" or ".jpg".')
    }

    // If editing, use request_update instead of submit_app
    if (editingAppIndex.value !== null) {
      return await requestUpdateApp(editingAppIndex.value)
    }

    // Validate slug format (only for new submissions)
    if (!isValidSlug(appForm.value.slug)) {
      throw new Error('Invalid slug format. Use only lowercase letters, numbers, and hyphens.')
    }

    // Check slug uniqueness by fetching all app indices and checking each app
    try {
      const allIdsResult = await aptosClient.value.view({
        payload: {
          function: `${REGISTRY_ADDRESS.value}::app_registry::get_all_app_indices`,
          functionArguments: [],
        },
      })

      const allAppIds = allIdsResult[0] as number[] || []

      // Check each app's slug
      for (const appId of allAppIds) {
        try {
          const appResult = await aptosClient.value.view({
            payload: {
              function: `${REGISTRY_ADDRESS.value}::app_registry::get_app`,
              functionArguments: [appId],
            },
          })

          const existingApp = appResult[0] as any
          if (existingApp && existingApp.slug === appForm.value.slug) {
            throw new Error(`The slug "${appForm.value.slug}" is already taken. Please choose a different one.`)
          }
        } catch (err: any) {
          // Ignore errors fetching individual apps, continue checking
          if (err.message.includes('already taken')) {
            throw err // Re-throw if it's our uniqueness error
          }
        }
      }
    } catch (err: any) {
      if (err.message.includes('already taken')) {
        throw err // Re-throw uniqueness errors
      }
      // If there's an error fetching apps, log it but don't block submission
      console.warn('Could not verify slug uniqueness:', err)
    }

    // Get submission fee
    const feeResult = await aptosClient.value.view({
      payload: {
        function: `${REGISTRY_ADDRESS.value}::app_registry::get_submit_fee`,
        functionArguments: [],
      },
    })
    const submissionFee = Number(feeResult[0])
    console.log('Submission fee:', submissionFee, 'octas')

    let transaction
    try {
      transaction = await aptosClient.value.transaction.build.simple({
        sender: walletAddress.value,
        data: {
          function: `${REGISTRY_ADDRESS.value}::app_registry::submit_app`,
          functionArguments: [
            appForm.value.name,
            appForm.value.description,
            appForm.value.icon,
            appForm.value.url,
            appForm.value.slug,
            appForm.value.developerName,
            appForm.value.category,
            appForm.value.language,
            appForm.value.permissions
          ],
        },
      })
    } catch (buildErr: any) {
      throw new Error(`Failed to build transaction: ${buildErr?.message || buildErr || 'Unknown error'}`)
    }

    let response
    try {
      response = await walletObj.signAndSubmitTransaction(transaction)
      if (!response || !response.hash) {
        throw new Error('Transaction was not submitted. No hash returned from wallet.')
      }
    } catch (submitErr: any) {
      // Check if user rejected
      if (submitErr?.message?.includes('reject') || submitErr?.code === 4001) {
        throw new Error('Transaction was cancelled by user')
      }
      throw new Error(`Transaction submission failed: ${submitErr?.message || submitErr || 'Unknown error'}`)
    }

    try {
      await aptosClient.value.waitForTransaction({ transactionHash: response.hash })
    } catch (waitErr: any) {
      // Transaction might have been submitted but failed on-chain
      throw new Error(`Transaction failed on-chain: ${waitErr?.message || waitErr || 'Unknown error'}`)
    }

    showMessage('success', 'App submitted successfully! It will be reviewed by the team.')

    // Reset form
    cancelEdit()

    // Reload developer apps
    await loadDeveloperApps()
  } catch (err: any) {
    // Safely extract error message
    let errorMessage = 'Failed to submit app'
    
    try {
      // Handle different error formats
      if (typeof err === 'string') {
        errorMessage = err
      } else if (err?.message) {
        errorMessage = err.message
      } else if (err?.error?.message) {
        errorMessage = err.error.message
      } else if (err?.error && typeof err.error === 'string') {
        errorMessage = err.error
      } else if (err?.toString) {
        errorMessage = err.toString()
      }
      
      // Try to parse if it's a JSON string
      if (errorMessage.startsWith('{') || errorMessage.startsWith('[')) {
        try {
          const parsed = JSON.parse(errorMessage)
          errorMessage = parsed.message || parsed.error || errorMessage
        } catch {
          // Not valid JSON, use as-is
        }
      }
    } catch (parseErr) {
      // If error extraction fails, use default message
      console.error('Error parsing error message:', parseErr)
    }

    // Check for specific contract errors
    if (errorMessage.includes('E_APP_ALREADY_EXISTS')) {
      errorMessage = 'You already have an app in the registry. Each wallet can only have ONE app. To change your app details (URL, name, etc.), you need to use "Update App" instead of submitting a new one. Check the "My Apps" tab to see your current app.'
    } else if (errorMessage.includes('E_RATE_LIMIT_EXCEEDED')) {
      errorMessage = 'Rate limit exceeded. You can only submit 2 apps per 24 hours.'
    } else if (errorMessage.includes('E_INVALID_STATUS')) {
      errorMessage = 'Your app has an invalid status for this operation.'
    } else if (errorMessage.includes('not valid JSON') || errorMessage.includes('Unexpected token')) {
      errorMessage = 'Transaction failed. Please check your network connection and try again. If the problem persists, the transaction may have been rejected by the network.'
    }

    showMessage('error', errorMessage)
    console.error('Submit app error:', err)
  } finally {
    loading.value = false
  }
}

// Request update for existing app
async function requestUpdateApp(appIndex: number) {
  try {
    loading.value = true
    error.value = ''
    success.value = ''

    // Find wallet config by name
    const walletConfig = availableWallets.value.find(w => w.name === walletName.value)
    if (!walletConfig) {
      throw new Error('Wallet not found')
    }

    // Get wallet object - handle multi-chain wallets
    let walletObj = (window as any)[walletConfig.windowKey]

    // If this is a multi-chain wallet, get the chain-specific API
    if (walletObj && walletConfig.chainKey) {
      walletObj = walletObj[walletConfig.chainKey]
    }

    // Try fallback key if primary not found
    if (!walletObj && walletConfig.fallbackKey) {
      walletObj = (window as any)[walletConfig.fallbackKey]
    }

    if (!walletObj) {
      throw new Error('Wallet not available')
    }

    // Validate icon URL
    if (!isValidIconUrl(appForm.value.icon)) {
      throw new Error('Invalid icon URL. It must start with "https://" and end with ".png" or ".jpg".')
    }

    let transaction
    try {
      transaction = await aptosClient.value.transaction.build.simple({
        sender: walletAddress.value,
        data: {
          function: `${REGISTRY_ADDRESS.value}::app_registry::request_update`,
          functionArguments: [
            appIndex,
            appForm.value.name,
            appForm.value.description,
            appForm.value.icon,
            appForm.value.url,
            appForm.value.category,
            appForm.value.language,
            appForm.value.permissions
          ],
        },
      })
    } catch (buildErr: any) {
      throw new Error(`Failed to build transaction: ${buildErr?.message || buildErr || 'Unknown error'}`)
    }

    let response
    try {
      response = await walletObj.signAndSubmitTransaction(transaction)
      if (!response || !response.hash) {
        throw new Error('Transaction was not submitted. No hash returned from wallet.')
      }
    } catch (submitErr: any) {
      // Check if user rejected
      if (submitErr?.message?.includes('reject') || submitErr?.code === 4001) {
        throw new Error('Transaction was cancelled by user')
      }
      throw new Error(`Transaction submission failed: ${submitErr?.message || submitErr || 'Unknown error'}`)
    }

    try {
      await aptosClient.value.waitForTransaction({ transactionHash: response.hash })
    } catch (waitErr: any) {
      // Transaction might have been submitted but failed on-chain
      throw new Error(`Transaction failed on-chain: ${waitErr?.message || waitErr || 'Unknown error'}`)
    }

    showMessage('success', 'Update requested successfully! Your app status has been changed to PENDING and will be reviewed by the team.')

    // Reset form
    cancelEdit()

    // Reload developer apps
    await loadDeveloperApps()
  } catch (err: any) {
    // Safely extract error message
    let errorMessage = 'Failed to request update'
    
    try {
      // Handle different error formats
      if (typeof err === 'string') {
        errorMessage = err
      } else if (err?.message) {
        errorMessage = err.message
      } else if (err?.error?.message) {
        errorMessage = err.error.message
      } else if (err?.error && typeof err.error === 'string') {
        errorMessage = err.error
      } else if (err?.toString) {
        errorMessage = err.toString()
      }
      
      // Try to parse if it's a JSON string
      if (errorMessage.startsWith('{') || errorMessage.startsWith('[')) {
        try {
          const parsed = JSON.parse(errorMessage)
          errorMessage = parsed.message || parsed.error || errorMessage
        } catch {
          // Not valid JSON, use as-is
        }
      }
    } catch (parseErr) {
      // If error extraction fails, use default message
      console.error('Error parsing error message:', parseErr)
    }

    // Check for specific contract errors
    if (errorMessage.includes('E_PENDING_CHANGES')) {
      errorMessage = 'You already have a pending update for this app. Please wait for admin approval before requesting another update.'
    } else if (errorMessage.includes('E_NOT_APP_OWNER')) {
      errorMessage = 'You are not the owner of this app.'
    } else if (errorMessage.includes('E_APP_NOT_FOUND')) {
      errorMessage = 'App not found.'
    }

    showMessage('error', errorMessage)
    console.error('Request update error:', err)
  } finally {
    loading.value = false
  }
}

// Get status text
function getStatusText(status: number) {
  const statusMap: Record<number, string> = {
    0: 'Pending',
    1: 'Approved',
    2: 'Rejected'
  }
  return statusMap[status] || 'Unknown'
}

// Format date
function formatDate(timestamp: string | number) {
  if (!timestamp || timestamp === '0') return 'N/A'
  return new Date(Number(timestamp) * 1000).toLocaleDateString()
}

function handleImageError(event: Event) {
  const target = event.target as HTMLImageElement
  if (target && target.parentElement) {
    // Replace the broken image with a fallback emoji
    target.style.display = 'none'
    const fallback = document.createElement('span')
    fallback.textContent = '📱'
    target.parentElement.appendChild(fallback)
  }
}

// On mount
// Load submission fee
async function loadSubmissionFee() {
  try {
    const feeResult = await aptosClient.value.view({
      payload: {
        function: `${REGISTRY_ADDRESS.value}::app_registry::get_submit_fee`,
        functionArguments: [],
      },
    })
    submissionFeeOctas.value = Number(feeResult[0])
  } catch (err: any) {
    console.error('Error loading submission fee:', err)
    // Default to 10 MOVE if we can't fetch
    submissionFeeOctas.value = 1000000000
  }
}

onMounted(() => {
  checkWalletsWithRetry()
  loadSubmissionFee()

  // Listen for wallet injection events
  if (typeof window !== 'undefined') {
    // Nightly wallet ready event
    window.addEventListener('nightly#initialized', () => {
      console.log('[AppPublisher] Nightly wallet initialized event')
      checkWallets()
    })

    // Razor wallet ready event
    window.addEventListener('razor#initialized', () => {
      console.log('[AppPublisher] Razor wallet initialized event')
      checkWallets()
    })

    // Generic window load event as backup
    window.addEventListener('load', () => {
      console.log('[AppPublisher] Window load event')
      setTimeout(() => checkWallets(), 100)
    })

    // Document ready state change
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        console.log('[AppPublisher] DOMContentLoaded event')
        setTimeout(() => checkWallets(), 100)
      })
    }
  }
})
</script>

<template>
<div class="publisher-container">
  <!-- Hero Header -->
  <div class="hero-header">
    <div class="hero-content">
      <h1 class="hero-title">App Publisher Dashboard</h1>
      <p class="hero-subtitle">Submit and manage your mini apps for the Movement ecosystem</p>
    </div>
  </div>

  <!-- Wallet Connection Card -->
  <div class="wallet-card">
    <div class="wallet-card-content">
      <div class="wallet-info">
        <div class="wallet-icon-wrapper">
          <span class="wallet-icon-emoji">{{ connected ? '✓' : '👋' }}</span>
        </div>
        <div class="wallet-details">
          <h3 class="wallet-title">{{ connected ? 'Wallet Connected' : 'Connect Your Wallet' }}</h3>
          <p class="wallet-description" v-if="!connected">
            Connect your wallet to get started
          </p>
          <div v-else class="wallet-address-display">
            <span class="wallet-badge">{{ walletName }}</span>
            <code class="wallet-address-mono">{{ walletAddress.slice(0, 6) }}...{{ walletAddress.slice(-4) }}</code>
          </div>
        </div>
      </div>
      <button v-if="!connected" @click="openWalletModal" :disabled="loading" class="btn-primary">
        <span v-if="!loading">Connect Wallet</span>
        <span v-else>Connecting...</span>
      </button>
      <button v-else @click="disconnectWallet" class="btn-secondary">
        Disconnect
      </button>
    </div>
  </div>

  <!-- Wallet Selection Modal -->
  <div v-if="showWalletModal" class="modal-overlay" @click="showWalletModal = false">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>Connect Wallet</h3>
        <button @click="showWalletModal = false" class="close-btn">×</button>
      </div>
      <div class="wallet-list">
        <button
          v-for="wallet in filteredWallets"
          :key="wallet.name"
          @click="connectWallet(wallet.name)"
          :disabled="!wallet.available"
          class="wallet-option"
          :class="{ 'wallet-disabled': !wallet.available }"
        >
          <img :src="wallet.icon" :alt="wallet.name" class="wallet-icon-img" />
          <div class="wallet-info-text">
            <div class="wallet-name">{{ wallet.name }}</div>
            <div class="wallet-status">{{ wallet.available ? 'Ready to connect' : 'Not installed' }}</div>
          </div>
          <div v-if="wallet.available" class="status-dot"></div>
        </button>
      </div>
      <p class="modal-footer-text">By connecting, you agree to our Terms of Service</p>
    </div>
  </div>

  <div v-if="error" class="alert alert-error">
    <span>{{ error }}</span>
    <button @click="error = ''" class="alert-close">×</button>
  </div>
  <div v-if="success" class="alert alert-success">
    <span>{{ success }}</span>
    <button @click="success = ''" class="alert-close">×</button>
  </div>

  <div v-if="connected">
    <div class="tabs">
      <div class="tab" :class="{ active: activeTab === 'submit' }" @click="activeTab = 'submit'">
        Submit App
      </div>
      <div class="tab" :class="{ active: activeTab === 'my-apps' }" @click="activeTab = 'my-apps'; loadDeveloperApps()">
        My Apps ({{ developerApps.length }})
      </div>
      <div class="tab" :class="{ active: activeTab === 'browse' }" @click="activeTab = 'browse'; loadAllActiveApps()">
        Browse Apps
      </div>
    </div>

    <div v-if="activeTab === 'submit'">
      <div class="content-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
          <h3 class="card-title" style="margin: 0;">{{ editingAppIndex !== null ? 'Edit App' : 'Submit New App' }}</h3>
          <button v-if="editingAppIndex !== null" @click="cancelEdit" class="btn-secondary" style="font-size: 0.875rem; padding: 0.5rem 1rem;">
            Cancel Edit
          </button>
        </div>
        <p class="card-subtitle">{{ editingAppIndex !== null ? 'Update your app details below. Your app will be set to PENDING status and require admin approval.' : 'Fill in the details below to submit your app for review' }}</p>
        <div v-if="editingAppIndex !== null" class="fee-notice" style="background: linear-gradient(135deg, rgba(251, 191, 36, 0.08) 0%, rgba(255, 152, 0, 0.08) 100%); border-color: rgba(251, 191, 36, 0.3); margin-bottom: 1.5rem;">
          <div class="fee-notice-icon">⚠️</div>
          <div>
            <strong>Update Request</strong>
            <p>When you submit this update, your app status will change to PENDING and require admin approval before it goes live again.</p>
          </div>
        </div>
      <form @submit.prevent="submitApp">
        <div class="form-group">
          <label>App Name *</label>
          <input v-model="appForm.name" type="text" placeholder="My Awesome App" required />
          <small>Maximum 50 characters</small>
        </div>

        <div class="form-group">
          <label>Description *</label>
          <textarea v-model="appForm.description" placeholder="A brief description of your app..." required></textarea>
          <small>Maximum 200 characters</small>
        </div>

        <div class="form-group">
          <label>Icon URL *</label>
          <div style="position: relative;">
            <input
              v-model="appForm.icon"
              type="text"
              placeholder="https://yourdomain.com/icon.png"
              required
              :style="{ paddingRight: '40px' }"
            />
            <span
              v-if="appForm.icon"
              style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); font-size: 18px;"
            >
              {{ isValidIconUrl(appForm.icon) ? '✅' : '❌' }}
            </span>
          </div>
          <small>Must be an HTTPS URL ending in .png or .jpg (e.g., https://yourdomain.com/icon.png)</small>
        </div>

        <div class="form-group">
          <label>App URL *</label>
          <input v-model="appForm.url" type="url" placeholder="https://myapp.com" required />
          <small>Must be HTTPS</small>
        </div>

        <div class="form-group" v-if="editingAppIndex === null">
          <label>App Slug *</label>
          <div style="position: relative;">
            <input
              v-model="appForm.slug"
              type="text"
              placeholder="my-awesome-app"
              required
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              :style="{ paddingRight: '40px' }"
            />
            <span
              v-if="appForm.slug"
              style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); font-size: 18px;"
            >
              {{ isValidSlug(appForm.slug) ? '✅' : '❌' }}
            </span>
          </div>
          <small>URL-friendly identifier (lowercase, numbers, hyphens only). Example: bridge-assets, swap-tokens</small>
        </div>
        <div v-else class="form-group">
          <label>App Slug</label>
          <input
            v-model="appForm.slug"
            type="text"
            disabled
            :style="{ opacity: 0.6, cursor: 'not-allowed' }"
          />
          <small>Slug cannot be changed after submission</small>
        </div>

        <div class="form-group">
          <label>Developer Name</label>
          <input v-model="appForm.developerName" type="text" placeholder="Your name or organization" />
        </div>

        <div class="form-group">
          <label>Category *</label>
          <select v-model="appForm.category" required>
            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
          </select>
        </div>

        <div class="form-group">
          <label>Language *</label>
          <select v-model="appForm.language" required>
            <option v-for="lang in languages" :key="lang.code" :value="lang.code">{{ lang.name }}</option>
          </select>
          <small>Select the primary language your app is designed for, or "All Languages" if it works universally</small>
        </div>

        <div class="form-group">
          <label>Permissions</label>
          <div class="permissions-grid">
            <div v-for="perm in availablePermissions" :key="perm" class="permission-checkbox">
              <input type="checkbox" :id="perm" :value="perm" v-model="appForm.permissions" />
              <label :for="perm" style="margin: 0;">{{ perm }}</label>
            </div>
          </div>
          <small>Select only the permissions your app needs</small>
        </div>

        <div v-if="editingAppIndex === null" class="fee-notice">
          <div class="fee-notice-icon">💰</div>
          <div>
            <strong>Submission Fee: {{ submissionFeeMOVE }} MOVE</strong>
            <p>A one-time fee of {{ submissionFeeMOVE }} MOVE is required to submit your app for review. This helps prevent spam and maintain quality.</p>
          </div>
        </div>

        <button type="submit" :disabled="loading" class="btn-submit">
          <span v-if="!loading">{{ editingAppIndex !== null ? 'Request Update →' : 'Submit App for Review →' }}</span>
          <span v-else>{{ editingAppIndex !== null ? 'Requesting Update...' : 'Submitting...' }}</span>
        </button>
      </form>
      </div>
    </div>

    <div v-if="activeTab === 'my-apps'">
      <h3>Your Apps</h3>
      <div v-if="loading" style="text-align: center; padding: 2rem;">Loading...</div>
      <div v-else-if="developerApps.length === 0" class="empty-state">
        <div class="empty-state-icon">📦</div>
        <p>You haven't submitted any apps yet</p>
      </div>
      <div v-else class="apps-grid">
        <div v-for="(app, index) in developerApps" :key="developerAppIndices[index]" class="app-card">
          <div class="app-header">
            <div class="app-icon">
              <img 
                v-if="app.icon && (app.icon.startsWith('http://') || app.icon.startsWith('https://') || app.icon.startsWith('/'))" 
                :src="app.icon" 
                :alt="`${app.name} icon`"
                class="app-icon-image"
                @error="handleImageError"
              />
              <span v-else>{{ app.icon || '📱' }}</span>
            </div>
            <div>
              <div class="app-title">{{ app.name }}</div>
              <span class="app-category">{{ app.category }}</span>
            </div>
          </div>
          <p class="app-description">{{ app.description }}</p>
          <div class="app-meta">
            <span :class="'status-badge status-' + getStatusText(app.status).toLowerCase()">
              {{ getStatusText(app.status) }}
            </span>
            <span v-if="hasPendingChange[developerAppIndices[index]]" class="status-badge" style="background: rgba(251, 191, 36, 0.1); color: #d97706;">
              Update Pending
            </span>
            <span>Submitted: {{ formatDate(app.submitted_at) }}</span>
          </div>
          <div style="display: flex; gap: 0.75rem; margin-top: 1rem; flex-wrap: wrap;">
            <button @click="editApp(developerAppIndices[index], app)" class="btn" style="flex: 1; min-width: 120px; font-size: 0.875rem; padding: 0.5rem 1rem;">
              Edit App
            </button>
            <a :href="`https://mini-app-sharing.vercel.app/app/${app.slug}`" target="_blank" class="btn" style="flex: 1; min-width: 120px; display: inline-block; text-decoration: none; font-size: 0.875rem; padding: 0.5rem 1rem; text-align: center;">
              Launch App →
            </a>
          </div>
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'browse'">
      <h3>Active Apps</h3>
      <div v-if="loading" style="text-align: center; padding: 2rem;">Loading...</div>
      <div v-else-if="allActiveApps.length === 0" class="empty-state">
        <div class="empty-state-icon">🔍</div>
        <p>No active apps found</p>
      </div>
      <div v-else class="apps-grid">
        <div v-for="app in allActiveApps" :key="app.developer_address" class="app-card">
          <div class="app-header">
            <div class="app-icon">
              <img 
                v-if="app.icon && (app.icon.startsWith('http://') || app.icon.startsWith('https://') || app.icon.startsWith('/'))" 
                :src="app.icon" 
                :alt="`${app.name} icon`"
                class="app-icon-image"
                @error="handleImageError"
              />
              <span v-else>{{ app.icon || '📱' }}</span>
            </div>
            <div>
              <div class="app-title">{{ app.name }}</div>
              <span class="app-category">{{ app.category }}</span>
            </div>
          </div>
          <p class="app-description">{{ app.description }}</p>
          <div class="app-meta">
            <span>⭐ {{ (app.rating / 10).toFixed(1) }}</span>
            <span>📥 {{ app.downloads }} downloads</span>
            <span>By {{ app.developer_name }}</span>
          </div>
          <a :href="`https://mini-app-sharing.vercel.app/app/${app.slug}`" target="_blank" class="btn" style="display: inline-block; text-decoration: none; font-size: 0.875rem; padding: 0.5rem 1rem; margin-top: 1rem;">
            Launch App →
          </a>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="empty-state">
    <div class="empty-state-icon">🔐</div>
    <h3>Connect Your Wallet</h3>
    <p>Please connect your wallet to access the publisher dashboard</p>
  </div>

  <div class="help-section">
    <h2>Need Help?</h2>
    <ul>
      <li><strong>Documentation</strong>: Read the <a href="/publishing/">Publishing Guide</a></li>
      <li><strong>Contract Address</strong>: Update <code>REGISTRY_ADDRESS</code> after deployment</li>
      <li><strong>Support</strong>: Join our Discord for help</li>
    </ul>
    <hr style="margin: 1.5rem 0; border: none; border-top: 1px solid var(--vp-c-divider);" />
    <p style="margin: 0; font-style: italic; color: var(--vp-c-text-2);">
      This publisher interface allows you to submit apps directly from the docs without writing any code!
    </p>
  </div>

</div>
</template>

<style scoped>
/* Use design system CSS variables with proper fallbacks */
.publisher-container {
  --accent-primary: var(--color-guild-green-300, #81ffba);
  --accent-secondary: var(--color-guild-green-400, #6ce2a1);
  --accent-tertiary: var(--color-guild-green-500, #59cc8a);
  --accent-blue: var(--color-byzantine-blue-400, #0337ff);

  max-width: 1400px;
  margin: 0 auto;
  padding: 3rem 1.5rem;
}

/* Hero Header */
.hero-header {
  text-align: center;
  margin-bottom: 4rem;
  padding: 3rem 0;
  position: relative;
}

.hero-header::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, color-mix(in srgb, var(--accent-primary) 10%, transparent) 0%, transparent 70%);
  pointer-events: none;
  z-index: -1;
}

.hero-content {
  max-width: 700px;
  margin: 0 auto;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 900;
  color: var(--accent-primary);
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-tertiary) 50%, var(--accent-secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 1rem 0;
  letter-spacing: -0.03em;
  line-height: 1.1;
}

/* Ensure title is visible in browsers without gradient text support */
@supports not (-webkit-background-clip: text) {
  .hero-title {
    color: var(--accent-primary);
    background: none;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1.125rem;
  }

  .wallet-card-content {
    flex-direction: column;
    align-items: stretch;
  }

  .wallet-info {
    flex-direction: column;
    align-items: flex-start;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
  }

  .tabs {
    flex-direction: column;
  }

  .tab {
    text-align: center;
  }

  .content-card {
    padding: 1.75rem;
  }

  .card-title {
    font-size: 1.5rem;
  }

  .apps-grid {
    grid-template-columns: 1fr;
  }

  .modal-content {
    max-width: 100%;
    padding: 1.5rem;
  }

  .wallet-option {
    padding: 0.875rem;
  }

  .wallet-icon-img {
    width: 2.5rem;
    height: 2.5rem;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .publisher-container {
    padding: 2rem 1rem;
  }

  .wallet-icon-wrapper {
    width: 3rem;
    height: 3rem;
  }

  .wallet-icon-emoji {
    font-size: 1.5rem;
  }

  .wallet-title {
    font-size: 1rem;
  }
}

.hero-subtitle {
  font-size: 1.25rem;
  color: var(--vp-c-text-2);
  margin: 0;
  font-weight: 400;
  line-height: 1.6;
}

/* Wallet Card - Glassmorphism */
.wallet-card {
  background: linear-gradient(135deg, rgba(129, 255, 186, 0.03) 0%, rgba(0, 255, 249, 0.03) 100%);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(129, 255, 186, 0.1);
  border-radius: 20px;
  margin-bottom: 3rem;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.wallet-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(129, 255, 186, 0.5), transparent);
  opacity: 0;
  transition: opacity 0.4s ease;
}

.wallet-card:hover {
  border-color: rgba(129, 255, 186, 0.4);
  box-shadow: 0 12px 40px rgba(129, 255, 186, 0.15);
  transform: translateY(-2px);
}

.wallet-card:hover::before {
  opacity: 1;
}

.wallet-card-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.wallet-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  min-width: 0;
}

.wallet-icon-wrapper {
  width: 4rem;
  height: 4rem;
  border-radius: 16px;
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 50%, var(--accent-tertiary) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  box-shadow: 0 8px 24px rgba(129, 255, 186, 0.3);
  animation: pulse 3s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 8px 24px rgba(129, 255, 186, 0.3);
  }
  50% {
    box-shadow: 0 8px 32px rgba(129, 255, 186, 0.5);
  }
}

.wallet-icon-emoji {
  font-size: 2rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.wallet-details {
  flex: 1;
  min-width: 0;
}

.wallet-title {
  margin: 0 0 0.25rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.wallet-description {
  margin: 0;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}

.wallet-address-display {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.wallet-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  background: linear-gradient(135deg, var(--accent-primary)15 0%, var(--accent-secondary)15 100%);
  border: 1px solid rgba(129, 255, 186, 0.3);
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--accent-primary);
}

.wallet-address-mono {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg);
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
}

/* Modern Buttons - Web3 Style */
.btn-primary {
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 50%, var(--accent-tertiary) 100%);
  color: #000000;
  border: none;
  padding: 0.875rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 16px rgba(129, 255, 186, 0.3);
  white-space: nowrap;
  position: relative;
  overflow: hidden;
}

.btn-primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.btn-primary:hover:not(:disabled)::before {
  left: 100%;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(129, 255, 186, 0.4);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  border: 2px solid rgba(129, 255, 186, 0.2);
  padding: 0.875rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  position: relative;
}

.btn-secondary:hover {
  background: linear-gradient(135deg, rgba(129, 255, 186, 0.05) 0%, rgba(0, 255, 249, 0.05) 100%);
  border-color: rgba(129, 255, 186, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(129, 255, 186, 0.15);
}

.btn {
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  color: #000000;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(129, 255, 186, 0.25);
}

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(129, 255, 186, 0.35);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Wallet Modal - Modern Web3 Design */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: var(--vp-c-bg);
  border: 2px solid rgba(129, 255, 186, 0.15);
  border-radius: 20px;
  padding: 2rem;
  max-width: 28rem;
  width: 100%;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(129, 255, 186, 0.1);
  animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.75rem;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--accent-primary);
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 1.75rem;
  line-height: 1;
  color: var(--vp-c-text-2);
  cursor: pointer;
  padding: 0.25rem;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.close-btn:hover {
  background: linear-gradient(135deg, rgba(129, 255, 186, 0.08) 0%, rgba(0, 255, 249, 0.08) 100%);
  color: var(--vp-c-text-1);
  transform: rotate(90deg);
}

.wallet-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.75rem;
}

.wallet-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, rgba(129, 255, 186, 0.02) 0%, rgba(0, 255, 249, 0.02) 100%);
  border: 2px solid var(--vp-c-divider);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  width: 100%;
  position: relative;
  overflow: hidden;
}

.wallet-option::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(129, 255, 186, 0.05), transparent);
  transition: left 0.5s ease;
}

.wallet-option:hover:not(.wallet-disabled) {
  background: linear-gradient(135deg, rgba(129, 255, 186, 0.05) 0%, rgba(0, 255, 249, 0.05) 100%);
  border-color: rgba(129, 255, 186, 0.5);
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(129, 255, 186, 0.15);
}

.wallet-option:hover:not(.wallet-disabled)::before {
  left: 100%;
}

.wallet-disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.wallet-icon-img {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 12px;
  object-fit: contain;
  flex-shrink: 0;
  background: var(--vp-c-bg-soft);
  padding: 0.375rem;
  border: 1px solid var(--vp-c-divider);
}

.wallet-info-text {
  flex: 1;
  text-align: left;
  min-width: 0;
}

.wallet-name {
  font-weight: 600;
  font-size: 1rem;
  color: var(--vp-c-text-1);
  margin-bottom: 0.25rem;
  transition: color 0.3s ease;
}

.wallet-option:hover:not(.wallet-disabled) .wallet-name {
  color: var(--accent-primary);
}

.wallet-status {
  font-size: 0.8125rem;
  color: var(--vp-c-text-2);
  font-weight: 500;
}

.status-dot {
  width: 0.5rem;
  height: 0.5rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.4);
  animation: pulse-dot 2s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%, 100% {
    box-shadow: 0 0 8px rgba(16, 185, 129, 0.4);
  }
  50% {
    box-shadow: 0 0 12px rgba(16, 185, 129, 0.6);
  }
}

.modal-footer-text {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--vp-c-text-2);
  text-align: center;
  font-weight: 500;
}

.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  background: var(--vp-c-bg-soft);
  padding: 0.5rem;
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
}

.tab {
  flex: 1;
  padding: 0.875rem 1.5rem;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9375rem;
  color: var(--vp-c-text-2);
  transition: all 0.3s ease;
  text-align: center;
}

.tab:hover:not(.active) {
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}

.tab.active {
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  color: #000000;
  box-shadow: 0 2px 8px rgba(129, 255, 186, 0.25);
}

/* Content Card - Enhanced */
.content-card {
  background: linear-gradient(135deg, rgba(129, 255, 186, 0.02) 0%, rgba(0, 255, 249, 0.02) 100%);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(129, 255, 186, 0.1);
  border-radius: 20px;
  padding: 2.5rem;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.content-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, rgba(129, 255, 186, 0.5), rgba(0, 255, 249, 0.5), transparent);
  opacity: 0;
  transition: opacity 0.4s ease;
}

.content-card:hover {
  border-color: rgba(129, 255, 186, 0.3);
  box-shadow: 0 12px 40px rgba(129, 255, 186, 0.12);
  transform: translateY(-2px);
}

.content-card:hover::before {
  opacity: 1;
}

.card-title {
  margin: 0 0 0.75rem 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--accent-primary);
}

.card-subtitle {
  margin: 0 0 2.5rem 0;
  color: var(--vp-c-text-2);
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.6;
}

/* Submit Button */
.fee-notice {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem;
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.08) 0%, rgba(255, 152, 0, 0.08) 100%);
  border: 1.5px solid rgba(255, 193, 7, 0.3);
  border-radius: 12px;
  margin-bottom: 1.5rem;
}

.fee-notice-icon {
  font-size: 1.75rem;
  flex-shrink: 0;
}

.fee-notice strong {
  display: block;
  color: var(--vp-c-text-1);
  font-size: 1rem;
  margin-bottom: 0.375rem;
}

.fee-notice p {
  color: var(--vp-c-text-2);
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0;
}

.btn-submit {
  width: 100%;
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  color: #000000;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(129, 255, 186, 0.25);
  margin-top: 0.5rem;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(129, 255, 186, 0.35);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.alert {
  padding: 1.125rem 1.25rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  font-size: 0.9375rem;
  font-weight: 500;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.alert span {
  flex: 1;
}

.alert-close {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  line-height: 1;
  color: currentColor;
  cursor: pointer;
  padding: 0;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
  flex-shrink: 0;
  opacity: 0.6;
}

.alert-close:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.1);
}

.alert::before {
  content: '';
  display: inline-block;
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.alert-error {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(220, 38, 38, 0.05) 100%);
  color: #dc2626;
  border: 1.5px solid rgba(239, 68, 68, 0.25);
}

.alert-error::before {
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%23dc2626'%3E%3Cpath fill-rule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z' clip-rule='evenodd'/%3E%3C/svg%3E") center / contain no-repeat;
}

.alert-success {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(22, 163, 74, 0.05) 100%);
  color: #16a34a;
  border: 1.5px solid rgba(34, 197, 94, 0.25);
}

.alert-success::before {
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%2316a34a'%3E%3Cpath fill-rule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clip-rule='evenodd'/%3E%3C/svg%3E") center / contain no-repeat;
}

.form-group {
  margin-bottom: 1.75rem;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.625rem;
  color: var(--vp-c-text-1);
  font-size: 0.9375rem;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1.5px solid var(--vp-c-divider);
  border-radius: 10px;
  font-size: 0.9375rem;
  font-family: inherit;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  transition: all 0.2s ease;
}

.form-group input:hover,
.form-group textarea:hover,
.form-group select:hover {
  border-color: rgba(129, 255, 186, 0.4);
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 4px rgba(129, 255, 186, 0.08);
  background: var(--vp-c-bg-soft);
}

.form-group textarea {
  min-height: 120px;
  resize: vertical;
  line-height: 1.6;
}

.form-group small {
  display: block;
  margin-top: 0.5rem;
  color: var(--vp-c-text-2);
  font-size: 0.8125rem;
  font-weight: 500;
}

.permissions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.permission-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.permission-checkbox input[type="checkbox"] {
  width: auto;
  margin: 0;
}

.permission-checkbox label {
  color: var(--vp-c-text-1);
  font-weight: normal;
}

.apps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.app-card {
  background: linear-gradient(135deg, rgba(129, 255, 186, 0.02) 0%, rgba(0, 255, 249, 0.02) 100%);
  border: 2px solid rgba(129, 255, 186, 0.1);
  border-radius: 16px;
  padding: 1.75rem;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.app-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(129, 255, 186, 0.5), transparent);
  opacity: 0;
  transition: opacity 0.4s ease;
}

.app-card:hover {
  border-color: rgba(129, 255, 186, 0.4);
  box-shadow: 0 8px 24px rgba(129, 255, 186, 0.15);
  transform: translateY(-4px);
}

.app-card:hover::before {
  opacity: 1;
}

.app-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.app-icon {
  font-size: 2.5rem;
  filter: drop-shadow(0 2px 6px rgba(129, 255, 186, 0.2));
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  flex-shrink: 0;
}

.app-icon-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 0.75rem;
}

.app-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin-bottom: 0.25rem;
  transition: color 0.3s ease;
}

.app-card:hover .app-title {
  color: var(--accent-primary);
}

.app-category {
  display: inline-block;
  padding: 0.375rem 0.875rem;
  background: linear-gradient(135deg, rgba(129, 255, 186, 0.08) 0%, rgba(0, 255, 249, 0.08) 100%);
  border: 1px solid rgba(129, 255, 186, 0.2);
  border-radius: 9999px;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--accent-primary);
  text-transform: capitalize;
}

.app-description {
  color: var(--vp-c-text-2);
  margin-bottom: 1.25rem;
  line-height: 1.6;
  font-size: 0.9375rem;
}

.app-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
  font-weight: 500;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
}

.status-pending {
  background: rgba(251, 191, 36, 0.1);
  color: #d97706;
}

.status-approved {
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
}

.status-rejected {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--vp-c-text-2);
}

.empty-state-icon {
  font-size: 5rem;
  margin-bottom: 1.5rem;
  filter: drop-shadow(0 4px 12px rgba(129, 255, 186, 0.2));
  opacity: 0.9;
}

.empty-state h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin: 0 0 0.75rem 0;
}

.empty-state p {
  font-size: 1rem;
  line-height: 1.6;
  font-weight: 500;
}

.help-section {
  margin-top: 4rem;
  padding: 2.5rem;
  background: linear-gradient(135deg, rgba(129, 255, 186, 0.02) 0%, rgba(0, 255, 249, 0.02) 100%);
  border-radius: 20px;
  border: 2px solid rgba(129, 255, 186, 0.1);
  position: relative;
  overflow: hidden;
}

.help-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(129, 255, 186, 0.4), rgba(0, 255, 249, 0.4), transparent);
}

.help-section h2 {
  margin-top: 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--accent-primary);
}

.help-section ul {
  padding-left: 1.5rem;
}

.help-section li {
  margin-bottom: 0.5rem;
  color: var(--vp-c-text-1);
}

.help-section a {
  color: var(--accent-primary);
  text-decoration: none;
}

.help-section a:hover {
  text-decoration: underline;
}

.help-section code {
  background: var(--vp-c-bg-mute);
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  font-size: 0.875em;
  color: var(--vp-c-text-code);
}
</style>
