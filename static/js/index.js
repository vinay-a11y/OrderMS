// ==========================================
// GLOBAL VARIABLES AND CONFIGURATION
// ==========================================

// Authentication state
let isLoggedIn = false

// Selected pincode for delivery
let selectedPincode = null

// Available pincodes - will be fetched from backend
let availablePincodes = []

// ==========================================
// INITIALIZATION AND SETUP
// ==========================================

/**
 * Main initialization function called when DOM is loaded
 * Sets up all website functionality and fetches initial data
 */
document.addEventListener("DOMContentLoaded", () => {
  checkAuthState() // Check auth state immediately
  initializeWebsite()
  checkFirstVisit()
  fetchAndDisplayProducts() // Your original product fetching code
})

/**
 * Initialize all website components
 * Sets up cart, scroll functionality, pincode search, and fetches pincodes
 */
function initializeWebsite() {
  initializeCart()
  initializeScrollToTop()
  updateCartDisplay()
  setupPincodeSearch()
  fetchAvailablePincodes() // Fetch pincodes from backend
  checkAuthState() // Check if user is logged in
}

/**
 * Check authentication state and update UI accordingly
 */
function checkAuthState() {
  try {
    const user = JSON.parse(localStorage.getItem('user'))
    const authText = document.getElementById('authText')
    
    if (!authText) {
      console.error('Auth text element not found')
      return
    }
    
    if (user && typeof user.first_name === 'string' && user.first_name.length > 0) {
      console.log('Setting auth text to:', `Hi ${user.first_name}`)
      authText.textContent = `Hi ${user.first_name}`
      isLoggedIn = true
    } else {
      console.log('Setting auth text to: Sign In / Register')
      authText.textContent = 'Sign In / Register'
      isLoggedIn = false
    }
  } catch (err) {
    console.error('Error checking auth state:', err)
    const authText = document.getElementById('authText')
    if (authText) {
      authText.textContent = 'Sign In / Register'
    }
    isLoggedIn = false
  }
}

// ==========================================
// CART UTILITY FUNCTIONS (SHARED)
// ==========================================

/**
 * Get cart from localStorage
 * @returns {Array} Cart items array
 */
function getCartFromStorage() {
  try {
    return JSON.parse(localStorage.getItem("cart")) || []
  } catch (error) {
    console.error("Error reading cart from localStorage:", error)
    return []
  }
}

/**
 * Save cart to localStorage
 * @param {Array} cart - Cart items array
 */
function saveCartToStorage(cart) {
  try {
    localStorage.setItem("cart", JSON.stringify(cart))
  } catch (error) {
    console.error("Error saving cart to localStorage:", error)
  }
}

/**
 * Calculate cart totals from localStorage
 * @returns {Object} Cart totals object
 */
function calculateCartTotals() {
  const cart = getCartFromStorage()
  let totalPrice = 0
  let totalSavings = 0
  let count = 0

  cart.forEach((item) => {
    const itemPrice = item.price || 0
    const itemOriginalPrice = item.originalPrice || itemPrice + 20 // Mock original price
    totalPrice += itemPrice * item.quantity
    totalSavings += (itemOriginalPrice - itemPrice) * item.quantity
    count += item.quantity
  })

  return {
    totalPrice: totalPrice,
    totalSavings: totalSavings,
    count: count,
    items: cart,
  }
}

// Initialize cart count on page load
document.addEventListener("DOMContentLoaded", () => {
  const cart = getCartFromStorage()
  updateCartCount()
})

// ==========================================
// PINCODE MANAGEMENT (BACKEND INTEGRATION)
// ==========================================

/**
 * Fetch available pincodes from backend API
 * Currently using mock data, replace with actual API call
 */
