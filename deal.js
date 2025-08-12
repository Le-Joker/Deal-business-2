// App State
let currentUser = null;
let cart = [];
let products = [];
let filteredProducts = [];
let currentFilter = "all";

// Bootstrap instances
let authModal, cartOffcanvas, alertModal, confirmDeleteModal;

// Initialize App
document.addEventListener("DOMContentLoaded", function () {
  // Initialize Bootstrap components
  authModal = new bootstrap.Modal(document.getElementById("authModal"));
  cartOffcanvas = new bootstrap.Offcanvas(
    document.getElementById("cartOffcanvas")
  );
  alertModal = new bootstrap.Modal(document.getElementById("alertModal"));
  confirmDeleteModal = new bootstrap.Modal(
    document.getElementById("confirmDeleteModal")
  );

  initializeProducts();
  loadFeaturedProducts();
  loadAllProducts();
  updateCartUI();

  // Check if user is logged in
  const savedUser = sessionStorage.getItem("currentUser");
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    updateAuthState();
  }

  // Load sample data if not exists
  initializeSampleData();

  // Adjust main content based on screen size
  adjustMainContent();
  window.addEventListener("resize", adjustMainContent);
});

// Sample Data Initialization
function initializeSampleData() {
  if (!sessionStorage.getItem("users")) {
    const sampleUsers = [
      {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        phone: "+237 6 00 00 00 00",
        password: "123456",
        address: "Douala, Cameroun",
        memberSince: "2024",
        totalOrders: 5,
        totalFormations: 2,
        loyaltyPoints: 250,
      },
    ];
    sessionStorage.setItem("users", JSON.stringify(sampleUsers));
  }

  if (!sessionStorage.getItem("orders")) {
    const sampleOrders = [
      {
        id: 1,
        userId: 1,
        date: "2024-01-15",
        status: "completed",
        total: 1299,
        items: [{ name: "iPhone 15 Pro Max", price: 1299, quantity: 1 }],
      },
      {
        id: 2,
        userId: 1,
        date: "2024-01-20",
        status: "pending",
        total: 279,
        items: [{ name: "AirPods Pro 2", price: 279, quantity: 1 }],
      },
    ];
    sessionStorage.setItem("orders", JSON.stringify(sampleOrders));
  }
}

// Products Data
function initializeProducts() {
  products = [
    {
      id: 1,
      name: "iPhone 15 Pro Max",
      price: 1299,
      category: "smartphones",
      description:
        "Le dernier iPhone avec processeur A17 Pro et appareil photo professionnel.",
      emoji: "📱",
      featured: true,
    },
    {
      id: 2,
      name: "MacBook Pro M3",
      price: 2299,
      category: "laptops",
      description:
        "Ordinateur portable ultra-performant avec puce M3 et écran Retina.",
      emoji: "💻",
      featured: true,
    },
    {
      id: 3,
      name: "AirPods Pro 2",
      price: 279,
      category: "accessories",
      description: "Écouteurs sans fil avec réduction de bruit active.",
      emoji: "🎧",
      featured: true,
    },
    {
      id: 4,
      name: "Samsung Galaxy S24 Ultra",
      price: 1399,
      category: "smartphones",
      description: "Smartphone haut de gamme avec S Pen et zoom 200x.",
      emoji: "📱",
    },
    {
      id: 5,
      name: "Gaming Laptop RTX 4080",
      price: 2799,
      category: "gaming",
      description: "PC portable gaming avec RTX 4080 et écran 240Hz.",
      emoji: "🎮",
    },
    {
      id: 6,
      name: "Wireless Charger",
      price: 49,
      category: "accessories",
      description: "Chargeur sans fil rapide compatible tous appareils.",
      emoji: "🔌",
    },
    {
      id: 7,
      name: 'iPad Pro 12.9"',
      price: 1099,
      category: "tablets",
      description:
        "Tablette professionnelle avec puce M2 et écran Liquid Retina.",
      emoji: "📱",
    },
    {
      id: 8,
      name: "Gaming Keyboard RGB",
      price: 159,
      category: "gaming",
      description:
        "Clavier mécanique gaming avec éclairage RGB personnalisable.",
      emoji: "⌨️",
    },
  ];

  filteredProducts = [...products];
}

