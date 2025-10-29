// Seleciona o formulário da página
const loginForm = document.querySelector('form');
const loginEmailInput = document.getElementById('login-email');
const loginPasswordInput = document.getElementById('login-password');
const loginErrorDiv = document.getElementById('login-error');

// Função utilitária: tenta extrair um nome amigável do email
const nameFromEmail = (email) => {
    if (!email) return 'Usuário';
    const local = email.split('@')[0] || email;
    return local.replace(/[._]/g, ' ').replace(/(^|\s)\S/g, (t) => t.toUpperCase());
};

// Carrega usuário salvo (se houver) e adapta a UI
const loadStoredUser = () => {
    try {
        const raw = localStorage.getItem('app_user');
        if (!raw) return null;
        const user = JSON.parse(raw);
        // Se existir user.email, podemos pré-preencher o campo ou exibir uma dica
        if (loginEmailInput && user.email) {
            // Opcional: prefira deixar em branco para inserir, mas mostramos placeholder
            loginEmailInput.placeholder = `Email cadastrado: ${user.email}`;
        }
        return user;
    } catch (e) {
        console.warn('Erro ao ler app_user do localStorage', e);
        return null;
    }
};

// Valida e processa o login
loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const enteredEmail = loginEmailInput ? loginEmailInput.value.trim() : '';
    const enteredPassword = loginPasswordInput ? loginPasswordInput.value : '';
    const storedUser = loadStoredUser();

    // Limpa mensagens
    if (loginErrorDiv) {
        loginErrorDiv.style.display = 'none';
        loginErrorDiv.textContent = '';
    }

    // Se já existe um usuário salvo, só permite logar com esse email
    if (storedUser && storedUser.email) {
        if (enteredEmail === storedUser.email) {
            // Sucesso — redireciona
            window.location.href = '../dashboard.html';
            return;
        }
        // Email não bate
        if (loginErrorDiv) {
            loginErrorDiv.style.display = 'block';
            loginErrorDiv.textContent = 'Email não confere com a conta cadastrada. Use o email configurado nas Configurações.';
        } else {
            alert('Email não confere com a conta cadastrada.');
        }
        return;
    }

    // Se não existe usuário salvo ainda, criamos um com o email fornecido (fluxo de primeiro cadastro)
    if (!enteredEmail) {
        if (loginErrorDiv) {
            loginErrorDiv.style.display = 'block';
            loginErrorDiv.textContent = 'Digite um email para continuar.';
        }
        return;
    }

    const newUser = { name: nameFromEmail(enteredEmail), email: enteredEmail };
    try {
        localStorage.setItem('app_user', JSON.stringify(newUser));
    } catch (e) {
        console.warn('Não foi possível salvar usuário no localStorage', e);
    }
    // Redireciona para o dashboard
    window.location.href = '../dashboard.html';
});

// Chama loadStoredUser para ajustar placeholder quando a página carrega
document.addEventListener('DOMContentLoaded', loadStoredUser);
