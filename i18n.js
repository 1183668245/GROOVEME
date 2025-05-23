let currentLanguage = 'en'; // Default language
let translations = {};

async function loadTranslations(lang) {
    try {
        const response = await fetch(`lang/${lang}.json`);
        if (!response.ok) {
            console.error(`Could not load ${lang}.json`);
            return false;
        }
        translations = await response.json();
        currentLanguage = lang;
        localStorage.setItem('preferredLanguage', lang);
        return true;
    } catch (error) {
        console.error('Error loading translations:', error);
        return false;
    }
}

function translatePage() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[key]) {
            // If it's an input's placeholder
            if (element.tagName === 'INPUT' && element.placeholder) {
                element.placeholder = translations[key];
            } else if (element.tagName === 'TEXTAREA' && element.placeholder) {
                element.placeholder = translations[key];
            } 
            // If it's a button's value (uncommon, but just in case)
            else if (element.tagName === 'INPUT' && element.type === 'button' || element.type === 'submit') {
                element.value = translations[key];
            } 
            // Text content of other elements
            else {
                element.textContent = translations[key];
            }
        }
    });
    // Manually translate dynamically generated text in JS, e.g., the submit button of the previous feedback form
    const submitFeedbackBtn = document.getElementById('submit-feedback');
    if (submitFeedbackBtn && translations.feedbackSend) {
        submitFeedbackBtn.textContent = translations.feedbackSend;
    }
    const feedbackMessageTextarea = document.getElementById('feedback-message');
    if (feedbackMessageTextarea && translations.feedbackPlaceholder) {
        feedbackMessageTextarea.placeholder = translations.feedbackPlaceholder;
    }
    // ... other dynamically generated text that needs manual translation
}

// Get translated text, for use in JS
function getTranslatedText(key) {
    return translations[key] || key; // If translation not found, return original key
}

document.addEventListener('DOMContentLoaded', async () => {
    const preferredLang = localStorage.getItem('preferredLanguage') || 'en';
    await loadTranslations(preferredLang);
    translatePage();

    const langEnBtn = document.getElementById('lang-en');
    const langZhBtn = document.getElementById('lang-zh');

    if (langEnBtn) {
        langEnBtn.addEventListener('click', async () => {
            if (currentLanguage !== 'en') {
                await loadTranslations('en');
                translatePage();
            }
        });
    }

    if (langZhBtn) {
        langZhBtn.addEventListener('click', async () => {
            if (currentLanguage !== 'zh') {
                await loadTranslations('zh');
                translatePage();
            }
        });
    }
});