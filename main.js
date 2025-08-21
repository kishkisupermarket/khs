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
        this.showBrowserNotification('Product Added', `${productName} was added to your cart!`);
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
    
    showBrowserNotification(title, message) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                body: message,
                icon: 'https://images.unsplash.com/photo-1563841930606-67e2bce48b78?w=100&h=100&fit=crop'
            });
        }
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

// ===== PRODUCT FILTERING SYSTEM =====
let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
const productsPerPage = 8;
let currentFilters = {
    category: 'all',
    sort: 'default',
    search: ''
};

// تهيئة نظام التصفية
function initFilterSystem() {
    allProducts = [];
    filteredProducts = [];
    currentPage = 1;
    currentFilters = {
        category: 'all',
        sort: 'default',
        search: ''
    };

    // إعداد event listeners
    setupFilterListeners();
}

// إعداد event listeners للتصفية
function setupFilterListeners() {
    // البحث
    const searchInput = document.getElementById('productSearch');
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            currentFilters.search = e.target.value.toLowerCase();
            currentPage = 1;
            filterProducts();
        }, 300));
    }

    // تصفية الفئة
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', (e) => {
            currentFilters.category = e.target.value;
            currentPage = 1;
            filterProducts();
        });
    }

    // الترتيب
    const sortFilter = document.getElementById('sortFilter');
    if (sortFilter) {
        sortFilter.addEventListener('change', (e) => {
            currentFilters.sort = e.target.value;
            currentPage = 1;
            filterProducts();
        });
    }
}

// تصفية المنتجات
function filterProducts() {
    let results = [...allProducts];

    // التصفية بالبحث
    if (currentFilters.search) {
        results = results.filter(product => 
            product.name.toLowerCase().includes(currentFilters.search) ||
            product.description.toLowerCase().includes(currentFilters.search) ||
            product.category.toLowerCase().includes(currentFilters.search)
        );
    }

    // التصفية بالفئة
    if (currentFilters.category !== 'all') {
        results = results.filter(product => 
            product.category.toLowerCase() === currentFilters.category
        );
    }

    // الترتيب
    results = sortProducts(results, currentFilters.sort);

    filteredProducts = results;
    updateActiveFilters();
    displayFilteredProducts();
}

// ترتيب المنتجات
function sortProducts(products, sortType) {
    const sorted = [...products];
    
    switch (sortType) {
        case 'price-low':
            return sorted.sort((a, b) => a.price - b.price);
        case 'price-high':
            return sorted.sort((a, b) => b.price - a.price);
        case 'name':
            return sorted.sort((a, b) => a.name.localeCompare(b.name));
        case 'rating':
            return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        case 'newest':
            return sorted.sort((a, b) => {
                if (a.isNew && !b.isNew) return -1;
                if (!a.isNew && b.isNew) return 1;
                return 0;
            });
        default:
            return sorted;
    }
}

// تحديث التصفيات النشطة
function updateActiveFilters() {
    const activeFiltersContainer = document.getElementById('activeFilters');
    if (!activeFiltersContainer) return;

    activeFiltersContainer.innerHTML = '';

    // إضافة تصفية البحث
    if (currentFilters.search) {
        const searchFilter = createFilterTag('Search: ' + currentFilters.search, 'search');
        activeFiltersContainer.appendChild(searchFilter);
    }

    // إضافة تصفية الفئة
    if (currentFilters.category !== 'all') {
        const categoryName = currentFilters.category.charAt(0).toUpperCase() + currentFilters.category.slice(1);
        const categoryFilter = createFilterTag('Category: ' + categoryName, 'category');
        activeFiltersContainer.appendChild(categoryFilter);
    }

    // إضافة تصفية الترتيب
    if (currentFilters.sort !== 'default') {
        const sortNames = {
            'price-low': 'Price: Low to High',
            'price-high': 'Price: High to Low',
            'name': 'Name: A-Z',
            'rating': 'Highest Rated',
            'newest': 'Newest First'
        };
        const sortFilter = createFilterTag(sortNames[currentFilters.sort], 'sort');
        activeFiltersContainer.appendChild(sortFilter);
    }
}

