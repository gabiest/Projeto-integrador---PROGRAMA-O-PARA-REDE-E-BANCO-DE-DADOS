/* ======================================================= */
/* ============ ARQUIVO SCRIPT.JS - PROJETO HOSTS ========== */
/* ======================================================= */
'use strict';

// Espera o DOM carregar antes de executar o script
document.addEventListener('DOMContentLoaded', () => {

    /* ======================================================= */
    /* ================== 1. SELETORES GERAIS ================ */
    /* ======================================================= */
    
    // Seletores do Menu e Layout
    const menuButton = document.querySelector('.botao-menu');
    const sidebar = document.querySelector('.menu-lateral');
    const content = document.querySelector('.conteudo');
    const backgroundOverlay = document.querySelector('.background');
    const sidebarLinks = document.querySelectorAll('.menu-lateral a[href^="#"]'); // Apenas links internos
    const allPages = document.querySelectorAll('.conteudo > section[id]'); // Todas as seções "página"

    // Seletores dos Modais
    const addEditModal = document.getElementById('modal-add-edit');
    const confirmModal = document.getElementById('modal-confirm');
    

    /* ======================================================= */
    /* ================== 2. LÓGICA DO MENU LATERAL ========== */
    /* ======================================================= */

    const toggleSidebar = () => {
        menuButton.classList.toggle('ativo');
        sidebar.classList.toggle('ativo');
        content.classList.toggle('ativo');
        backgroundOverlay.classList.toggle('ativo');
    };

    // Adiciona eventos para abrir/fechar o menu
    if (menuButton && sidebar && content && backgroundOverlay) {
        menuButton.addEventListener('click', toggleSidebar);
        backgroundOverlay.addEventListener('click', toggleSidebar);
    }

    /* ======================================================= */
    /* ================= 3. FUNÇÕES HELPER (Animação e Toast) == */
    /* ======================================================= */

    /**
     * Anima elementos em cascata (stagger).
     * O CSS já deve ter a classe .animate-entrada e a opacidade:0 inicial.
     * @param {string} pageSelector - O seletor da PÁGINA (ex: "#dashboard")
     * @param {string} elementSelector - O seletor dos elementos a animar (ex: ".kpi-card")
     * @param {number} delay - O tempo em ms entre cada animação
     */
    const staggerAnimation = (pageSelector, elementSelector, delay = 100) => {
        const page = document.querySelector(pageSelector);
        if (!page) return;

        const elements = page.querySelectorAll(elementSelector);
        
        elements.forEach((el, index) => {
            // Garante que a animação possa rodar novamente
            el.classList.remove('animate-entrada');
            
            // Força o navegador a "ver" a remoção da classe
            void el.offsetWidth; 

            // Adiciona a classe com um atraso
            setTimeout(() => {
                el.classList.add('animate-entrada');
            }, index * delay);
        });
    };

    /**
     * Mostra uma notificação toast.
     * @param {string} message - A mensagem a ser exibida.
     * @param {string} type - 'success', 'error', ou 'info'.
     */
    window.showToast = (message, type = 'info') => {
        const container = document.getElementById('toast-container');
        if (!container) {
            console.error('Container de toast (#toast-container) não encontrado.');
            return;
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let iconClass = 'bi-info-circle';
        if(type === 'success') iconClass = 'bi-check-circle';
        if(type === 'error') iconClass = 'bi-exclamation-triangle';

        toast.innerHTML = `<i class="bi ${iconClass}"></i> <span>${message}</span>`;
        container.appendChild(toast);

        // Auto-destruição
        setTimeout(() => {
            // Adiciona animação de saída
            toast.style.animation = 'fadeOutToast 0.5s ease forwards';
            // Remove o elemento após a animação
            setTimeout(() => toast.remove(), 500);
        }, 3000); // Toast dura 3 segundos
    };


    /* ======================================================= */
    /* ================== 4. "ROTEAMENTO" DE PÁGINA ========== */
    /* ======================================================= */

    // Esconde todas as seções
    const hideAllPages = () => {
        allPages.forEach(page => {
            page.style.display = 'none';
        });
    };

    // Mostra uma página específica e dispara suas animações
    const showPage = (pageId) => {
        hideAllPages();
        
        let page = document.getElementById(pageId);
        
        // Se a página não existir, mostra o dashboard
        if (!page) {
            console.warn(`Página não encontrada: ${pageId}. Mostrando dashboard.`);
            pageId = 'dashboard';
            page = document.getElementById('dashboard');
            if (!page) {
                console.error('Página de dashboard padrão não encontrada!');
                return; 
            }
        }

        page.style.display = 'block';

        // Dispara as funções de inicialização e animação da página
        switch (pageId) {
            case 'dashboard':
                initDashboardPage();
                break;
            case 'inventario':
                initInventoryPage();
                break;
            case 'configuracoes':
                initSettingsPage();
                break;
            case 'sobre':
                initSobrePage();
                break;
            // Adicione 'case' para 'relatorios', 'suporte', etc.
        }
    };

    // Adiciona eventos de clique aos links da sidebar
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = link.getAttribute('href').substring(1); // Remove o '#'

            // Remove a classe 'active' de todos os 'li'
            sidebar.querySelectorAll('li').forEach(li => li.classList.remove('active'));
            // Adiciona 'active' ao 'li' pai do link clicado
            if(link.parentElement.tagName === 'LI'){
                link.parentElement.classList.add('active');
            }

            showPage(pageId);
            
            // Fecha o menu em telas pequenas
            if (window.innerWidth <= 768 && sidebar.classList.contains('ativo')) {
                toggleSidebar();
            }
        });
    });

    /* ======================================================= */
    /* ================= 5. INICIALIZAÇÃO DAS PÁGINAS ======== */
    /* ======================================================= */

    function initDashboardPage() {
        // Dispara as animações em cascata
        staggerAnimation('#dashboard', '.kpi-card', 100);
        staggerAnimation('#dashboard', '.chart-card', 150);
        staggerAnimation('#dashboard', '.table-card', 150);

        // (Re)carrega os gráficos (exemplo)
        initCharts(); 
    }

    function initInventoryPage() {
        // Dispara as animações
        staggerAnimation('#inventario', '.page-header', 100);
        staggerAnimation('#inventario', '.search-container', 150);
        staggerAnimation('#inventario', '.table-wrapper', 200);

        // Configura os botões de modal (só precisa fazer isso uma vez)
        // A função setupModalLogic() já foi chamada no início
    }

    function initSettingsPage() {
        // Dispara as animações
        staggerAnimation('#configuracoes', '.cartao-perfil', 100);
        staggerAnimation('#configuracoes', '.titulo-secao', 150);
        staggerAnimation('#configuracoes', '.configuracao-item', 70);
    }
    
    function initSobrePage() {
        // Dispara as animações
        staggerAnimation('#sobre', '.sobre-nos-container', 100);
    }

    /* ======================================================= */
    /* ================= 6. LÓGICA DE COMPONENTES =========== */
    /* ======================================================= */

    // --- Lógica dos Modais ---
    function setupModalLogic() {
        if (!addEditModal || !confirmModal) {
            console.warn('Modais não encontrados. A funcionalidade de inventário será limitada.');
            return;
        }

        const btnAdd = document.querySelector('.btn-add');
        
        // Seletores do modal Adicionar/Editar
        const modalTitle = addEditModal.querySelector('h2');
        const btnCancelAdd = addEditModal.querySelector('.btn-cancel');
        const btnSave = addEditModal.querySelector('.btn-save');
        
        // Seletores do modal de Confirmação
        const btnCancelDelete = confirmModal.querySelector('.btn-cancel');
        const btnConfirmDelete = confirmModal.querySelector('.btn-confirm-delete');

        // Funções genéricas para abrir/fechar
        const openModal = (modal) => modal.style.display = 'flex';
        const closeModal = (modal) => modal.style.display = 'none';

        // --- Eventos ---

        // Abrir modal para ADICIONAR
        if(btnAdd) {
            btnAdd.addEventListener('click', () => {
                modalTitle.textContent = 'Adicionar Novo Ativo';
                // Limpar campos do formulário (IMPORTANTE)
                addEditModal.querySelector('form').reset();
                openModal(addEditModal);
            });
        }

        // Fechar modais nos botões "Cancelar"
        if(btnCancelAdd) btnCancelAdd.addEventListener('click', () => closeModal(addEditModal));
        if(btnCancelDelete) btnCancelDelete.addEventListener('click', () => closeModal(confirmModal));

        // Salvar (Adicionar/Editar)
        if(btnSave) {
            btnSave.addEventListener('click', (e) => {
                e.preventDefault(); // Previne o envio do formulário
                // LÓGICA DE SALVAR AQUI
                // ...
                
                // Se salvar, feche o modal e mostre um toast
                closeModal(addEditModal);
                showToast('Ativo salvo com sucesso!', 'success');
            });
        }

        // Confirmar Exclusão
        if(btnConfirmDelete) {
            btnConfirmDelete.addEventListener('click', () => {
                // LÓGICA DE EXCLUIR AQUI
                // ...

                closeModal(confirmModal);
                showToast('Ativo excluído!', 'error');
            });
        }

        // --- Delegação de Eventos na Tabela ---
        const tableBody = document.querySelector('.inventory-table tbody');
        if (tableBody) {
            tableBody.addEventListener('click', (e) => {
                const target = e.target;
                
                // Clique no ícone de EDITAR (procura pelo ícone ou seu 'pai')
                if (target.classList.contains('bi-pencil-square') || target.closest('.bi-pencil-square')) {
                    modalTitle.textContent = 'Editar Ativo';
                    // 1. Pegar dados da linha (ex: target.closest('tr'))
                    // 2. Preencher o formulário
                    openModal(addEditModal);
                }

                // Clique no ícone de EXCLUIR
                if (target.classList.contains('bi-trash') || target.closest('.bi-trash')) {
                    // 1. Pegar nome do ativo (ex: target.closest('tr').cells[0].textContent)
                    // 2. Colocar nome no modal de confirmação
                    const assetName = target.closest('tr').cells[0].textContent;
                    confirmModal.querySelector('strong').textContent = assetName;
                    openModal(confirmModal);
                }
            });
        }
    }

    // --- Lógica dos Gráficos (Chart.js) ---
    function initCharts() {
        // Checa se Chart.js está carregado
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js não foi carregado. Os gráficos não serão renderizados.');
            return;
        }
        
        // Você precisa destruir gráficos antigos antes de criar novos para evitar bugs
        // Esta é uma forma simples de guardar referências
        if (!window.myCharts) {
            window.myCharts = {};
        }

        // Gráfico de Performance (Linha)
        const perfCtx = document.getElementById('performance-chart')?.getContext('2d');
        if (perfCtx) {
            if (window.myCharts.performance) window.myCharts.performance.destroy(); // Destrói antigo
            window.myCharts.performance = new Chart(perfCtx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
                    datasets: [{
                        label: 'Disponibilidade',
                        data: [99.5, 99.7, 99.6, 99.8, 99.9, 99.7],
                        borderColor: 'var(--success-color)',
                        backgroundColor: 'rgba(65, 241, 182, 0.1)',
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: { /* ... suas opções ... */ }
            });
        }
        
        // Gráfico de Status (Pizza/Doughnut)
        const statusCtx = document.getElementById('status-chart')?.getContext('2d');
        if (statusCtx) {
            if (window.myCharts.status) window.myCharts.status.destroy(); // Destrói antigo
            window.myCharts.status = new Chart(statusCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Online', 'Offline', 'Manutenção'],
                    datasets: [{
                        data: [150, 12, 5],
                        backgroundColor: ['var(--success-color)', 'var(--danger-color)', 'var(--warning-color)']
                    }]
                },
                options: { /* ... suas opções ... */ }
            });
        }

        // Adicione outros gráficos (ex: 'asset-type-chart') aqui...
    }


    /* ======================================================= */
    /* ================= 7. INICIALIZAÇÃO GERAL ============= */
    /* ======================================================= */

    // Configura os botões de modal (só precisa rodar uma vez)
    setupModalLogic();

    // Mostra a página inicial (Dashboard ou a que estiver na URL)
    const initialPageId = window.location.hash ? window.location.hash.substring(1) : 'dashboard';
    showPage(initialPageId);

    // Marca o link ativo correto na sidebar ao carregar
    const activeLink = sidebar.querySelector(`a[href="#${initialPageId}"]`);
    if (activeLink && activeLink.parentElement.tagName === 'LI') {
        activeLink.parentElement.classList.add('active');
    }

});