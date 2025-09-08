<<<<<<< HEAD
// 共通レスポンシブデザイン用JavaScript

// ハンバーガーメニューの制御
function initHamburgerMenu() {
    const hamburgerBtn = document.querySelector('.hamburger-menu');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (hamburgerBtn && mobileMenu) {
        hamburgerBtn.addEventListener('click', () => {
            hamburgerBtn.classList.toggle('active');
            mobileMenu.classList.toggle('active');
        });
        
        // メニュー外をクリックしたら閉じる
        document.addEventListener('click', (e) => {
            if (!hamburgerBtn.contains(e.target) && !mobileMenu.contains(e.target)) {
                hamburgerBtn.classList.remove('active');
                mobileMenu.classList.remove('active');
            }
        });
        
        // メニューリンクをクリックしたら閉じる
        const menuLinks = mobileMenu.querySelectorAll('a');
        menuLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburgerBtn.classList.remove('active');
                mobileMenu.classList.remove('active');
            });
        });
    }
}

// レスポンシブ画像の制御
function initResponsiveImages() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
    });
}

// レスポンシブテーブルの制御
function initResponsiveTables() {
    const tables = document.querySelectorAll('table');
    tables.forEach(table => {
        if (!table.parentElement.classList.contains('table-container')) {
            const wrapper = document.createElement('div');
            wrapper.className = 'table-container';
            table.parentNode.insertBefore(wrapper, table);
            wrapper.appendChild(table);
        }
    });
}

// ウィンドウリサイズ時の処理
function handleResize() {
    const width = window.innerWidth;
    
    // 768px以上でモバイルメニューを非表示
    if (width > 768) {
        const hamburgerBtn = document.querySelector('.hamburger-menu');
        const mobileMenu = document.querySelector('.mobile-menu');
        
        if (hamburgerBtn) hamburgerBtn.classList.remove('active');
        if (mobileMenu) mobileMenu.classList.remove('active');
    }
}

// タッチデバイス対応
function initTouchSupport() {
    let touchStartY = 0;
    let touchEndY = 0;
    
    document.addEventListener('touchstart', (e) => {
        touchStartY = e.changedTouches[0].screenY;
    });
    
    document.addEventListener('touchend', (e) => {
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartY - touchEndY;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // 上スワイプ
                console.log('上スワイプ');
            } else {
                // 下スワイプ
                console.log('下スワイプ');
            }
        }
    }
}

// スクロール位置の保存と復元
function initScrollPosition() {
    let scrollPos = sessionStorage.getItem('scrollPos');
    
    if (scrollPos) {
        window.scrollTo(0, parseInt(scrollPos));
    }
    
    window.addEventListener('beforeunload', () => {
        sessionStorage.setItem('scrollPos', window.pageYOffset.toString());
    });
}

// パフォーマンス最適化
function initPerformanceOptimizations() {
    // 遅延読み込み
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        imageObserver.unobserve(img);
                    }
                }
            });
        });
        
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => imageObserver.observe(img));
    }
}

// 初期化関数
function initResponsiveDesign() {
    initHamburgerMenu();
    initResponsiveImages();
    initResponsiveTables();
    initTouchSupport();
    initScrollPosition();
    initPerformanceOptimizations();
    
    // リサイズイベントの設定
    window.addEventListener('resize', handleResize);
    
    // DOMContentLoadedイベントで初期化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initResponsiveDesign);
    }
}

// ページ読み込み完了時に初期化
if (document.readyState === 'complete') {
    initResponsiveDesign();
} else {
    window.addEventListener('load', initResponsiveDesign);
}

// グローバル関数として公開
window.ResponsiveDesign = {
    init: initResponsiveDesign,
    initHamburgerMenu,
    initResponsiveImages,
    initResponsiveTables
};

=======
// 共通レスポンシブデザイン用JavaScript

// ハンバーガーメニューの制御
function initHamburgerMenu() {
    const hamburgerBtn = document.querySelector('.hamburger-menu');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (hamburgerBtn && mobileMenu) {
        hamburgerBtn.addEventListener('click', () => {
            hamburgerBtn.classList.toggle('active');
            mobileMenu.classList.toggle('active');
        });
        
        // メニュー外をクリックしたら閉じる
        document.addEventListener('click', (e) => {
            if (!hamburgerBtn.contains(e.target) && !mobileMenu.contains(e.target)) {
                hamburgerBtn.classList.remove('active');
                mobileMenu.classList.remove('active');
            }
        });
        
        // メニューリンクをクリックしたら閉じる
        const menuLinks = mobileMenu.querySelectorAll('a');
        menuLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburgerBtn.classList.remove('active');
                mobileMenu.classList.remove('active');
            });
        });
    }
}

// レスポンシブ画像の制御
function initResponsiveImages() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
    });
}

// レスポンシブテーブルの制御
function initResponsiveTables() {
    const tables = document.querySelectorAll('table');
    tables.forEach(table => {
        if (!table.parentElement.classList.contains('table-container')) {
            const wrapper = document.createElement('div');
            wrapper.className = 'table-container';
            table.parentNode.insertBefore(wrapper, table);
            wrapper.appendChild(table);
        }
    });
}

// ウィンドウリサイズ時の処理
function handleResize() {
    const width = window.innerWidth;
    
    // 768px以上でモバイルメニューを非表示
    if (width > 768) {
        const hamburgerBtn = document.querySelector('.hamburger-menu');
        const mobileMenu = document.querySelector('.mobile-menu');
        
        if (hamburgerBtn) hamburgerBtn.classList.remove('active');
        if (mobileMenu) mobileMenu.classList.remove('active');
    }
}

// タッチデバイス対応
function initTouchSupport() {
    let touchStartY = 0;
    let touchEndY = 0;
    
    document.addEventListener('touchstart', (e) => {
        touchStartY = e.changedTouches[0].screenY;
    });
    
    document.addEventListener('touchend', (e) => {
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartY - touchEndY;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // 上スワイプ
                console.log('上スワイプ');
            } else {
                // 下スワイプ
                console.log('下スワイプ');
            }
        }
    }
}

// スクロール位置の保存と復元
function initScrollPosition() {
    let scrollPos = sessionStorage.getItem('scrollPos');
    
    if (scrollPos) {
        window.scrollTo(0, parseInt(scrollPos));
    }
    
    window.addEventListener('beforeunload', () => {
        sessionStorage.setItem('scrollPos', window.pageYOffset.toString());
    });
}

// パフォーマンス最適化
function initPerformanceOptimizations() {
    // 遅延読み込み
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        imageObserver.unobserve(img);
                    }
                }
            });
        });
        
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => imageObserver.observe(img));
    }
}

// 初期化関数
function initResponsiveDesign() {
    initHamburgerMenu();
    initResponsiveImages();
    initResponsiveTables();
    initTouchSupport();
    initScrollPosition();
    initPerformanceOptimizations();
    
    // リサイズイベントの設定
    window.addEventListener('resize', handleResize);
    
    // DOMContentLoadedイベントで初期化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initResponsiveDesign);
    }
}

// ページ読み込み完了時に初期化
if (document.readyState === 'complete') {
    initResponsiveDesign();
} else {
    window.addEventListener('load', initResponsiveDesign);
}

// グローバル関数として公開
window.ResponsiveDesign = {
    init: initResponsiveDesign,
    initHamburgerMenu,
    initResponsiveImages,
    initResponsiveTables
};

>>>>>>> 21d985d (first commit)
