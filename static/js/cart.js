// Cart functionality - Updated to fetch from backend
let cart = []

// Initialize page
document.addEventListener("DOMContentLoaded", () => {
  fetchCartFromBackend()
})

// Fetch cart data from backend
async function fetchCartFromBackend() {
  try {
    const response = await fetch("/cart") // Replace with your actual cart API endpoint
    if (!response.ok) throw new Error("Failed to fetch cart")

    cart = await response.json()
    // Save to localStorage when we get data from backend
    localStorage.setItem("cart", JSON.stringify(cart))
    loadCart()
    updateCartCount()
  } catch (error) {
    console.error("Error fetching cart:", error)
    // Fallback to localStorage if backend fails
    cart = JSON.parse(localStorage.getItem("cart")) || []
    loadCart()
    updateCartCount()
  }
}

// Load cart content
function loadCart() {
  const cartContent = document.getElementById("cartContent")

  if (cart.length === 0) {
    cartContent.innerHTML = `
            <div class="empty-cart">
                <div class="empty-cart-icon">
                    <i class="fas fa-shopping-cart"></i>
                </div>
                <h2>Your cart is empty</h2>
                <p>Looks like you haven't added any items to your cart yet.</p>
                <a href="/product" class="browse-products-btn">
                    <i class="fas fa-cookie-bite"></i> Browse Products
                </a>
            </div>
        `
    return
  }

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal >= 500 ? 0 : 50
  const total = subtotal + shipping

  cartContent.innerHTML = `
        <div class="cart-layout">
            <div class="cart-items">
                <h3>Cart Items (${cart.reduce((sum, item) => sum + item.quantity, 0)} items)</h3>
                ${cart
                  .map(
                    (item) => `
                    <div class="cart-item">
                        <div class="item-icon">${item.icon || "🍪"}</div>
                        <div class="item-details">
                            <h3>${item.name || item.item_name}</h3>
                            <p>${item.description || "No description available"}</p>
                            <div class="price">₹${item.price}</div>
                        </div>
                        <div class="item-actions">
                            <div class="quantity-controls">
                                <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">
                                    <i class="fas fa-minus"></i>
                                </button>
                                <span class="quantity">${item.quantity}</span>
                                <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                            <button class="remove-btn" onclick="removeFromCart(${item.id})">
                                <i class="fas fa-trash"></i> Remove
                            </button>
                        </div>
                    </div>
                `,
                  )
                  .join("")}
                <div class="continue-shopping-container">
                    <a href="/product" class="continue-shopping">
                        <i class="fas fa-arrow-left"></i> Continue Shopping
                    </a>
                </div>
            </div>
            
            <div class="cart-summary">
                <h3 class="summary-title">Order Summary</h3>
                <div class="summary-row">
                    <span>Subtotal:</span>
                    <span>₹${subtotal.toFixed(2)}</span>
                </div>
                <div class="summary-row">
                    <span>Shipping:</span>
                    <span>${shipping === 0 ? "Free" : "₹" + shipping.toFixed(2)}</span>
                </div>
                ${shipping === 0 ? "" : '<div class="shipping-note">Free shipping on orders above ₹500</div>'}
                <div class="summary-row total">
                    <span>Total:</span>
                    <span>₹${total.toFixed(2)}</span>
                </div>
                <button class="checkout-btn" onclick="proceedToCheckout()">
                    <i class="fas fa-credit-card"></i> Proceed to Checkout
                </button>
                <div class="secure-checkout">
                    <i class="fas fa-shield-alt"></i> Secure checkout guaranteed
                </div>
            </div>
        </div>
    `
}

// Update quantity
async function updateQuantity(productId, change) {
  try {
    const response = await fetch("/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_id: productId,
        change: change,
      }),
    })

    if (!response.ok) throw new Error("Failed to update cart")

    // Refresh cart from backend
    await fetchCartFromBackend()

    // Show toast
    const toast = document.createElement("div")
    toast.className = "toast success"
    toast.innerHTML = `
            <i class="fas fa-check-circle"></i>
            Cart updated
        `
    document.body.appendChild(toast)
    setTimeout(() => toast.remove(), 2000)
  } catch (error) {
    console.error("Error updating cart:", error)
    // Fallback to local update
    const item = cart.find((item) => item.id === productId)
    if (item) {
      item.quantity += change
      if (item.quantity <= 0) {
        removeFromCart(productId)
      } else {
        // Save to localStorage
        localStorage.setItem("cart", JSON.stringify(cart))
        loadCart()
        updateCartCount()
      }
    }
  }
}

// Remove from cart
async function removeFromCart(productId) {
  try {
    const response = await fetch("/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_id: productId,
      }),
    })

    if (!response.ok) throw new Error("Failed to remove item")

    const removedItem = cart.find((item) => item.id === productId)

    // Refresh cart from backend
    await fetchCartFromBackend()

    // Show toast
    if (removedItem) {
      const toast = document.createElement("div")
      toast.className = "toast success"
      toast.innerHTML = `
                <i class="fas fa-check-circle"></i>
                ${removedItem.name || removedItem.item_name} removed from cart
            `
      document.body.appendChild(toast)
      setTimeout(() => toast.remove(), 2000)
    }
  } catch (error) {
    console.error("Error removing from cart:", error)
    // Fallback to local removal
    cart = cart.filter((item) => item.id !== productId)
    // Save to localStorage
    localStorage.setItem("cart", JSON.stringify(cart))
    loadCart()
    updateCartCount()
  }
}

// Update cart count
// function updateCartCount() {
//   const cartCount = document.getElementById("cartCount")
//   if (cartCount) {
//     const total = cart.reduce((sum, item) => sum + item.quantity, 0)
//     cartCount.textContent = total
//     cartCount.style.display = total > 0 ? "flex" : "none"
//   }
// }
updateCartCount()

// Proceed to checkout
function proceedToCheckout() {
  if (cart.length === 0) {
    const toast = document.createElement("div")
    toast.className = "toast error"
    toast.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            Your cart is empty!
        `
    document.body.appendChild(toast)
    setTimeout(() => toast.remove(), 3000)
    return
  }

  // Show loading toast
  const toast = document.createElement("div")
  toast.className = "toast success"
  toast.innerHTML = `
        <i class="fas fa-spinner fa-spin"></i>
        Redirecting to checkout...
    `
  document.body.appendChild(toast)

  // Simulate redirect delay
  setTimeout(() => {
    window.location.href = "/checkout"
  }, 1500)
}
