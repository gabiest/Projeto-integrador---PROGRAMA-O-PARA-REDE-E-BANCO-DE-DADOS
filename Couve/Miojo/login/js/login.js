// Seleciona o formulário da página
const loginForm = document.querySelector('form');

// Adiciona um evento que "escuta" quando o formulário é enviado (quando o botão Login é clicado)
loginForm.addEventListener('submit', (event) => {
    // Impede o comportamento padrão do formulário, que é recarregar a página
    event.preventDefault();

    // Redireciona o usuário para a página do dashboard
    // O '../' significa "voltar uma pasta para trás" antes de encontrar o dashboard.html
    window.location.href = '../dashboard.html';
});