async function fetchAvailablePincodes() {
  try {
    // TODO: Replace with actual backend API call
    // const response = await fetch('/api/pincodes');
    // if (!response.ok) throw new Error('Failed to fetch pincodes');
    // availablePincodes = await response.json();

    // Mock data for now - replace with actual backend call
    availablePincodes = [
      { code: "421302", area: "Amane, Maharashtra, India", deliveryAvailable: true },
      { code: "400001", area: "Fort, Mumbai, Maharashtra", deliveryAvailable: true },
    ]

    console.log("Pincodes fetched successfully:", availablePincodes)
    renderPincodeOptions()
  } catch (error) {
    console.error("Error fetching pincodes:", error)
    // Show error in pincode modal
    const pincodesList = document.getElementById("pincodesList")
    if (pincodesList) {
      pincodesList.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Failed to load available pincodes. Please try again later.</p>
                </div>
            `
    }
  }
}

/**
 * Render pincode options in the modal
 * Displays fetched pincodes from backend
 */
function renderPincodeOptions() {
  const pincodesList = document.getElementById("pincodesList")
  if (!pincodesList) return

  if (availablePincodes.length === 0) {
    pincodesList.innerHTML = `
            <div class="no-products-message">
                <i class="fas fa-map-marker-alt"></i>
                <p>No pincodes available for delivery at the moment.</p>
            </div>
        `
    return
  }

  pincodesList.innerHTML = availablePincodes
    .map(
      (pincode) => `
        <div class="pincode-option" onclick="selectPincode('${pincode.code}', '${pincode.area}')">
            <i class="fas fa-map-marker-alt"></i>
            <div class="pincode-details">
                <h5>${pincode.code}</h5>
                <p>${pincode.area}</p>
            </div>
        </div>
    `,
    )
    .join("")
}

/**
 * Check if this is user's first visit
 * Shows pincode modal if no pincode is selected
 */
function checkFirstVisit() {
  const hasVisited = localStorage.getItem("hasVisited")
  const savedPincode = localStorage.getItem("selectedPincode")

  if (!hasVisited || !savedPincode) {
    setTimeout(() => {
      openPincodeModal()
    }, 1000)
  } else {
    const savedLocation = localStorage.getItem("selectedLocation")
    updateLocationDisplay(savedPincode, savedLocation)
  }
}

/**
 * Open pincode selection modal
 */
function openPincodeModal() {
  document.getElementById("pincodeModal").classList.add("active")
  document.body.style.overflow = "hidden"
}

/**
 * Close pincode selection modal
 */
function closePincodeModal() {
  document.getElementById("pincodeModal").classList.remove("active")
  document.body.style.overflow = ""
}

/**
 * Select a pincode and save to localStorage
 * @param {string} pincode - Selected pincode
 * @param {string} location - Location name for the pincode
 */
function selectPincode(pincode, location) {
  selectedPincode = pincode
  updateLocationDisplay(pincode, location)

  // Save to localStorage for persistence
  localStorage.setItem("hasVisited", "true")
  localStorage.setItem("selectedPincode", pincode)
  localStorage.setItem("selectedLocation", location)

  closePincodeModal()
}

/**
 * Update location display in header
 * @param {string} pincode - Pincode to display
 * @param {string} location - Location name to display
 */
function updateLocationDisplay(pincode, location) {
  const pincodeElement = document.getElementById("selectedPincode")
  const locationElement = document.getElementById("selectedLocation")

  if (pincodeElement) pincodeElement.textContent = pincode
  if (locationElement) locationElement.textContent = location.split(",")[0]
}

/**
 * Setup pincode search functionality
 * Handles search input and validation
 */
function setupPincodeSearch() {
  const pincodeInput = document.getElementById("pincodeInput")
  if (!pincodeInput) return

  // Handle search input
  pincodeInput.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase()
    // TODO: Implement real-time search filtering
    console.log("Searching for:", searchTerm)
  })

  // Handle Enter key press for pincode validation
  pincodeInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const enteredPincode = e.target.value.trim()
      if (enteredPincode.length === 6) {
        // Check if pincode exists in available pincodes
        const foundPincode = availablePincodes.find((p) => p.code === enteredPincode)
        if (foundPincode) {
          selectPincode(foundPincode.code, foundPincode.area)
        } else {
          alert("Sorry, we do not deliver to this pincode yet.")
        }
      }
    }
  })
}

// ==========================================
// AUTHENTICATION FUNCTIONALITY
// ==========================================

/**
 * Toggle authentication dropdown or redirect to login
 */
function toggleAuth() {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    console.log('User data:', user);

    if (user && typeof user.first_name === 'string' && user.first_name.length > 0) {
      const dropdown = document.getElementById("logoutDropdown");
      const authText = document.getElementById("authText");

      // Show dropdown
      if (dropdown) dropdown.classList.toggle("active");

      // Update name display
      if (authText) {
        authText.textContent = `Hi ${user.first_name}`;
      }
    } else {
      // Not logged in, redirect to login
      window.location.href = "/login";
    }
  } catch (err) {
    console.error('Error in toggleAuth:', err);
    window.location.href = "/login";
  }
}

/**
 * Confirm logout and update UI
 */
function confirmLogout() {
  // Clear user data from localStorage
  localStorage.removeItem('user')
  
  // Update UI
  const authButton = document.getElementById('authButton')
  const authText = document.getElementById('authText')
  if (authText) {
    authText.textContent = 'Sign In / Register'
  }
  
  // Hide logout dropdown
  const dropdown = document.getElementById('logoutDropdown')
  if (dropdown) {
    dropdown.classList.remove('active')
  }
  
  // Redirect to home page
  window.location.href = '/'
  if (dropdown) dropdown.classList.remove("active")

  alert("You have been logged out successfully!")
}

/**
 * Cancel logout action
 */
function cancelLogout() {
  const dropdown = document.getElementById("logoutDropdown")
  if (dropdown) {
    dropdown.classList.remove("active")
  }
}

/**
 * Check authentication state and update UI accordingly
 */
// function checkAuthState() {
//   const user = JSON.parse(localStorage.getItem('user'))
//   const authText = document.getElementById('authText')
  
//   if (user && authText) {
//     authText.textContent = `Hi ${user.name}`
//     isLoggedIn = true
//   } else {
//     authText.textContent = 'Sign In / Register'
//     isLoggedIn = false
//   }
// }

// ==========================================
// CART FUNCTIONALITY
// ==========================================

/**
 * Initialize cart functionality
 * Sets up event listeners for cart interactions
 */
function initializeCart() {
  const cartIcon = document.getElementById("cartIcon")
  const cartPopup = document.getElementById("cartPopup")
  const closeCart = document.getElementById("closeCart")
  const viewFullCart = document.getElementById("viewFullCart")

  // Open cart popup when clicking cart icon
  if (cartIcon && cartPopup) {
    cartIcon.addEventListener("click", () => {
      cartPopup.classList.add("active")
      document.body.style.overflow = "hidden"
      renderCartItems() // Refresh cart items when opening
    })
  }

  // Close cart popup
  if (closeCart && cartPopup) {
    closeCart.addEventListener("click", () => {
      cartPopup.classList.remove("active")
      document.body.style.overflow = ""
    })
  }

  // Close cart when clicking outside
  document.addEventListener("click", (e) => {
    if (
      cartPopup &&
      cartPopup.classList.contains("active") &&
      !cartPopup.contains(e.target) &&
      cartIcon &&
      !cartIcon.contains(e.target)
    ) {
      cartPopup.classList.remove("active")
      document.body.style.overflow = ""
    }
  })

  // Navigate to full cart page
  if (viewFullCart) {
    viewFullCart.addEventListener("click", () => {
      window.location.href = "/cart"
    })
  }

  // Initial cart display update
  updateCartDisplay()
}

// ==========================================
// PRODUCT MANAGEMENT (YOUR ORIGINAL CODE)
// ==========================================

/**
 * Fetch and display products from backend API
 * Your original function - preserved as requested
 */
async function fetchAndDisplayProducts() {
  const container = document.getElementById("featuredProductsContainer")
  if (!container) return

  try {
    const response = await fetch("/api/products")
    if (!response.ok) throw new Error("Failed to fetch products")

    const products = await response.json()
    if (!products || !Array.isArray(products)) {
      throw new Error("Invalid products data received")
    }

    renderProducts(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Failed to load products. Please try again later.</p>
            </div>
        `
  }
}

/**
 * Render products in the container
 * Your original function - preserved as requested
 */
function renderProducts(products) {
  const container = document.getElementById("featuredProductsContainer")
  if (!container) return

  if (products.length === 0) {
    container.innerHTML = `
            <div class="no-products-message">
                <i class="fas fa-box-open"></i>
                <p>No products available at the moment.</p>
            </div>
        `
    return
  }

  container.innerHTML = products
    .map(
      (product) => `
        <div class="product-card" data-category="${product.category || "uncategorized"}" style="cursor: pointer;" onclick="goToProductDetails(${product.id})">
            <div class="product-image">${product.icon || "🍪"}</div>
            <div class="product-info">
                <h3>${product.item_name || "Unnamed Product"}</h3>
                <div class="product-price">₹${product.price_01 ? product.price_01.toFixed(2) : "N/A"}</div>
                <p>${product.description || "No description available"}</p>
                <button class="add-to-cart" onclick="event.stopPropagation(); addToCart(${product.id})">
                    Add to Cart <i class="fas fa-shopping-cart"></i>
                </button>
            </div>
        </div>
    `,
    )
    .join("")

  // Add function to window object so it can be called from onclick
  window.goToProductDetails = function(productId) {
    window.location.href = `/product-details.html?id=${productId}`
  }
}

/**
 * Add product to cart with localStorage persistence (Updated to match product.js)
 */
async function addToCart(productId, quantity = 1) {
  console.log("Adding product to cart, ID:", productId, "Quantity:", quantity)

  // Disable button and show loading state
  const button = document.querySelector(`button[onclick="addToCart(${productId})"]`)
  if (button) {
    button.disabled = true
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...'
  }

  try {
    // Get current cart from localStorage
    const cart = getCartFromStorage()
    console.log("Current cart:", cart)

    // Fetch product details from API
    const response = await fetch(`/api/products/${productId}`)
    if (!response.ok) throw new Error('Failed to fetch product details')
    const product = await response.json()

    // Check if product already exists in cart
    const existingItemIndex = cart.findIndex((item) => item.id === productId)

    if (existingItemIndex !== -1) {
      // Update quantity if product exists
      cart[existingItemIndex].quantity += quantity
    } else {
      // Add new item if product doesn't exist
      cart.push({
        id: productId,
        name: product.item_name,
        price: product.price_01,
        quantity: quantity,
        icon: product.icon || '🍪',
        description: product.description
      })
    }

    // Save to localStorage and update displays
    saveCartToStorage(cart)
    updateCartDisplay()
    updateCartCount() // Update cart count badge

    // Show cart popup
    const cartPopup = document.getElementById("cartPopup")
    if (cartPopup) {
      cartPopup.classList.add("active")
      document.body.style.overflow = "hidden"
      renderCartItems() // Refresh cart items
    }

    // Show success message
    const toast = document.createElement("div")
    toast.className = "toast success"
    toast.innerHTML = `
            <i class="fas fa-check-circle"></i>
            ${productName} added to cart!
        `
    document.body.appendChild(toast)

    // Add floating animation
    const cartIcon = document.querySelector(".cart-icon, #cartIcon")
    if (cartIcon && button) {
      // Add pulse animation to cart icon
      cartIcon.classList.add("pulse")
      setTimeout(() => cartIcon.classList.remove("pulse"), 300)
    }

    // Remove success message after delay
    setTimeout(() => toast.remove(), 3000)

    // Try to sync with server if available
    try {
      const response = await fetch("/api/cart/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cart }),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.data && result.data.cart) {
          // Update local cart if server made any changes
          saveCartToStorage(result.data.cart)
          updateCartDisplay()
        }
      }
    } catch (syncError) {
      console.warn("Failed to sync cart with server:", syncError)
      // Don't show error to user as the item was still added locally
    }
  } catch (error) {
    console.error("Error adding to cart:", error)
    const toast = document.createElement("div")
    toast.className = "toast error"
    toast.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            Failed to add item to cart. Please try again.
        `
    document.body.appendChild(toast)
    setTimeout(() => toast.remove(), 3000)
  } finally {
    // Reset button state
    if (button) {
      button.disabled = false
      button.innerHTML = 'Add to Cart <i class="fas fa-shopping-cart"></i>'
    }
  }
}

/**
 * Update item quantity in cart
 * @param {number} productId - Product ID to update
 * @param {number} newQuantity - New quantity value
 */
function updateItemQuantity(productId, newQuantity) {
  const cart = getCartFromStorage()
  const itemIndex = cart.findIndex((item) => item.id === Number.parseInt(productId))

  if (itemIndex === -1) return

  if (newQuantity <= 0) {
    // Remove item if quantity is 0 or less
    cart.splice(itemIndex, 1)
  } else {
    // Update quantity
    cart[itemIndex].quantity = newQuantity
  }

  saveCartToStorage(cart)
  updateCartDisplay()
  renderCartItems()
}

/**
 * Remove item from cart completely
 * @param {number} productId - Product ID to remove
 */
function removeFromCart(productId) {
  const cart = getCartFromStorage()
  const itemIndex = cart.findIndex((item) => item.id === Number.parseInt(productId))

  if (itemIndex === -1) return

  cart.splice(itemIndex, 1)
  saveCartToStorage(cart)
  updateCartDisplay()
  renderCartItems()
}

/**
 * Update cart display in header and popup
 */
function updateCartDisplay() {
  const cartTotals = calculateCartTotals()

  // Update cart count
  const cartCountElement = document.getElementById("cartCount")
  if (cartCountElement) {
    cartCountElement.textContent = cartTotals.count
  }

  // Update cart popup totals
  const cartItemCountElement = document.getElementById("cartItemCount")
  const cartTotalElement = document.getElementById("cartTotal")
  const cartSavingsElement = document.getElementById("cartSavings")

  if (cartItemCountElement) cartItemCountElement.textContent = cartTotals.count
  if (cartTotalElement) cartTotalElement.textContent = `₹${cartTotals.totalPrice.toFixed(2)}`
  if (cartSavingsElement) cartSavingsElement.textContent = `₹${cartTotals.totalSavings.toFixed(2)}`
}

/**
 * Render cart items in the cart popup
 * Creates HTML template for each cart item
 */
function renderCartItems() {
  const cartItemsContainer = document.getElementById("cartItems")
  if (!cartItemsContainer) return

  const cart = getCartFromStorage()
  cartItemsContainer.innerHTML = ""

  if (cart.length === 0) {
    // Show empty cart message
    cartItemsContainer.innerHTML = `
            <div style="text-align: center; padding: 3rem;">
                <i class="fas fa-shopping-cart" style="font-size: 4rem; color: #ddd; margin-bottom: 1rem;"></i>
                <p style="color: #666; font-size: 1.1rem;">Your cart is empty</p>
            </div>
        `
    return
  }

  // Render each cart item using template
  cart.forEach((item) => {
    const cartItemElement = document.createElement("div")
    cartItemElement.className = "cart-item"
    cartItemElement.innerHTML = `
            <div class="cart-item-image">${item.icon}</div>
            <div class="cart-item-details">
                <div class="cart-item-title">${item.name}</div>
                <div class="cart-item-variant">Variant: 250g</div>
                <div class="cart-item-price">
                    <div class="cart-item-pay">You Pay ₹${item.price.toFixed(2)}</div>
                    <div class="cart-item-save">You Save ₹${((item.originalPrice || item.price + 20) - item.price).toFixed(2)}</div>
                </div>
                <div class="cart-item-actions">
                    <div class="quantity-control">
                        <button class="quantity-btn remove" onclick="updateItemQuantity(${item.id}, ${item.quantity - 1})">
                            ${item.quantity === 1 ? '<i class="fas fa-trash"></i>' : "-"}
                        </button>
                        <input type="text" class="quantity-input" value="${item.quantity}" readonly>
                        <button class="quantity-btn" onclick="updateItemQuantity(${item.id}, ${item.quantity + 1})">+</button>
                    </div>
                    <button class="remove-item" onclick="removeFromCart(${item.id})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `

    cartItemsContainer.appendChild(cartItemElement)
  })
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Filter products by category
 * @param {string} category - Category to filter by
 */
