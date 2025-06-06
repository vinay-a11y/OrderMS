// Global variables
let currentProduct = null
const cart = JSON.parse(localStorage.getItem("cart")) || []

// API Configuration
const API_BASE_URL = "/api" // Change this to your backend URL

// Initialize the page
document.addEventListener("DOMContentLoaded", async () => {
  updateCartCount()
  await loadProductDetails()
  await loadRelatedProducts()
})

// Load product details from backend
async function loadProductDetails() {
  const params = new URLSearchParams(window.location.search)
  const productId = params.get("id")

  if (!productId) {
    showError("Product Not Found", "The product you are looking for does not exist.")
    return
  }

  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`)

    if (!response.ok) {
      throw new Error(`Failed to load product details: ${response.status}`)
    }

    const product = await response.json()
    console.log("Product data:", product)

    currentProduct = product
    renderProductDetails(product)
    updateBreadcrumb(product.item_name)
  } catch (error) {
    console.error("Error loading product:", error)
    showError("Loading Error", "Failed to load product details. Please try again later.")
  }
}

// Render product details
function renderProductDetails(product) {
  const container = document.getElementById("productContainer")

  // Create variants array
  const variants = []
  for (let i = 1; i <= 4; i++) {
    const packing = product[`packing_0${i}`]
    const price = product[`price_0${i}`]
    if (packing && price) {
      variants.push({ packing, price })
    }
  }

  // Calculate discount
  let discountPercentage = 0
  if (product.original_price && product.price_01) {
    discountPercentage = Math.round(((product.original_price - product.price_01) / product.original_price) * 100)
  }

  container.innerHTML = `
        <div class="product-layout">
            <div class="product-gallery">
                <div class="product-image" id="mainProductImage">
                    ${product.icon || "🍪"}
                </div>
                <div class="product-thumbnails">
                    <div class="thumbnail active" onclick="changeProductImage('${product.icon || "🍪"}')">
                        ${product.icon || "🍪"}
                    </div>
                    <div class="thumbnail" onclick="changeProductImage('🥨')">🥨</div>
                    <div class="thumbnail" onclick="changeProductImage('🍩')">🍩</div>
                    <div class="thumbnail" onclick="changeProductImage('🍰')">🍰</div>
                </div>
            </div>
            
            <div class="product-info">
                <div class="product-header">
                    <div class="product-category">${product.category || "Snack"}</div>
                    <h1 class="product-title">${product.item_name}</h1>
                    
                    <div class="product-rating">
                        <div class="stars">
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star-half-alt"></i>
                        </div>
                        <span class="rating-count">(${Math.floor(Math.random() * 100) + 50} reviews)</span>
                    </div>
                    
                    <div class="product-price-container">
                        <div class="product-price" id="currentPrice">₹${product.price_01?.toFixed(2) || "N/A"}</div>
                        ${
                          product.original_price
                            ? `
                            <div class="product-original-price">₹${product.original_price.toFixed(2)}</div>
                            <div class="product-discount">${discountPercentage}% OFF</div>
                        `
                            : ""
                        }
                    </div>
                </div>
                
                <div class="product-description">
                    ${product.description || "No description available for this product."}
                </div>
                
                <div class="product-meta">
                    ${
                      product.shelf_life_days
                        ? `
                        <div class="meta-item">
                            <i class="fas fa-calendar-alt"></i>
                            <div class="meta-item-content">
                                <h4>Shelf Life</h4>
                                <p>${product.shelf_life_days} days</p>
                            </div>
                        </div>
                    `
                        : ""
                    }
                    
                    ${
                      product.lead_time_days
                        ? `
                        <div class="meta-item">
                            <i class="fas fa-truck"></i>
                            <div class="meta-item-content">
                                <h4>Delivery Time</h4>
                                <p>${product.lead_time_days} days</p>
                            </div>
                        </div>
                    `
                        : ""
                    }
                    
                    <div class="meta-item">
                        <i class="fas fa-shield-alt"></i>
                        <div class="meta-item-content">
                            <h4>Quality Guarantee</h4>
                            <p>100% Fresh & Premium</p>
                        </div>
                    </div>
                </div>
                
                ${
                  variants.length > 0
                    ? `
                    <div class="product-variants">
                        <h3 class="variants-title">Available Variants</h3>
                        <div class="variants-list">
                            ${variants
                              .map(
                                (v, i) => `
                                <div class="variant-item ${i === 0 ? "active" : ""}" 
                                    onclick="selectVariant(this, ${v.price})">
                                    <div class="variant-name">${v.packing}</div>
                                    <div class="variant-price">₹${v.price.toFixed(2)}</div>
                                </div>
                            `,
                              )
                              .join("")}
                        </div>
                    </div>
                `
                    : ""
                }
                
                <div class="product-actions">
                    <div class="quantity-selector">
                        <button class="quantity-btn" onclick="updateQuantity(-1)">-</button>
                        <input type="number" class="quantity-input" value="1" min="1" max="10" id="quantity" readonly>
                        <button class="quantity-btn" onclick="updateQuantity(1)">+</button>
                    </div>
                    
                    <button class="add-to-cart-btn" onclick="addToCartFromDetails(${product.id})">
                        <i class="fas fa-shopping-bag"></i>
                        Add to Cart
                    </button>
                    
                    <button class="wishlist-btn" onclick="toggleWishlist(this)">
                        <i class="far fa-heart"></i>
                    </button>
                </div>
                
                <div class="product-tabs">
                    <div class="tabs-header">
                        <button class="tab-btn active" onclick="switchTab(this, 'description')">Description</button>
                        <button class="tab-btn" onclick="switchTab(this, 'specifications')">Specifications</button>
                        <button class="tab-btn" onclick="switchTab(this, 'reviews')">Reviews</button>
                        <button class="tab-btn" onclick="switchTab(this, 'shipping')">Shipping</button>
                    </div>
                    
                    <div class="tab-content active" id="description">
                        <p>${product.description || "No description available for this product."}</p>
                        <p>Our products are made with the finest ingredients, ensuring a delightful experience with every bite. Perfect for snacking at home, gifting to loved ones, or enjoying during special occasions.</p>
                    </div>
                    
                    <div class="tab-content" id="specifications">
                        <ul>
                            <li><strong>Category:</strong> ${product.category || "N/A"}</li>
                            <li><strong>Weight:</strong> ${product.packing_01 || "N/A"}</li>
                            <li><strong>Shelf Life:</strong> ${product.shelf_life_days || "N/A"} days</li>
                            <li><strong>Delivery Time:</strong> ${product.lead_time_days || "N/A"} days</li>
                            <li><strong>Storage:</strong> Store in a cool, dry place</li>
                            <li><strong>Ingredients:</strong> Premium quality ingredients (see packaging for details)</li>
                        </ul>
                    </div>
                    
                    <div class="tab-content" id="reviews">
                        <p>Customer reviews will be displayed here. Be the first to review this product!</p>
                        <div style="margin-top: 2rem; padding: 1rem; background: var(--background-light); border-radius: 8px;">
                            <h4>Write a Review</h4>
                            <p>Share your experience with this product to help other customers make informed decisions.</p>
                        </div>
                    </div>
                    
                    <div class="tab-content" id="shipping">
                        <h4>Shipping Information</h4>
                        <p>We ship all across India. Standard delivery takes 3-5 business days.</p>
                        <ul>
                            <li>Free shipping on orders above ₹500</li>
                            <li>Express delivery available in major cities</li>
                            <li>Secure packaging to ensure freshness</li>
                        </ul>
                        
                        <h4>Return Policy</h4>
                        <p>If you're not satisfied with your purchase, you can return it within 7 days for a full refund or replacement.</p>
                        <ul>
                            <li>Items must be in original packaging</li>
                            <li>Perishable items have different return policies</li>
                            <li>Contact customer service for return requests</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `
}

// Load related products from backend
async function loadRelatedProducts() {
  try {
    const response = await fetch(`${API_BASE_URL}/products`)

    if (!response.ok) {
      throw new Error(`Failed to load related products: ${response.status}`)
    }

    const products = await response.json()

    // Filter out current product and get up to 4 related products
    const relatedProducts = products.filter((p) => currentProduct && p.id !== currentProduct.id).slice(0, 4)

    renderRelatedProducts(relatedProducts)
  } catch (error) {
    console.error("Error loading related products:", error)
    const container = document.getElementById("relatedGrid")
    container.innerHTML =
      '<p style="text-align: center; color: var(--text-light);">Failed to load related products.</p>'
  }
}

// Render related products
function renderRelatedProducts(products) {
  const container = document.getElementById("relatedGrid")

  if (products.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: var(--text-light);">No related products found.</p>'
    return
  }

  container.innerHTML = products
    .map(
      (product) => `
        <div class="product-card" onclick="goToProduct(${product.id})">
            <div class="product-image">
                ${product.icon || "🍪"}
            </div>
            <div class="product-info">
                <h3>${product.item_name}</h3>
                <p class="product-description">${(product.description || "").substring(0, 80)}...</p>
                <div class="product-price">₹${product.price_01?.toFixed(2) || "N/A"}</div>
                <button class="add-to-cart" onclick="event.stopPropagation(); addToCart(${product.id})">
                    <i class="fas fa-shopping-bag"></i>
                    Add to Cart
                </button>
            </div>
        </div>
    `,
    )
    .join("")
}

// Utility functions
function changeProductImage(emoji) {
  document.getElementById("mainProductImage").textContent = emoji

  // Update active thumbnail
  document.querySelectorAll(".thumbnail").forEach((thumb) => {
    thumb.classList.remove("active")
    if (thumb.textContent.trim() === emoji) {
      thumb.classList.add("active")
    }
  })
}

function selectVariant(element, price) {
  document.querySelectorAll(".variant-item").forEach((item) => {
    item.classList.remove("active")
  })
  element.classList.add("active")
  document.getElementById("currentPrice").textContent = `₹${price.toFixed(2)}`
}

function updateQuantity(change) {
  const input = document.getElementById("quantity")
  const currentValue = Number.parseInt(input.value)
  const newValue = Math.max(1, Math.min(10, currentValue + change))
  input.value = newValue
}

function toggleWishlist(button) {
  button.classList.toggle("active")

  if (button.classList.contains("active")) {
    button.innerHTML = '<i class="fas fa-heart"></i>'
    showToast("Added to wishlist!", "success")
  } else {
    button.innerHTML = '<i class="far fa-heart"></i>'
    showToast("Removed from wishlist", "info")
  }
}

function switchTab(button, tabId) {
  // Update active button
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.remove("active")
  })
  button.classList.add("active")

  // Update active content
  document.querySelectorAll(".tab-content").forEach((content) => {
    content.classList.remove("active")
  })
  document.getElementById(tabId).classList.add("active")
}

// Cart functions
function addToCartFromDetails(productId) {
  const quantity = Number.parseInt(document.getElementById("quantity").value)
  const selectedVariant = document.querySelector(".variant-item.active")
  let variantInfo = null

  if (selectedVariant) {
    const variantName = selectedVariant.querySelector(".variant-name").textContent
    const variantPrice = Number.parseFloat(selectedVariant.querySelector(".variant-price").textContent.replace("₹", ""))
    variantInfo = { name: variantName, price: variantPrice }
  }

  addToCart(productId, quantity, variantInfo)
}

async function addToCart(productId, quantity = 1, variantInfo = null) {
  const button = document.querySelector(".add-to-cart-btn") || event.target

  // Disable button temporarily
  if (button) {
    button.disabled = true
    const originalText = button.innerHTML
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...'

    setTimeout(() => {
      button.disabled = false
      button.innerHTML = originalText
    }, 1000)
  }

  try {
    let product = currentProduct

    // If we don't have the current product, fetch it from the backend
    if (!product) {
      const response = await fetch(`${API_BASE_URL}/products/${productId}`)
      if (response.ok) {
        product = await response.json()
      } else {
        throw new Error("Product not found")
      }
    }

    if (!product) {
      showToast("Product not found", "error")
      return
    }

    // Check if product already in cart
    const existingItemIndex = cart.findIndex(
      (item) =>
        item.id === Number.parseInt(productId) &&
        ((!item.variant && !variantInfo) || item.variant === variantInfo?.name),
    )

    if (existingItemIndex !== -1) {
      cart[existingItemIndex].quantity += quantity
    } else {
      // Add new item to cart
      const cartItem = {
        id: Number.parseInt(productId),
        name: product.item_name,
        price: variantInfo ? variantInfo.price : product.price_01,
        description: product.description,
        icon: product.icon || "🍪",
        category: product.category,
        quantity: quantity,
        variant: variantInfo ? variantInfo.name : null,
      }
      cart.push(cartItem)
    }

    // Save to localStorage
    localStorage.setItem("cart", JSON.stringify(cart))

    // Update cart count
    updateCartCount()
    renderCartItems()

    // Show success message
    showToast(`${product.item_name} added to cart!`, "success")

    // Add animation effect
    animateAddToCart(button)
  } catch (error) {
    console.error("Error adding to cart:", error)
    showToast("Failed to add item to cart", "error")
  }
}

function animateAddToCart(button) {
  const cartIcon = document.querySelector(".cart-icon")
  if (cartIcon && button) {
    cartIcon.classList.add("pulse")
    setTimeout(() => cartIcon.classList.remove("pulse"), 300)
  }
}

function updateCartCount() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  document.getElementById("cartCount").textContent = totalItems
  document.getElementById("cartBadge").textContent = totalItems

  // Update checkout button state
  const checkoutBtn = document.getElementById("checkoutBtn")
  if (checkoutBtn) {
    checkoutBtn.disabled = totalItems === 0
  }
}

function toggleCart() {
  const sidebar = document.getElementById("cartSidebar")
  const overlay = document.getElementById("cartOverlay")

  sidebar.classList.toggle("open")
  overlay.classList.toggle("open")

  if (sidebar.classList.contains("open")) {
    renderCartItems()
  }
}

function renderCartItems() {
  const container = document.getElementById("cartContent")

  if (cart.length === 0) {
    container.innerHTML = `
            <div class="empty-cart">
                <div class="empty-icon">🛒</div>
                <h4>Your cart is empty</h4>
                <p>Add some delicious snacks to get started!</p>
            </div>
        `
    document.getElementById("cartTotal").textContent = "0"
    return
  }

  const cartHTML = cart
    .map(
      (item) => `
        <div class="cart-item">
            <div class="cart-item-image">${item.icon}</div>
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                ${item.variant ? `<div class="cart-item-variant">${item.variant}</div>` : ""}
                <div class="cart-item-price">₹${item.price.toFixed(2)}</div>
                <div class="cart-item-controls">
                    <div class="cart-item-qty">
                        <button class="qty-btn" onclick="updateCartItemQuantity(${item.id}, '${item.variant || ""}', -1)">-</button>
                        <span class="qty-display">${item.quantity}</span>
                        <button class="qty-btn" onclick="updateCartItemQuantity(${item.id}, '${item.variant || ""}', 1)">+</button>
                    </div>
                    <button class="remove-item" onclick="removeFromCart(${item.id}, '${item.variant || ""}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `,
    )
    .join("")

  container.innerHTML = cartHTML

  // Update total
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  document.getElementById("cartTotal").textContent = total.toFixed(2)
}