// إنشاء وسم التصفية
function createFilterTag(text, type) {
    const tag = document.createElement('div');
    tag.className = 'filter-tag';
    tag.innerHTML = `
        <span>${text}</span>
        <button onclick="removeFilter('${type}')">
            <i class="fas fa-times"></i>
        </button>
    `;
    return tag;
}

// إزالة التصفية
function removeFilter(type) {
    switch (type) {
        case 'search':
            currentFilters.search = '';
            document.getElementById('productSearch').value = '';
            break;
        case 'category':
            currentFilters.category = 'all';
            document.getElementById('categoryFilter').value = 'all';
            break;
        case 'sort':
            currentFilters.sort = 'default';
            document.getElementById('sortFilter').value = 'default';
            break;
    }
    currentPage = 1;
    filterProducts();
}

// عرض المنتجات المصفاة
function displayFilteredProducts() {
    const productsGrid = document.getElementById('productsGrid');
    const productsCounter = document.getElementById('productsCounter');
    const pagination = document.getElementById('pagination');

    if (!productsGrid) return;

    // عرض حالة التحميل
    productsGrid.innerHTML = `
        <div class="products-loading">
            <div class="loading-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;

    setTimeout(() => {
        // التحقق إذا كانت هناك نتائج
        if (filteredProducts.length === 0) {
            productsGrid.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <h3>No products found</h3>
                    <p>Try adjusting your search or filter criteria</p>
                    <button class="btn btn-primary" onclick="clearAllFilters()">
                        Clear All Filters
                    </button>
                </div>
            `;
            if (productsCounter) productsCounter.textContent = '0 products found';
            if (pagination) pagination.innerHTML = '';
            return;
        }

        // تحديث عداد المنتجات
        if (productsCounter) {
            productsCounter.textContent = `${filteredProducts.length} product${filteredProducts.length !== 1 ? 's' : ''} found`;
        }

        // حساب Pagination
        const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
        const startIndex = (currentPage - 1) * productsPerPage;
        const endIndex = startIndex + productsPerPage;
        const currentProducts = filteredProducts.slice(startIndex, endIndex);

        // عرض المنتجات
        productsGrid.innerHTML = currentProducts.map(product => `
            <div class="product-card" data-product-id="${product.id}">
                ${product.discount ? `
                    <div class="product-badge">
                        ${product.discount}% OFF
                    </div>
                ` : ''}
                ${product.isNew ? `
                    <div class="product-badge" style="left: ${product.discount ? '80px' : '1rem'}; background: var(--accent);">
                        NEW
                    </div>
                ` : ''}

                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                    <div class="product-overlay">
                        <div class="product-actions">
                            <button class="action-btn quick-view" onclick="quickView(${product.id})">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="action-btn add-to-wishlist" onclick="addToWishlist(${product.id})">
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

        // عرض Pagination
        if (pagination && totalPages > 1) {
            updatePagination(totalPages);
        } else if (pagination) {
            pagination.innerHTML = '';
        }

    }, 500); // تأخير محاكاة للتحميل
}

// تحديث Pagination
function updatePagination(totalPages) {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;

    let paginationHTML = '';

    // زر السابق
    paginationHTML += `
        <button class="pagination-btn" onclick="changePage(${currentPage - 1})" 
                ${currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i>
        </button>
    `;

    // أرقام الصفحات
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button class="pagination-btn ${i === currentPage ? 'active' : ''}" 
                    onclick="changePage(${i})">
                ${i}
            </button>
        `;
    }

    // زر التالي
    paginationHTML += `
        <button class="pagination-btn" onclick="changePage(${currentPage + 1})" 
                ${currentPage === totalPages ? 'disabled' : ''}>
            <i class="fas fa-chevron-right"></i>
        </button>
    `;

    pagination.innerHTML = paginationHTML;
}