function filterProducts(category) {
  console.log(`Filtering products by category: ${category}`)
  // TODO: Implement actual filtering logic
}

/**
 * Initialize scroll to top functionality
 */
function initializeScrollToTop() {
  const scrollTopBtn = document.getElementById("scrollTop")
  if (!scrollTopBtn) return

  window.addEventListener("scroll", () => {
    if (window.pageYOffset > 300) {
      scrollTopBtn.classList.add("visible")
    } else {
      scrollTopBtn.classList.remove("visible")
    }
  })
}

/**
 * Scroll to top of page smoothly
 */
function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  })
}

// ==========================================
// EVENT LISTENERS AND CLEANUP
// ==========================================

/**
 * Close dropdowns when clicking outside
 */
document.addEventListener("click", (e) => {
  // Close auth dropdown
  if (!e.target.closest(".auth-container")) {
    const dropdown = document.getElementById("logoutDropdown")
    if (dropdown) {
      dropdown.classList.remove("active")
    }
  }

  // Close pincode modal (only if user has visited before)
  if (!e.target.closest(".pincode-modal-content") && !e.target.closest(".location-selector")) {
    const pincodeModal = document.getElementById("pincodeModal")
    if (pincodeModal && pincodeModal.classList.contains("active")) {
      const hasVisited = localStorage.getItem("hasVisited")
      if (hasVisited) {
        closePincodeModal()
      }
    }
  }
})

// ==========================================
// DEMO FUNCTIONALITY
// ==========================================

/**
 * Simulate login after 3 seconds (for demo purposes)
 * Remove this in production
 */


// Make functions globally accessible for onclick handlers
window.addToCart = addToCart
window.updateItemQuantity = updateItemQuantity
window.removeFromCart = removeFromCart
window.updateCartCount = updateCartCount
