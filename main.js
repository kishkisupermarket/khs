// ===== MAIN.JS - KISHKI SUPERMARKET =====
// هذا الملف يحتوي على كل JavaScript

// إدارة الصفحات
function showPage(pageId) {
    // إخفاء جميع الصفحات
    document.querySelectorAll('.page').forEach(page => {
        page.style.display = 'none';
    });
    
    // إظهار الصفحة المطلوبة
    const targetPage = document.getElementById(pageId + '-page');
    if (targetPage) {
        targetPage.style.display = 'block';
        window.scrollTo(0, 0);
        
        // تحميل المحتوى الديناميكي عند الحاجة
        if (pageId === 'products') {
            loadProductsPage();
        } else if (pageId === 'cart') {
            loadCartPage();
        }
    }
}

// عربة التسوق
class ShoppingCart {
    constructor() {
        this.items = [];
        this.total = 0;
        this.init();
    }
    
    init() {
        this.loadFromStorage();
        this.updateCartUI();
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart-btn')) {
                const productCard = e.target.closest('.product-card');
                if (productCard) {
                    this.addProduct({
                        id: e.target.dataset.id,
                        name: e.target.dataset.name,
                        price: parseFloat(e.target.dataset.price),
                        image: productCard.querySelector('img').src
                    });
                }
            }
        });
    }
    
    addProduct(product) {
        // البحث إذا كان المنتج موجود مسبقاً
        const existingItem = this.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity = (existingItem.quantity || 1) + 1;
        } else {
            product.quantity = 1;
            this.items.push(product);
        }
        
        this.calculateTotal();
        this.saveToStorage();
        this.updateCartUI();
        this.showAddedMessage(product.name);
    }
    
    calculateTotal() {
        this.total = this.items.reduce((sum, item) => {
            return sum + (item.price * (item.quantity || 1));
        }, 0);
    }
    
    updateCartUI() {
        const count = this.items.reduce((total, item) => total + (item.quantity || 1), 0);
        document.querySelectorAll('.cart-count').forEach(el => {
            el.textContent = count;
            el.style.display = count > 0 ? 'flex' : 'none';
        });
    }
    
    showAddedMessage(productName) {
        const button = event.target;
        const originalText = button.innerHTML;
        
        button.innerHTML = '<i class="fas fa-check"></i> Added!';
        button.style.background = '#27ae60';
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.style.background = '';
        }, 2000);
        
        this.showNotification(`Added to cart: ${productName}`);
    }
    
    showNotification(message) {
        // إنشاء عنصر الإشعار
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i> 
            <span>${message}</span>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        document.body.appendChild(notification);
        
        // إظهار الإشعار
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // إغلاق الإشعار
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        });
        
        // إزالة تلقائية بعد 5 ثواني
        setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.remove('show');
                setTimeout(() => {
                    notification.parentNode.removeChild(notification);
                }, 300);
            }
        }, 5000);
    }
    
    saveToStorage() {
        localStorage.setItem('kishki_cart', JSON.stringify({
            items: this.items,
            total: this.total
        }));
    }
    
    loadFromStorage() {
        const saved = localStorage.getItem('kishki_cart');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.items = data.items || [];
                this.total = data.total || 0;
            } catch (error) {
                console.error('Error loading cart from storage:', error);
                this.items = [];
                this.total = 0;
            }
        }
    }
    
    removeProduct(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.calculateTotal();
        this.saveToStorage();
        this.updateCartUI();
    }
    
    clearCart() {
        this.items = [];
        this.total = 0;
        this.saveToStorage();
        this.updateCartUI();
    }
    
    getItemCount() {
        return this.items.reduce((total, item) => total + (item.quantity || 1), 0);
    }
    
    getTotalPrice() {
        return this.total;
    }
}

// تحميل المنتجات من ملف JSON
async function loadProducts() {
    try {
        const response = await fetch('products.json');
        if (!response.ok) {
            throw new Error('Failed to load products');
        }
        const data = await response.json();
        return data.products || [];
    } catch (error) {
        console.error('Error loading products:', error);
        return [];
    }
}