// Navigation Functions
function showSection(sectionId) {
  // Hide all sections
  document.querySelectorAll(".content-section").forEach((section) => {
    section.classList.add("d-none");
  });

  // Show target section
  document.getElementById(sectionId).classList.remove("d-none");

  // Update nav items
  document.querySelectorAll(".nav-link-custom").forEach((item) => {
    item.classList.remove("active");
  });

  // Activate corresponding nav item
  const navItem = document.getElementById(`nav-${sectionId}`);
  if (navItem) {
    navItem.classList.add("active");
  }

  // Close sidebar on mobile
  if (window.innerWidth <= 992) {
    document.getElementById("sidebar").classList.remove("show");
  }

  // Load specific data when needed
  if (sectionId === "orders" && currentUser) {
    loadOrders();
  }
}

function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("show");
}

function adjustMainContent() {
  const mainContent = document.querySelector(".main-content-offset");
  if (window.innerWidth <= 992) {
    mainContent.style.marginLeft = "0";
  } else {
    mainContent.style.marginLeft = "280px";
  }
}

// Products Functions
function loadFeaturedProducts() {
  const container = document.getElementById("featuredProducts");
  const featured = products.filter((p) => p.featured);

  // Initialiser le contenu du carrousel
  container.innerHTML = featured
    .map(
      (product, index) => `
      <div class="carousel-item ${index === 0 ? "active" : ""}">
        <div class="card glass-card text-white">
          <div class="product-image">${product.emoji}</div>
          <div class="card-body">
            <h5 class="card-title">${product.name}</h5>
            <div class="product-price mb-3">${product.price} €</div>
            <p class="card-text">${product.description}</p>
            <button class="btn btn-primary-custom btn-custom w-100" onclick="addToCart(${
              product.id
            })">
              <i class="bi bi-cart-plus me-2"></i>Ajouter au panier
            </button>
          </div>
        </div>
      </div>
    `
    )
    .join("");
}

function loadAllProducts() {
  renderProducts();
}

function renderProducts() {
  const container = document.getElementById("productsGrid");

  if (filteredProducts.length === 0) {
    container.innerHTML = `
                    <div class="col-12">
                        <div class="text-center py-5">
                            <div style="font-size: 4rem; opacity: 0.5;">🔍</div>
                            <h3>Aucun produit trouvé</h3>
                            <p class="text-white-50">Essayez de modifier vos critères de recherche</p>
                        </div>
                    </div>
                `;
    return;
  }

  container.innerHTML = filteredProducts
    .map((product) => createProductCard(product))
    .join("");
}

function createProductCard(product) {
  return `
                <div class="col-lg-6 col-xl-3">
                    <div class="card glass-card product-card h-100 text-white">
                        <div class="product-image">${product.emoji}</div>
                        <div class="card-body">
                            <h5 class="card-title">${product.name}</h5>
                            <div class="product-price mb-3">${product.price} €</div>
                            <p class="card-text">${product.description}</p>
                            <button class="btn btn-primary-custom btn-custom w-100" onclick="addToCart(${product.id})">
                                <i class="bi bi-cart-plus me-2"></i>Ajouter au panier
                            </button>
                        </div>
                    </div>
                </div>
            `;
}

// Filter and Search Functions
function filterByCategory(category) {
  currentFilter = category;

  // Update filter buttons
  document.querySelectorAll(".filter-pill").forEach((btn) => {
    btn.classList.remove("active");
  });
  event.target.classList.add("active");

  if (category === "all") {
    filteredProducts = [...products];
  } else {
    filteredProducts = products.filter(
      (product) => product.category === category
    );
  }

  renderProducts();
}

function filterProducts() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();

  if (searchTerm === "") {
    if (currentFilter === "all") {
      filteredProducts = [...products];
    } else {
      filteredProducts = products.filter(
        (product) => product.category === currentFilter
      );
    }
  } else {
    let baseProducts =
      currentFilter === "all"
        ? products
        : products.filter((product) => product.category === currentFilter);
    filteredProducts = baseProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
    );
  }

  renderProducts();
}

// Authentication Functions
function openAuthModal() {
  if (currentUser) {
    logout();
  } else {
    authModal.show();
  }
}

function showAuthForm(form) {
  document.getElementById("authChoice").classList.add("d-none");
  document.getElementById(form + "Form").classList.remove("d-none");
}

function showAuthChoice() {
  document.getElementById("loginForm").classList.add("d-none");
  document.getElementById("registerForm").classList.add("d-none");
  document.getElementById("authChoice").classList.remove("d-none");

  // Clear form inputs
  document.querySelectorAll("#authModal input").forEach((input) => {
    input.value = "";
  });
}

