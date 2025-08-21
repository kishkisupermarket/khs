// ===== MAIN JAVASCRIPT FILE - KISHKI SUPERMARKET =====

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
                this.addProduct({
                    id: e.target.dataset.id,
                    name: e.target.dataset.name,
                    price: parseFloat(e.target.dataset.price),
                    image: e.target.closest('.product-card').querySelector('img').src
                });
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
        });
    }
    
    showAddedMessage(productName) {
        const button = event.target;
        const originalText = button.innerHTML;
        
        button.innerHTML = '<i class="fas fa-check"></i> Added!';
        button.style.background = '#c0392b';
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.style.background = '#e74c3c';
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
        `;
        notification.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 3000);
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
            const data = JSON.parse(saved);
            this.items = data.items || [];
            this.total = data.total || 0;
        }
    }
}

// التنقل السلس
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize cart
    window.cart = new ShoppingCart();
    
    // Add any other initialization code here
    console.log('KISHKI Supermarket website loaded successfully!');
});

// ===== UTILITY FUNCTIONS =====
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

// Export for global access
window.KISHKI = {
    showPage,
    scrollToSection,
    debounce
};