// تغيير الصفحة
function changePage(page) {
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    if (page < 1 || page > totalPages) return;

    currentPage = page;
    displayFilteredProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// مسح كل التصفيات
function clearAllFilters() {
    currentFilters = {
        category: 'all',
        sort: 'default',
        search: ''
    };

    document.getElementById('productSearch').value = '';
    document.getElementById('categoryFilter').value = 'all';
    document.getElementById('sortFilter').value = 'default';

    currentPage = 1;
    filterProducts();
}

// عرض سريع للمنتج
function quickView(productId) {
    const product = allProducts.find(p => p.id == productId);
    if (!product) return;

    alert(`Quick View: ${product.name}\nPrice: $${product.price}\n${product.description}`);
}

// إضافة للمفضلة
function addToWishlist(productId) {
    const product = allProducts.find(p => p.id == productId);
    if (!product) return;

    alert(`Added to wishlist: ${product.name}`);
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

// ===== PERFORMANCE OPTIMIZATION =====
function initLazyLoading() {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.src;
                    imageObserver.unobserve(img);
                }
            });
        });

        lazyImages.forEach(img => imageObserver.observe(img));
    }
}

function initSmoothScroll() {
    document.addEventListener('scroll', debounce(() => {
        // تحسين الأداء أثناء Scroll
    }, 100));
}

// ===== ANALYTICS & TRACKING =====
function initAnalytics() {
    trackPageView();
    setupEventTracking();
}

function trackPageView() {
    const pageName = document.title;
    console.log('Page viewed:', pageName);
}

function setupEventTracking() {
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart-btn')) {
            trackEvent('add_to_cart', {
                product_id: e.target.dataset.id,
                product_name: e.target.dataset.name
            });
        }
        
        if (e.target.classList.contains('product-card')) {
            trackEvent('product_click', {
                product_id: e.target.dataset.productId
            });
        }
    });
}

function trackEvent(eventName, eventData) {
    console.log('Event:', eventName, eventData);
}

// ===== NOTIFICATION SYSTEM =====
function initNotifications() {
    if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
            console.log('Notification permission:', permission);
        });
    }
}

// ===== ERROR HANDLING =====
function initErrorHandling() {
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handlePromiseRejection);
    monitorPerformance();
}

function handleError(event) {
    console.error('Error:', event.error);
}

function handlePromiseRejection(event) {
    console.error('Promise rejection:', event.reason);
}

function monitorPerformance() {
    window.addEventListener('load', () => {
        const navigationTiming = performance.getEntriesByType('navigation')[0];
        if (navigationTiming) {
            console.log('Page load time:', navigationTiming.loadEventEnd - navigationTiming.navigationStart, 'ms');
        }
    });
}

// ===== SERVICE WORKER REGISTRATION =====
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(() => console.log('Service Worker registered'))
            .catch(error => console.log('Service Worker registration failed:', error));
    }
}

// ===== UTILITY FUNCTIONS =====
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

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('KISHKI Supermarket - Website loaded');
    
    // تهيئة عربة التسوق
    window.cart = new ShoppingCart();
    
    // تحميل المنتجات
    displayProducts();
    
    // إعداد event listeners
    setupEventListeners();
    
    // تهيئة الأنظمة الجديدة
    initLazyLoading();
    initSmoothScroll();
    initAnalytics();
    initNotifications();
    initErrorHandling();
    registerServiceWorker();
    
    // تتبع أداء الموقع
    setTimeout(runPerformanceTests, 2000);
});

// إعداد event listeners
function setupEventListeners() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            scrollToSection(targetId);
        });
    });
    
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Form submission would be processed here');
        });
    });
}

// عرض المنتجات
async function displayProducts(container = '#productsGrid') {
    allProducts = await loadProducts();
    initFilterSystem();
    filterProducts();
}

// اختبار الأداء
function runPerformanceTests() {
    const loadTime = performance.now();
    console.log('Page loaded in:', loadTime, 'ms');
    
    const navigationTiming = performance.getEntriesByType('navigation')[0];
    if (navigationTiming) {
        console.log('DOM ready in:', navigationTiming.domContentLoadedEventEnd - navigationTiming.navigationStart, 'ms');
        console.log('Page fully loaded in:', navigationTiming.loadEventEnd - navigationTiming.navigationStart, 'ms');
    }
}

// جعل الوظائف متاحة globally
window.showPage = showPage;
window.scrollToSection = scrollToSection;
window.displayProducts = displayProducts;
window.removeFilter = removeFilter;
window.clearAllFilters = clearAllFilters;
window.changePage = changePage;
window.quickView = quickView;
window.addToWishlist = addToWishlist;