function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  const users = JSON.parse(sessionStorage.getItem("users")) || [];
  const user = users.find((u) => u.email === email && u.password === password);

  if (user) {
    currentUser = user;
    sessionStorage.setItem("currentUser", JSON.stringify(currentUser));
    showAlertModal("Connexion réussie !", `Bienvenue ${user.name}`);
    authModal.hide();
    updateAuthState();
    updateProfileDisplay();
    showSection("profile");
  } else {
    showAlertModal("Erreur", "Email ou mot de passe incorrect.");
  }
}

function handleRegister(event) {
  event.preventDefault();
  const name = document.getElementById("registerName").value;
  const email = document.getElementById("registerEmail").value;
  const phone = document.getElementById("registerPhone").value;
  const password = document.getElementById("registerPassword").value;

  // Validation
  if (!name || !email || !phone || !password) {
    showAlertModal("Erreur", "Veuillez remplir tous les champs.");
    return;
  }

  if (password.length < 6) {
    showAlertModal(
      "Erreur",
      "Le mot de passe doit contenir au moins 6 caractères."
    );
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showAlertModal("Erreur", "Veuillez entrer une adresse email valide.");
    return;
  }

  const users = JSON.parse(sessionStorage.getItem("users")) || [];
  const existingUser = users.find((u) => u.email === email);

  if (existingUser) {
    showAlertModal("Erreur", "Cet email est déjà utilisé.");
    return;
  }

  const newUser = {
    id: users.length + 1,
    name: name.trim(),
    email: email.toLowerCase().trim(),
    phone: phone.trim(),
    password,
    address: "Non renseignée",
    memberSince: new Date().getFullYear().toString(),
    totalOrders: 0,
    totalFormations: 0,
    loyaltyPoints: 100,
  };

  users.push(newUser);
  sessionStorage.setItem("users", JSON.stringify(users));

  // Auto login after registration
  currentUser = newUser;
  sessionStorage.setItem("currentUser", JSON.stringify(currentUser));

  showAlertModal(
    "Inscription réussie !",
    `Bienvenue ${name} ! Vous avez reçu 100 points de bienvenue.`
  );
  authModal.hide();
  updateAuthState();
  updateProfileDisplay();
  showSection("profile");
}

function updateAuthState() {
  const authBtn = document.getElementById("authBtn");
  const authBtnText = document.getElementById("authBtnText");
  const userProfile = document.getElementById("userProfile");
  const userInitials = document.getElementById("userInitials");

  if (currentUser) {
    authBtnText.innerText = "Déconnexion";
    userInitials.innerText = currentUser.name.charAt(0).toUpperCase();
    userProfile.classList.remove("d-none");
    updateProfileDisplay();
  } else {
    authBtnText.innerText = "Connexion";
    userProfile.classList.add("d-none");
  }
}

function updateProfileDisplay() {
  if (!currentUser) return;

  const elements = {
    profileName: currentUser.name,
    profileEmail: currentUser.email,
    displayName: currentUser.name,
    displayEmail: currentUser.email,
    displayPhone: currentUser.phone,
    displayAddress: currentUser.address,
    totalOrders: currentUser.totalOrders,
    totalFormations: currentUser.totalFormations,
    memberSince: "Janvier " + currentUser.memberSince,
    loyaltyPoints: currentUser.loyaltyPoints,
  };

  Object.keys(elements).forEach((id) => {
    const element = document.getElementById(id);
    if (element) element.innerText = elements[id];
  });

  const profileAvatar = document.getElementById("profileAvatar");
  if (profileAvatar) {
    profileAvatar.innerText = currentUser.name.charAt(0).toUpperCase();
  }
}

function logout() {
  currentUser = null;
  sessionStorage.removeItem("currentUser");
  updateAuthState();
  showSection("home");
  showAlertModal("Déconnexion", "Vous avez été déconnecté avec succès.");
}

// Cart Functions
function addToCart(productId) {
  const product = products.find((p) => p.id === productId);
  if (!product) return;

  const existingItem = cart.find((item) => item.id === productId);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      emoji: product.emoji,
      quantity: 1,
    });
  }

  updateCartUI();
  showAlertModal("Produit ajouté", `${product.name} a été ajouté au panier !`);
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  updateCartUI();
}

function updateCartQuantity(productId, change) {
  const item = cart.find((item) => item.id === productId);
  if (item) {
    item.quantity += change;
    if (item.quantity <= 0) {
      removeFromCart(productId);
    } else {
      updateCartUI();
    }
  }
}

