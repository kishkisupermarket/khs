// ===== MAIN.JS - KISHKI SUPERMARKET =====
// هذا الملف يحتوي على كل JavaScript الموجود سابقاً في index.html

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
        this.items.push(product);
        this.total += product.price;
        this.saveToStorage();
        this.updateCartUI();
        this.showAddedMessage(product.name);
    }
    
    updateCartUI() {
        const count = this.items.length;
        document.querySelectorAll('.cart-count').forEach(el => {
            el.textContent = count;
            el.style.display = count > 0 ? 'flex' : 'none';
        });
    }
    
    showAddedMessage(productName) {
        const button = event.target;
        const originalText = button.innerHTML;
        
        button.innerHTML = '<i class="fas fa-check"></i> Added!';
        button.style.background = '#c0392b';
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.style.background = '';
        }, 2000);
        
        this.showNotification(`Added to cart: ${productName}`);
    }
    
    showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: #27ae60;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 10000;
            font-weight: 600;
        `;
        notification.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
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
        this.total = this.items.reduce((sum, item) => sum + item.price, 0);
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
        return this.items.length;
    }
    
    getTotalPrice() {
        return this.total;
    }
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
    
    // إضافة event listeners للروابط
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            scrollToSection(targetId);
        });
    });
    
    // تهيئة forms
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Form submission would be processed here');
        });
    });
    
    // تحميل المحتوى الديناميكي إذا وجد
    loadDynamicContent();
});

// تحميل المحتوى الديناميكي
function loadDynamicContent() {
    // يمكن إضافة تحميل المنتجات أو غيره هنا لاحقاً
    console.log('Loading dynamic content...');
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

// جعل الوظائف متاحة globally للاستخدام في HTML
window.showPage = showPage;
window.scrollToSection = scrollToSection;
window.KISHKI = {
    cart: null,
    utils: {
        formatPrice,
        debounce
    }
};

// تهيئة عند تحميل الصفحة
window.addEventListener('load', function() {
    console.log('Page fully loaded');
    
    // إخفاء loading spinner إذا كان موجوداً
    const loadingElement = document.querySelector('.loading');
    if (loadingElement) {
        loadingElement.style.display = 'none';
    }
});

// إدارة errors
window.addEventListener('error', function(e) {
    console.error('JavaScript Error:', e.error);
});

// جعل الكود متاحاً للاستخدام في console لل debugging
if (typeof console !== 'undefined') {
    console.log('KISHKI JavaScript loaded successfully');
    console.log('Available functions: showPage(), scrollToSection()');
    console.log('Cart instance: window.cart');
}
