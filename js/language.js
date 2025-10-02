class LanguageManager {
    constructor() {
        this.currentLanguage = this.detectLanguage();
        this.translations = window.translations || {};
        this.init();
    }

    detectLanguage() {
        // Check if language is stored in localStorage
        const storedLang = localStorage.getItem('preferred-language');
        if (storedLang) {
            return storedLang;
        }

        // Check if browser language is Portuguese
        const browserLang = navigator.language || navigator.userLanguage;
        if (browserLang.startsWith('pt')) {
            return 'pt';
        }

        // Default to English
        return 'en';
    }

    init() {
        // Wait a bit for all translation files to load
        setTimeout(() => {
            this.translations = window.translations || {};
            this.applyTranslations();
            this.setupLanguageSwitcher();
        }, 100);
    }

    setLanguage(langCode) {
        this.currentLanguage = langCode;
        localStorage.setItem('preferred-language', langCode);
        this.applyTranslations();
        this.updateLanguageSwitcher();
    }

    translate(key, params = {}) {
        const translation = this.translations[this.currentLanguage]?.[key] || 
                          this.translations.en?.[key] || 
                          key;
        
        // Replace parameters in translation
        return translation.replace(/\{(\w+)\}/g, (match, param) => {
            return params[param] !== undefined ? params[param] : match;
        });
    }

    applyTranslations() {
        // Update page title
        document.title = this.translate('pageTitle');

        // Update all elements with data-translate attribute
        const elements = document.querySelectorAll('[data-translate]');
        elements.forEach(element => {
            const key = element.getAttribute('data-translate');
            element.textContent = this.translate(key);
        });

        // Update elements with data-translate-html for HTML content
        const htmlElements = document.querySelectorAll('[data-translate-html]');
        htmlElements.forEach(element => {
            const key = element.getAttribute('data-translate-html');
            element.innerHTML = this.translate(key);
        });

        // Update placeholders
        const placeholderElements = document.querySelectorAll('[data-translate-placeholder]');
        placeholderElements.forEach(element => {
            const key = element.getAttribute('data-translate-placeholder');
            element.placeholder = this.translate(key);
        });

        // Update document language attribute
        document.documentElement.lang = this.currentLanguage;
    }

    setupLanguageSwitcher() {
        // Don't create language switcher on trip progress page
        if (document.body.classList.contains('trip-progress-page')) {
            return;
        }
        
        // Create language switcher if it doesn't exist
        let switcher = document.getElementById('language-switcher');
        if (!switcher) {
            switcher = this.createLanguageSwitcher();
        }
        this.updateLanguageSwitcher();
    }

    createLanguageSwitcher() {
        const switcher = document.createElement('div');
        switcher.id = 'language-switcher';
        switcher.className = 'language-switcher';
        
        switcher.innerHTML = `
            <span data-translate="languageLabel">${this.translate('languageLabel')}</span>
            <button class="lang-btn" data-lang="en" data-translate="english">${this.translate('english')}</button>
            <button class="lang-btn" data-lang="pt" data-translate="portuguese">${this.translate('portuguese')}</button>
        `;

        // Add event listeners
        switcher.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lang = e.target.getAttribute('data-lang');
                this.setLanguage(lang);
            });
        });

        // Insert into page
        const header = document.querySelector('.hero-section, .subpage-header');
        if (header) {
            header.appendChild(switcher);
        }

        return switcher;
    }

    updateLanguageSwitcher() {
        const buttons = document.querySelectorAll('.lang-btn');
        buttons.forEach(btn => {
            const lang = btn.getAttribute('data-lang');
            btn.classList.toggle('active', lang === this.currentLanguage);
        });
    }

    // Special method for trip progress time updates
    updateTimeRemaining(mins, secs) {
        const element = document.getElementById('timeRemaining');
        if (element && mins !== undefined && secs !== undefined) {
            element.textContent = this.translate('timeLeftText', { mins, secs });
        } else if (element) {
            element.textContent = this.translate('tripProgressHeading');
        }
    }
}

// Initialize language manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.langManager = new LanguageManager();
});

// Make it available globally
window.LanguageManager = LanguageManager;