function updateCartUI() {
  const cartCount = document.getElementById("cartCount");
  const cartItems = document.getElementById("cartItems");
  const cartTotal = document.getElementById("cartTotal");
  const checkoutBtn = document.getElementById("checkoutBtn");

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  cartCount.innerText = totalItems;

  if (cart.length === 0) {
    cartItems.innerHTML = `
                    <div class="cart-empty">
                        <div style="font-size: 3rem; opacity: 0.5;">🛒</div>
                        <p>Votre panier est vide</p>
                        <small>Ajoutez des produits pour commencer</small>
                    </div>
                `;
    checkoutBtn.disabled = true;
  } else {
    cartItems.innerHTML = cart
      .map(
        (item) => `
                    <div class="cart-item">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <div class="d-flex align-items-center">
                                    <span style="font-size: 1.5rem; margin-right: 0.5rem;">${item.emoji}</span>
                                    <div>
                                        <h6 class="mb-0">${item.name}</h6>
                                        <small class="text-white-50">${item.price} € × ${item.quantity}</small>
                                    </div>
                                </div>
                            </div>
                            <div class="d-flex align-items-center gap-2">
                                <button class="btn btn-sm btn-outline-primary" onclick="updateCartQuantity(${item.id}, -1)">
                                    <i class="bi bi-dash"></i>
                                </button>
                                <span class="mx-2">${item.quantity}</span>
                                <button class="btn btn-sm btn-outline-primary" onclick="updateCartQuantity(${item.id}, 1)">
                                    <i class="bi bi-plus"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger ms-2" onclick="removeFromCart(${item.id})">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `
      )
      .join("");
    checkoutBtn.disabled = false;
  }

  cartTotal.innerHTML = `Total: ${totalPrice} €`;
}

function toggleCart() {
  cartOffcanvas.show();
}