// عرض المنتجات في الصفحة
async function displayProducts(container = '.products-grid') {
    const productsGrid = document.querySelector(container);
    if (!productsGrid) return;
    
    // إظهار حالة التحميل
    productsGrid.innerHTML = `
        <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading products...</p>
        </div>
    `;
    
    const products = await loadProducts();
    
    if (products.length === 0) {
        productsGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-box-open fa-3x"></i>
                <p>No products available at the moment</p>
            </div>
        `;
        return;
    }
    
    productsGrid.innerHTML = products.map(product => `
        <div class="product-card" data-product-id="${product.id}">
            ${product.discount ? `
                <div class="product-badge">
                    ${product.discount}% OFF
                </div>
            ` : ''}
            
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
                <div class="product-overlay">
                    <div class="product-actions">
                        <button class="action-btn quick-view" data-product-id="${product.id}">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn add-to-wishlist" data-product-id="${product.id}">
                            <i class="far fa-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="product-content">
                <span class="product-category">${product.category}</span>
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                
                <div class="product-rating">
                    <div class="stars">
                        ${generateStarRating(product.rating || 0)}
                    </div>
                    <span class="rating-count">(${product.reviewCount || 0})</span>
                </div>
                
                <div class="product-price">
                    <span class="current-price">$${product.price.toFixed(2)}</span>
                    ${product.oldPrice ? `
                        <span class="old-price">$${product.oldPrice.toFixed(2)}</span>
                    ` : ''}
                </div>
                
                <button class="add-to-cart-btn" 
                        data-id="${product.id}" 
                        data-name="${product.name}" 
                        data-price="${product.price}">
                    <i class="fas fa-shopping-cart"></i>
                    Add to Cart
                </button>
            </div>
        </div>
    `).join('');
}

// توليد تقييم النجوم
function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    
    if (halfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    
    return stars;
}

// تحميل صفحة المنتجات
async function loadProductsPage() {
    await displayProducts('#products-page .products-grid');
}

// تحميل صفحة السلة
function loadCartPage() {
    const cartContainer = document.querySelector('#cart-page .cart-items');
    if (!cartContainer) return;
    
    if (window.cart.items.length === 0) {
        cartContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart fa-3x"></i>
                <h3>Your cart is empty</h3>
                <p>Start shopping to add items to your cart</p>
                <button class="btn btn-primary" onclick="showPage('products')">
                    Continue Shopping
                </button>
            </div>
        `;
        return;
    }
    
    cartContainer.innerHTML = window.cart.items.map(item => `
        <div class="cart-item" data-product-id="${item.id}">
            <div class="item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            
            <div class="item-details">
                <h3 class="item-name">${item.name}</h3>
                <p class="item-price">$${item.price.toFixed(2)} each</p>
            </div>
            
            <div class="quantity-controls">
                <button class="quantity-btn quantity-decrease" data-product-id="${item.id}">
                    <i class="fas fa-minus"></i>
                </button>
                <span class="quantity-display">${item.quantity || 1}</span>
                <button class="quantity-btn quantity-increase" data-product-id="${item.id}">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
            
            <div class="item-total">
                <span class="total-price">$${(item.price * (item.quantity || 1)).toFixed(2)}</span>
            </div>
            
            <button class="remove-item-btn" data-product-id="${item.id}">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
}

// التنقل السلس
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// تهيئة الموقع عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log('KISHKI Supermarket - Website loaded');
    
    // تهيئة عربة التسوق
    window.cart = new ShoppingCart();
    
    // تحميل المنتجات في الصفحة الرئيسية
    displayProducts();
    
    // إضافة event listeners
    setupEventListeners();
});

// إعداد event listeners
function setupEventListeners() {
    // التنقل السلس للروابط
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            scrollToSection(targetId);
        });
    });
    
    // إدارة forms
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            // معالجة إرسال النموذج هنا
            alert('Form submission would be processed here');
        });
    });
}

// وظائف مساعدة
function formatPrice(price) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(price);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// جعل الوظائف متاحة globally
window.showPage = showPage;
window.scrollToSection = scrollToSection;
window.displayProducts = displayProducts;

// تهيئة عند تحميل الصفحة بالكامل
window.addEventListener('load', function() {
    console.log('Page fully loaded');
});

// إدارة errors
window.addEventListener('error', function(e) {
    console.error('JavaScript Error:', e.error);
});
