/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

/**
 * Gestor do Menu Lateral, Navegação, Dashboard, Inventário e Configurações
 * Versão reduzida para demo: controla menu e toasts mínimos
 */
document.addEventListener('DOMContentLoaded', () => {
    const botaoMenu = document.querySelector('.botao-menu');
    const menuLateral = document.querySelector('.menu-lateral');
    const conteudo = document.querySelector('.conteudo');
    const background = document.querySelector('.background');

    const toggleMenu = () => {
        if (menuLateral) menuLateral.classList.toggle('ativo');
        if (botaoMenu) botaoMenu.classList.toggle('ativo');
        if (conteudo) conteudo.classList.toggle('ativo');
        if (background) background.classList.toggle('ativo');
    };
    if (botaoMenu) botaoMenu.addEventListener('click', toggleMenu);

    // pequenas animações de entrada (se existirem elementos)
    document.querySelectorAll('.kpi-card, .chart-card, .table-card').forEach((el, idx) => {
        el.style.opacity = '1';
    });
});