function checkout() {
  if (!currentUser) {
    showAlertModal(
      "Connexion requise",
      "Veuillez vous connecter pour passer une commande."
    );
    cartOffcanvas.hide();
    authModal.show();
    return;
  }

  if (cart.length === 0) {
    showAlertModal(
      "Panier vide",
      "Ajoutez des produits avant de procéder au paiement."
    );
    return;
  }

  // Create new order
  const orders = JSON.parse(sessionStorage.getItem("orders")) || [];
  const newOrder = {
    id: orders.length + 1,
    userId: currentUser.id,
    date: new Date().toISOString().split("T")[0],
    status: "pending",
    total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    items: cart.map((item) => ({
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
  };

  orders.push(newOrder);
  sessionStorage.setItem("orders", JSON.stringify(orders));

  // Update user stats
  currentUser.totalOrders += 1;
  currentUser.loyaltyPoints += Math.floor(newOrder.total / 10);

  const users = JSON.parse(sessionStorage.getItem("users")) || [];
  const userIndex = users.findIndex((u) => u.id === currentUser.id);
  if (userIndex !== -1) {
    users[userIndex] = currentUser;
    sessionStorage.setItem("users", JSON.stringify(users));
  }
  sessionStorage.setItem("currentUser", JSON.stringify(currentUser));

  // Clear cart
  cart = [];
  updateCartUI();
  cartOffcanvas.hide();

  showAlertModal(
    "Commande confirmée !",
    `Votre commande #${newOrder.id} a été créée. Vous avez gagné ${Math.floor(
      newOrder.total / 10
    )} points !`
  );
  showSection("orders");
}

// Orders Functions
function loadOrders() {
  if (!currentUser) return;

  const orders = JSON.parse(sessionStorage.getItem("orders")) || [];
  const userOrders = orders.filter((order) => order.userId === currentUser.id);
  const container = document.getElementById("ordersContainer");

  if (userOrders.length === 0) {
    container.innerHTML = `
                    <div class="text-center py-5">
                        <div style="font-size: 4rem; opacity: 0.5;">📦</div>
                        <h3>Aucune commande</h3>
                        <p class="text-white-50">Vous n'avez pas encore passé de commande</p>
                        <button class="btn btn-primary-custom btn-custom" onclick="showSection('products')">
                            Commencer à acheter
                        </button>
                    </div>
                `;
    return;
  }

  container.innerHTML = userOrders
    .map(
      (order) => `
                <div class="card glass-card order-card">
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6">
                                <h5>Commande #${order.id}</h5>
                                <p class="text-white-50 mb-2">
                                    <i class="bi bi-calendar me-2"></i>${new Date(
                                      order.date
                                    ).toLocaleDateString("fr-FR")}
                                </p>
                                <span class="badge ${getStatusClass(
                                  order.status
                                )}">${getStatusText(order.status)}</span>
                            </div>
                            <div class="col-md-6 text-md-end">
                                <h4 class="text-gradient">${order.total} €</h4>
                                <p class="text-white-50 mb-0">${
                                  order.items.length
                                } article(s)</p>
                            </div>
                        </div>
                        <hr class="border-primary">
                        <div class="row">
                            ${order.items
                              .map(
                                (item) => `
                                <div class="col-md-6">
                                    <small>${item.name} × ${item.quantity}</small>
                                </div>
                            `
                              )
                              .join("")}
                        </div>
                    </div>
                </div>
            `
    )
    .join("");
}

function getStatusClass(status) {
  switch (status) {
    case "pending":
      return "status-pending";
    case "completed":
      return "status-completed";
    case "cancelled":
      return "status-cancelled";
    default:
      return "status-pending";
  }
}

function getStatusText(status) {
  switch (status) {
    case "pending":
      return "En attente";
    case "completed":
      return "Terminé";
    case "cancelled":
      return "Annulé";
    default:
      return "En attente";
  }
}

// Formation Functions
function enrollFormation(formationId) {
  if (!currentUser) {
    showAlertModal(
      "Connexion requise",
      "Veuillez vous connecter pour vous inscrire à une formation."
    );
    authModal.show();
    return;
  }

  const formations = {
    "import-export": { name: "Formation Import Export", price: 149 },
    smartphones: { name: "Importation de Téléphones", price: 99 },
    electronics: { name: "Importation d'Électronique", price: 129 },
    business: { name: "Business Development", price: 199 },
  };

  const formation = formations[formationId];
  if (!formation) return;

  // Update user stats
  currentUser.totalFormations += 1;
  currentUser.loyaltyPoints += 50;

  const users = JSON.parse(sessionStorage.getItem("users")) || [];
  const userIndex = users.findIndex((u) => u.id === currentUser.id);
  if (userIndex !== -1) {
    users[userIndex] = currentUser;
    sessionStorage.setItem("users", JSON.stringify(users));
  }
  sessionStorage.setItem("currentUser", JSON.stringify(currentUser));

  showAlertModal(
    "Inscription confirmée !",
    `Vous êtes inscrit à la formation "${formation.name}". Vous avez gagné 50 points !`
  );
  updateProfileDisplay();
}

// Contact Functions
function contactVia(method) {
  switch (method) {
    case "email":
      window.location.href = "mailto:contact@dealbusiness.com";
      break;
    case "whatsapp":
      window.open("https://wa.me/237600000000", "_blank");
      break;
    case "location":
      showAlertModal(
        "Localisation",
        "Nous sommes basés à Douala, Cameroun. Contactez-nous pour plus de détails sur notre adresse exacte."
      );
      break;
  }
}

// Profile Functions
function confirmDeleteAccount() {
  if (!currentUser) return;
  confirmDeleteModal.show();
}

function deleteAccount() {
  if (!currentUser) return;

  // Remove user from users array
  const users = JSON.parse(sessionStorage.getItem("users")) || [];
  const updatedUsers = users.filter((u) => u.id !== currentUser.id);
  sessionStorage.setItem("users", JSON.stringify(updatedUsers));

  // Remove user orders
  const orders = JSON.parse(sessionStorage.getItem("orders")) || [];
  const updatedOrders = orders.filter((o) => o.userId !== currentUser.id);
  sessionStorage.setItem("orders", JSON.stringify(updatedOrders));

  // Logout user
  currentUser = null;
  sessionStorage.removeItem("currentUser");
  cart = [];
  updateAuthState();
  updateCartUI();

  confirmDeleteModal.hide();
  showAlertModal("Compte supprimé", "Votre compte a été supprimé avec succès.");
  showSection("home");
}

// Utility Functions
function showAlertModal(title, message) {
  document.getElementById("alertTitle").innerText = title;
  document.getElementById("alertMessage").innerText = message;
  alertModal.show();
}

// Click outside to close sidebar
document.addEventListener("click", function (event) {
  const sidebar = document.getElementById("sidebar");
  const toggleBtn = event.target.closest('[onclick="toggleSidebar()"]');

  if (
    !sidebar.contains(event.target) &&
    !toggleBtn &&
    sidebar.classList.contains("show")
  ) {
    if (window.innerWidth <= 992) {
      sidebar.classList.remove("show");
    }
  }
});

// Auto-hide alert modal after 3 seconds for success messages
document
  .getElementById("alertModal")
  .addEventListener("shown.bs.modal", function () {
    const title = document.getElementById("alertTitle").innerText;
    if (
      title.includes("réussie") ||
      title.includes("confirmée") ||
      title.includes("ajouté")
    ) {
      setTimeout(() => {
        alertModal.hide();
      }, 3000);
    }
  });