function updateCartItemQuantity(productId, variant, change) {
  const itemIndex = cart.findIndex(
    (item) => item.id === Number.parseInt(productId) && ((!item.variant && !variant) || item.variant === variant),
  )

  if (itemIndex !== -1) {
    cart[itemIndex].quantity += change

    if (cart[itemIndex].quantity <= 0) {
      cart.splice(itemIndex, 1)
    }

    localStorage.setItem("cart", JSON.stringify(cart))
    updateCartCount()
    renderCartItems()
  }
}

function removeFromCart(productId, variant) {
  const itemIndex = cart.findIndex(
    (item) => item.id === Number.parseInt(productId) && ((!item.variant && !variant) || item.variant === variant),
  )

  if (itemIndex !== -1) {
    const removedItem = cart[itemIndex]
    cart.splice(itemIndex, 1)
    localStorage.setItem("cart", JSON.stringify(cart))
    updateCartCount()
    renderCartItems()
    showToast(`${removedItem.name} removed from cart`, "info")
  }
}

// Navigation functions
function goToProduct(productId) {
  window.location.href = `?id=${productId}`
}

function performSearch() {
  const searchInput = document.getElementById("searchInput")
  const query = searchInput.value.trim()

  if (query) {
    // In a real app, this would navigate to search results
    window.location.href = `/products?search=${encodeURIComponent(query)}`
  }
}

function openLocationModal() {
  showToast("Location selector coming soon!", "info")
}

// Utility functions
function updateBreadcrumb(productName) {
  document.getElementById("breadcrumbProduct").textContent = productName
  document.title = `${productName} - SnackMart`
}

function showError(title, message) {
  const container = document.getElementById("productContainer")
  container.innerHTML = `
        <div class="error-container">
            <div class="error-icon">
                <i class="fas fa-exclamation-circle"></i>
            </div>
            <h2 class="error-title">${title}</h2>
            <p class="error-message">${message}</p>
            <a href="/" class="back-to-products">
                <i class="fas fa-arrow-left"></i>
                Back to Home
            </a>
        </div>
    `
}

function showToast(message, type = "success") {
  const toast = document.getElementById("toast")
  const toastMessage = toast.querySelector(".toast-message")
  const toastIcon = toast.querySelector(".toast-icon")

  toastMessage.textContent = message

  // Reset classes
  toast.className = "toast"

  if (type === "success") {
    toastIcon.className = "toast-icon fas fa-check-circle"
  } else if (type === "error") {
    toastIcon.className = "toast-icon fas fa-exclamation-circle"
    toast.classList.add("error")
  } else {
    toastIcon.className = "toast-icon fas fa-info-circle"
  }

  toast.classList.add("show")

  // Auto hide after 3 seconds
  setTimeout(() => {
    toast.classList.remove("show")
  }, 3000)
}

function hideToast() {
  document.getElementById("toast").classList.remove("show")
}

// Initialize cart on page load
document.addEventListener("DOMContentLoaded", () => {
  updateCartCount()
  renderCartItems()
})

// Handle URL changes for navigation
window.addEventListener("popstate", () => {
  loadProductDetails()
})

// Close cart when clicking outside
document.addEventListener("click", (e) => {
  const cartSidebar = document.getElementById("cartSidebar")
  const cartContainer = document.querySelector(".cart-container")

  if (cartSidebar.classList.contains("open") && !cartSidebar.contains(e.target) && !cartContainer.contains(e.target)) {
    toggleCart()
  }
})

// Handle search on Enter key
document.getElementById("searchInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    performSearch()
  }
})

// Error handling for network requests
window.addEventListener("online", () => {
  showToast("Connection restored", "success")
})

window.addEventListener("offline", () => {
  showToast("No internet connection", "error")
})
