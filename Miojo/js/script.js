const botaoMenu = document.querySelector('.botao-menu');
const menuLateral = document.querySelector('.menu-lateral');
const conteudo = document.querySelector('.conteudo');
const background = document.querySelector('.background');

// Adiciona um evento de clique para o botão do menu
botaoMenu.addEventListener('click', () => {
    // Alterna a classe 'ativo' em todos os elementos
    menuLateral.classList.toggle('ativo');
    botaoMenu.classList.toggle('ativo');
    conteudo.classList.toggle('ativo');
    background.classList.toggle('ativo');
});

// Adiciona um evento de clique para o fundo de sobreposição
background.addEventListener('click', () => {
    // Remove a classe 'ativo' de todos os elementos para fechar o menu
    menuLateral.classList.remove('ativo');
    botaoMenu.classList.remove('ativo');
    conteudo.classList.remove('ativo');
    background.classList.remove('ativo');
});

// Preenche a tabela com os dados dos ativos
Assets.forEach(asset => {
    const tr = document.createElement('tr');
    const trContent = `
        <td>${asset.assetName}</td>
        <td>${asset.assetNumber}</td>
        <td>${asset.status}</td>
        <td class="${asset.condition === 'Crítico' ? 'danger' : asset.condition === 'Alerta' ? 'warning' : 'success'}">${asset.condition}</td>
        <td class="primary">Detalhes</td>
    `;
    tr.innerHTML = trContent;
    document.querySelector('table tbody').appendChild(tr);
});

document.addEventListener('DOMContentLoaded', () => {
    const botaoMenu = document.querySelector('.botao-menu');
    const menuLateral = document.querySelector('.menu-lateral');
    const conteudo = document.querySelector('.conteudo');
    const background = document.querySelector('.background');
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');

    // Abre/Fecha o menu lateral
    const toggleMenu = () => {
        menuLateral.classList.toggle('ativo');
        botaoMenu.classList.toggle('ativo');
        conteudo.classList.toggle('ativo');
        background.classList.toggle('ativo');
    };

    botaoMenu.addEventListener('click', toggleMenu);
    background.addEventListener('click', toggleMenu);

    // Navegação SPA
    const showPage = (pageId) => {
        pages.forEach(page => {
            page.classList.remove('active');
            if (page.id === pageId) {
                page.classList.add('active');
            }
        });
    };

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = link.getAttribute('href').substring(1);

            // Atualiza a classe 'active' no menu
            navLinks.forEach(nav => nav.classList.remove('active'));
            link.classList.add('active');
            
            showPage(pageId);
            
            // Fecha o menu em telas pequenas após clicar
            if (window.innerWidth < 768) {
                toggleMenu();
            }
        });
    });

    // --- FUNÇÕES DE DADOS E GRÁFICOS ---
    
    // Calcula totais para os cartões
    const totalAssets = Assets.length;
    const onlineAssets = Assets.filter(asset => asset.status === 'Online').length;
    const alertAssets = Assets.filter(asset => asset.condition === 'Atenção' || asset.condition === 'Falha Crítica').length;

    // Atualiza os valores nos cartões
    document.getElementById('total-assets-value').textContent = totalAssets;
    document.getElementById('online-assets-value').textContent = onlineAssets;
    document.getElementById('alert-assets-value').textContent = alertAssets;

    // Atualiza as percentagens
    const onlinePercent = Math.round((onlineAssets / totalAssets) * 100);
    const alertPercent = Math.round((alertAssets / totalAssets) * 100);
    document.getElementById('online-assets-percent').textContent = `${onlinePercent}%`;
    document.getElementById('alert-assets-percent').textContent = `${alertPercent}%`;

    // Atualiza os círculos de progresso
    const setCircleProgress = (circleId, percent) => {
        const circle = document.getElementById(circleId);
        if(circle) {
            const radius = circle.r.baseVal.value;
            const circumference = 2 * Math.PI * radius;
            const offset = circumference - (percent / 100) * circumference;
            circle.style.strokeDasharray = `${circumference} ${circumference}`;
            circle.style.strokeDashoffset = offset;
        }
    };
    setCircleProgress('total-assets-circle', 100);
    setCircleProgress('online-assets-circle', onlinePercent);
    setCircleProgress('alert-assets-circle', alertPercent);

    // Popula as tabelas
    const populateTable = (tableId, data) => {
        const tableBody = document.getElementById(tableId);
        if (!tableBody) return;
        tableBody.innerHTML = '';
        data.forEach(asset => {
            const tr = document.createElement('tr');
            const conditionClass = asset.condition === 'Falha Crítica' ? 'danger' : asset.condition === 'Atenção' ? 'warning' : 'success';
            tr.innerHTML = `
                <td>${asset.assetName}</td>
                <td>${asset.assetId}</td>
                <td class="${asset.status === 'Online' ? 'success' : 'danger'}">${asset.status}</td>
                <td class="${conditionClass}">${asset.condition}</td>
            `;
            tableBody.appendChild(tr);
        });
    };
    populateTable('all-assets-table', Assets);
    populateTable('online-assets-table', Assets.filter(asset => asset.status === 'Online'));

    // --- CRIAÇÃO DOS GRÁFICOS ---
    
    // Gráfico 1: Tráfego de Rede (Linha)
    const trafficCtx = document.getElementById('trafficChart');
    if (trafficCtx) {
        new Chart(trafficCtx, {
            type: 'line',
            data: {
                labels: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho'],
                datasets: [{
                    label: 'Tráfego (GB)',
                    data: [120, 150, 110, 180, 210, 190],
                    borderColor: 'rgba(114, 54, 198, 1)', // --sexto-color
                    backgroundColor: 'rgba(114, 54, 198, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }

    // Gráfico 2: Status dos Ativos (Donut)
    const statusCtx = document.getElementById('statusChart');
    if (statusCtx) {
        const offlineAssets = totalAssets - onlineAssets;
        new Chart(statusCtx, {
            type: 'doughnut',
            data: {
                labels: ['Online', 'Offline', 'Em Alerta'],
                datasets: [{
                    label: 'Status dos Ativos',
                    data: [onlineAssets, offlineAssets, alertAssets],
                    backgroundColor: [
                        'rgba(65, 241, 182, 1)',  // --success-color
                        'rgba(255, 119, 130, 1)', // --danger-color
                        'rgba(255, 187, 85, 1)'   // --warning-color
                    ],
                    borderColor: '#fff',
                    borderWidth: 2
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }

    // Gráfico 3: Carga de CPU (Barras Horizontais)
    const cpuLoadCtx = document.getElementById('cpuLoadChart');
    if (cpuLoadCtx) {
        new Chart(cpuLoadCtx, {
            type: 'bar',
            data: {
                labels: ['Servidor Web', 'BD Principal', 'Servidor App', 'Firewall', 'Roteador Borda'],
                datasets: [{
                    label: 'Carga de CPU (%)',
                    data: [65, 80, 45, 20, 35],
                    backgroundColor: [
                        'rgba(144, 57, 212, 0.7)', // --quarto-color
                        'rgba(114, 54, 198, 0.7)', // --sexto-color
                        'rgba(84, 51, 184, 0.7)',  // --quinto-color
                        'rgba(167, 136, 217, 0.7)',// --primary-color
                        'rgba(140, 118, 173, 0.7)' // --secondary-color
                    ]
                }]
            },
            options: {
                indexAxis: 'y', // Transforma em barras horizontais
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
    
    // Define a página inicial
    showPage('home');
});


/**
 * Gestor do Menu Lateral
 * Este script controla a funcionalidade de abrir e fechar o menu lateral da aplicação.
 */
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Seleção dos Elementos do DOM
    // Guarda referências aos elementos HTML necessários para a interatividade.
    const botaoMenu = document.querySelector('.botao-menu');
    const menuLateral = document.querySelector('.menu-lateral');
    const conteudo = document.querySelector('.conteudo');
    const background = document.querySelector('.background');

    // Verificação para garantir que todos os elementos essenciais existem.
    if (!botaoMenu || !menuLateral || !conteudo || !background) {
        console.error('Erro: Não foi possível encontrar um ou mais elementos essenciais do menu na página.');
        return; // Interrompe a execução se algum elemento não for encontrado.
    }

    // 2. Função para Gerir o Estado do Menu
    // Centraliza a lógica de alternar as classes 'ativo' que controlam a visibilidade.
    const toggleMenu = () => {
        menuLateral.classList.toggle('ativo');
        botaoMenu.classList.toggle('ativo');
        conteudo.classList.toggle('ativo');
        background.classList.toggle('ativo');
    };
    
    // 3. Adição dos Eventos de Clique (Listeners)
    
    // Clicar no botão do menu (ícone de hambúrguer) abre ou fecha o menu.
    botaoMenu.addEventListener('click', toggleMenu);

    // Clicar no fundo escuro (overlay) apenas fecha o menu se ele estiver aberto.
    background.addEventListener('click', () => {
        if (menuLateral.classList.contains('ativo')) {
            toggleMenu(); // Reutiliza a mesma função para fechar.
        }
    });
});


// --- LÓGICA PARA DESENHAR OS GRÁFICOS NO DASHBOARD ---
document.addEventListener('DOMContentLoaded', () => {
    // Só executa se encontrar o elemento do primeiro gráfico (ou seja, se estiver na página do dashboard)
    if (document.getElementById('performanceChart')) {
        
        // Cores do tema
        const blue = '#00BFFF';
        const success = '#41f1b6';
        const warning = '#ffbb55';
        const danger = '#ff7782';
        const textColor = '#ffffffff';
        const gridColor = 'rgba(255, 255, 255, 0.14)';
        const purpleGradient = createGradient(document.getElementById('assetTypeChart').getContext('2d'), 'rgba(144, 57, 212, 0.8)', 'rgba(114, 54, 198, 0.5)');
        const yellowGradient = createGradient(document.getElementById('assetTypeChart').getContext('2d'), 'rgba(255, 217, 0, 0.57)', 'rgba(255, 187, 85, 0.57)');
        const greenGradient = createGradient(document.getElementById('assetTypeChart').getContext('2d'), 'rgba(65, 241, 182, 0.8)', 'rgba(32, 178, 170, 0.6)'); 
        const green2Gradient = createGradient(document.getElementById('assetTypeChart').getContext('2d'), 'rgba(65, 241, 182, 0.48)', 'rgba(32, 178, 171, 0.32)');
        const blueGradient = createGradient(document.getElementById('assetTypeChart').getContext('2d'), 'rgba(0, 191, 255, 0.6)', 'rgba(30, 144, 255, 0.4)'); 
        const blue2Gradient = createGradient(document.getElementById('assetTypeChart').getContext('2d'), 'rgba(0, 191, 255, 0.46)', 'rgba(30, 143, 255, 0.29)');
        const redGradient = createGradient(document.getElementById('assetTypeChart').getContext('2d'), 'rgba(255, 119, 130, 0.8)', 'rgba(220, 20, 60, 0.6)');
        const red2Gradient = createGradient(document.getElementById('assetTypeChart').getContext('2d'), 'rgba(255, 119, 130, 0.52)', 'rgba(220, 20, 60, 0.34)');  
        const lightYellowGradient = createGradient(document.getElementById('assetTypeChart').getContext('2d'), 'rgba(255, 230, 0, 0.71)', 'rgba(255, 230, 0, 0.38)', 'rgba(255, 235, 59, 0.18)'); // <-- ADICIONE ESTA LINHA
        const blue3Gradient = createGradient(document.getElementById('assetTypeChart').getContext('2d'), '#00BFFF', 'rgba(0, 191, 255, 0.3)', 'rgba(0, 191, 255, 0)');

        // Configurações Padrão
        Chart.defaults.color = textColor;
        Chart.defaults.font.family = 'Arimo';
        Chart.defaults.plugins.legend.display = false;
        
        // Função para criar gradientes
        function createGradient(ctx, color1, color2) {
            const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
            gradient.addColorStop(0, color1);
            gradient.addColorStop(1, color2);
            return gradient;
        };

        // Gráfico 1: Performance da Rede
        const performanceCtx = document.getElementById('performanceChart').getContext('2d');
        const gradientBgLine = createGradient(performanceCtx, 'rgba(0, 191, 255, 0.3)', 'rgba(0, 191, 255, 0)');
        new Chart(performanceCtx, {
            type: 'line',
            data: {
                labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
                datasets: [{
                    label: 'Latência (ms)',
                    data: [30, 25, 35, 28, 40, 32, 38],
                    borderColor: blue,
                    backgroundColor: gradientBgLine,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: blue,
                }]
            },
            options: { scales: { y: { grid: { color: gridColor } }, x: { grid: { display: false } } } }
        });

        // Gráfico 2: Status dos Ativos
        const statusCtx = document.getElementById('statusChart').getContext('2d');
        const onlineCount = Assets.filter(a => a.status === 'Online').length;
        const offlineCount = Assets.filter(a => a.status === 'Offline').length;
        const alertCount = Assets.filter(a => a.condition === 'Atenção' || a.condition === 'Crítico').length;
        new Chart(statusCtx, {
            type: 'doughnut',
            data: {
                labels: ['Online', 'Em Alerta', 'Offline'],
                datasets: [{
                    data: [onlineCount, offlineCount, alertCount],
                    backgroundColor: [success, danger, warning],
                    borderColor: '#fff',
                    borderWidth: 4,
                    hoverOffset: 8
                }]
            },
            options: {
                cutout: '70%',
                plugins: { legend: { display: true, position: 'bottom', labels: { padding: 20 } } }
            }
        });

        // Gráfico 3: Tipo de Ativos
        const assetTypeCtx = document.getElementById('assetTypeChart').getContext('2d');
        new Chart(assetTypeCtx, {
            type: 'bar',
            data: {
                labels: ['Servidores', 'Roteadores', 'Switches', 'Firewalls', 'Outros'],
                datasets: [{
                    label: 'Quantidade',
                    data: [
                        Assets.filter(a => a.type === 'Servidor').length,
                        Assets.filter(a => a.type === 'Roteador').length,
                        Assets.filter(a => a.type === 'Switch').length,
                        Assets.filter(a => a.type === 'Firewall').length,
                        Assets.filter(a => a.type === 'Outro').length,
                    ],
                    backgroundColor: blue3Gradient,
                    borderRadius: 5
                }]
            },
            options: { scales: { y: { grid: { color: gridColor } }, x: { grid: { display: false } } } }
        });
    }
});

// --- LÓGICA PARA ANIMAÇÃO DE ENTRADA ---
document.addEventListener('DOMContentLoaded', () => {
    // Seleciona todos os cartões (KPIs, Gráficos, Tabela)
    const cards = document.querySelectorAll('.kpi-card, .chart-card, .table-card');

    // Aplica a animação com um pequeno atraso escalonado
    cards.forEach((card, index) => {
        // Define um atraso inicial baseado no índice do cartão
        card.style.animationDelay = `${index * 0.1}s`; 
        // Adiciona a classe que inicia a animação (definida no CSS)
        card.classList.add('animate-entrada');
    });
});

// --- PREENCHE TABELA TOP ATIVOS (com dados simulados de carga) ---
        const topAssetsTableBody = document.getElementById('top-assets-table');
        if (topAssetsTableBody && typeof Assets !== 'undefined' && Array.isArray(Assets)) { // Verifica se Assets existe
            // Simula carga e ordena (pega os 5 com maior carga simulada de CPU)
            const assetsWithLoad = Assets.map(asset => ({
                ...asset,
                // Simula CPU e Memória baseado no status e condição para mais realismo
                cpuLoad: asset.status === 'Offline' ? Math.floor(Math.random() * 10) : (asset.condition === 'Crítico' ? Math.floor(Math.random() * 20) + 80 : Math.floor(Math.random() * 60) + 20),
                memLoad: asset.status === 'Offline' ? Math.floor(Math.random() * 20) : (asset.condition === 'Crítico' ? Math.floor(Math.random() * 15) + 85 : Math.floor(Math.random() * 50) + 30)
            })).sort((a, b) => b.cpuLoad - a.cpuLoad).slice(0, 5); // Ordena por CPU e pega os 5 primeiros

            topAssetsTableBody.innerHTML = ''; // Limpa tabela
            assetsWithLoad.forEach(asset => {
                const tr = document.createElement('tr');
                // *** CORREÇÃO AQUI: Apenas 3 colunas (td) ***
                tr.innerHTML = `
                    <td>${asset.assetName || '-'}</td> 
                    <td>${asset.cpuLoad || 0}%</td> 
                    <td>${asset.memLoad || 0}%</td>
                `;
                topAssetsTableBody.appendChild(tr);
            });
        }

        // --- CÓDIGO PARA ADICIONAR AO FINAL DO SEU script.js ---

document.addEventListener('DOMContentLoaded', () => {
    
    // --- LÓGICA DE ANIMAÇÃO DE CONTAGEM E ENTRADA ---
    const dashboardGrid = document.querySelector('.dashboard-grid');
    if (dashboardGrid) { // Só executa se estiver no dashboard

        // 1. Animação de Entrada dos Cartões
        const cards = document.querySelectorAll('.kpi-card, .chart-card, .table-card');
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.08}s`; // Atraso ligeiramente menor
            card.classList.add('animate-entrada');
        });

        // 2. Animação de Contagem para KPIs
        const animateCountUp = (elementId, finalValue, duration = 1500) => {
            const element = document.getElementById(elementId);
            if (!element) return;

            let startTimestamp = null;
            const step = (timestamp) => {
                if (!startTimestamp) startTimestamp = timestamp;
                const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                const currentValue = Math.floor(progress * finalValue);
                element.textContent = currentValue; // Atualiza o número
                if (progress < 1) {
                    window.requestAnimationFrame(step);
                }
            };
            window.requestAnimationFrame(step);
        };

        // Chama a animação para os valores dos KPIs (após um pequeno atraso)
        setTimeout(() => {
            // Recalcula os valores aqui para garantir que estão corretos
            const assetsDataCount = (typeof Assets !== 'undefined' && Array.isArray(Assets)) ? Assets : [];
            const totalAssetsCount = assetsDataCount.length;
            const onlineAssetsCountAnim = assetsDataCount.filter(asset => asset.status === 'Online').length;
            const criticalAssetsCountAnim = assetsDataCount.filter(asset => asset.condition === 'Crítico').length; 
            
            animateCountUp('online-assets-dash', onlineAssetsCountAnim);
            animateCountUp('critical-alerts-count', criticalAssetsCountAnim);
            // Pode adicionar animação para outros números se quiser
        }, 300); // Começa a contar após 300ms

        // 3. Animações Padrão dos Gráficos (Chart.js)
        // Por padrão, Chart.js já tem animações. Podemos ajustar a duração se quisermos.
        // Adicione isto às configurações padrão (Chart.defaults) se quiser controlar:
        // Chart.defaults.animation.duration = 1000; // Exemplo: 1 segundo de animação
    }

}); // Fim do novo EventListener

// --- Certifique-se que o código dos gráficos está DENTRO de um EventListener 'DOMContentLoaded' ---
// Se o seu código de gráficos ainda não estiver dentro de um, mova-o para dentro do 
// 'DOMContentLoaded' principal ou crie um específico para ele.
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('performanceChart') && typeof Assets !== 'undefined') {
        // --- TODO O SEU CÓDIGO DE GRÁFICOS (cores, defaults, new Chart(...)) VAI AQUI DENTRO ---
        
        // Exemplo:
        // const purple = ...
        // Chart.defaults.color = ...
        // function createGradient(...) { ... }
        // const performanceCtx = ...
        // new Chart(performanceCtx, { ... });
        // const statusCtx = ...
        // new Chart(statusCtx, { ... });
        // const assetTypeCtx = ...
        // new Chart(assetTypeCtx, { ... });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // Seleção de Elementos Globais da Página
    const tableBody = document.getElementById('inventory-table-body');
    const searchInput = document.getElementById('search-input');
    const addAssetBtn = document.getElementById('add-asset-btn');
    const modal = document.getElementById('asset-modal');
    const cancelBtn = document.getElementById('cancel-btn');
    const assetForm = document.getElementById('asset-form');
    const modalTitle = document.getElementById('modal-title');
    const assetIndexInput = document.getElementById('assetIndex'); 

    const deleteModal = document.getElementById('delete-confirm-modal');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    const assetNameToDeleteSpan = document.getElementById('asset-name-to-delete');
    const toastContainer = document.getElementById('toast-container');

    // Estado da Aplicação (Cópia dos dados iniciais)
    let assetsData = (typeof Assets !== 'undefined' && Array.isArray(Assets)) ? [...Assets] : []; 
    let assetIndexToDelete = null; // Armazena o índice do ativo a ser excluído

    // --- Sistema de Notificações Toast ---
    const showToast = (message, type = 'info', duration = 3000) => {
        if (!toastContainer) return; // Não faz nada se o container não existir

        const toast = document.createElement('div');
        toast.classList.add('toast', type); 
        let iconClass = 'bi-info-circle-fill'; // Ícone padrão (info)
        if(type === 'success') iconClass = 'bi-check-circle-fill';
        if(type === 'error') iconClass = 'bi-x-octagon-fill';

        toast.innerHTML = `<i class="bi ${iconClass}"></i> <span>${message}</span>`;
        
        // Adiciona ao início para novas notificações aparecerem em cima
        toastContainer.prepend(toast); 

        // Força reflow para garantir que a animação inicial funcione
        void toast.offsetWidth; 
        
        // Define animação de entrada (a classe CSS já aplica)
        // toast.style.animation = 'slideInToast 0.4s ease forwards'; // Redundante se a classe já faz

        // Define a remoção automática do toast
        const removeTimer = setTimeout(() => {
            toast.style.animation = 'fadeOutToast 0.5s ease forwards';
            // Espera a animação de saída terminar antes de remover o elemento
            toast.addEventListener('animationend', () => toast.remove()); 
        }, duration);

         // Permite fechar o toast clicando nele (opcional)
        toast.addEventListener('click', () => {
             clearTimeout(removeTimer); // Cancela a remoção automática
             toast.style.animation = 'fadeOutToast 0.3s ease forwards'; // Animação mais rápida ao clicar
             toast.addEventListener('animationend', () => toast.remove());
        });
    };
    
    // Adiciona CSS para animação fadeOut se não existir
    if (!document.getElementById('toastAnimationStyle')) {
         const style = document.createElement('style');
         style.id = 'toastAnimationStyle';
         style.innerHTML = `
            @keyframes fadeOutToast { 
                from { opacity: 1; transform: translateX(0); }
                to { opacity: 0; transform: translateX(100%); } 
            }
        `;
         document.head.appendChild(style);
     }


    // --- Funções do Modal (Adicionar/Editar) ---
    const openModal = (index = null) => {
        if(!modal || !assetForm || !modalTitle || !assetIndexInput) return; // Proteção

        assetForm.reset();
        assetIndexInput.value = ''; 

        if (index !== null && assetsData[index]) {
            // Modo Edição
            modalTitle.textContent = 'Editar Ativo';
            const asset = assetsData[index];
            document.getElementById('assetName').value = asset.assetName || '';
            document.getElementById('assetId').value = asset.assetId || '';
            document.getElementById('assetType').value = asset.type || '';
            document.getElementById('assetStatus').value = asset.status || 'Online';
            document.getElementById('assetCondition').value = asset.condition || 'Saudável';
            assetIndexInput.value = index; 
        } else {
            // Modo Adição
            modalTitle.textContent = 'Adicionar Novo Ativo';
        }
        modal.style.display = 'flex';
    };

    const closeModal = () => {
        if(!modal || !assetForm || !assetIndexInput) return;
        modal.style.display = 'none';
        assetForm.reset();
        assetIndexInput.value = '';
    };

    addAssetBtn?.addEventListener('click', () => openModal()); 
    cancelBtn?.addEventListener('click', closeModal);
    modal?.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

    // --- Funções do Modal de Exclusão ---
     const openDeleteModal = (index) => {
         if (deleteModal && assetNameToDeleteSpan && assetsData[index]) {
            assetIndexToDelete = index;
            assetNameToDeleteSpan.textContent = assetsData[index].assetName;
            deleteModal.style.display = 'flex';
        }
    };
     const closeDeleteModal = () => {
         if (deleteModal) {
             deleteModal.style.display = 'none';
             assetIndexToDelete = null;
         }
    };

    cancelDeleteBtn?.addEventListener('click', closeDeleteModal);
    deleteModal?.addEventListener('click', (e) => { if (e.target === deleteModal) closeDeleteModal(); });

    // --- Lógica de Salvar (Adicionar ou Editar) ---
    assetForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const assetData = {
            // Adiciona valores padrão caso os elementos não existam (segurança)
            assetName: document.getElementById('assetName')?.value || 'Nome Indefinido',
            assetId: document.getElementById('assetId')?.value || 'ID Indefinido',
            type: document.getElementById('assetType')?.value || 'Outro',
            status: document.getElementById('assetStatus')?.value || 'Online',
            condition: document.getElementById('assetCondition')?.value || 'Saudável'
        };
        const indexToEdit = assetIndexInput.value;

        if (indexToEdit !== '' && assetsData[indexToEdit]) {
            // Editando
            assetsData[indexToEdit] = assetData;
            showToast(`Ativo "${assetData.assetName}" atualizado!`, 'success');
        } else {
            // Adicionando
            assetsData.unshift(assetData); // Adiciona no início
            showToast(`Novo ativo "${assetData.assetName}" adicionado!`, 'success');
        }
        renderTable(assetsData); 
        closeModal();
    });

    // --- Lógica de Excluir ---
    confirmDeleteBtn?.addEventListener('click', () => {
        if (assetIndexToDelete !== null && assetsData[assetIndexToDelete]) {
            const deletedAssetName = assetsData[assetIndexToDelete].assetName;
            assetsData.splice(assetIndexToDelete, 1); // Remove o ativo do array
            renderTable(assetsData); 
            showToast(`Ativo "${deletedAssetName}" excluído.`, 'info'); // Usa tipo 'info' ou 'error'
        }
        closeDeleteModal();
    });

    // --- Função de Renderizar Tabela (com animação e eventos) ---
    const renderTable = (data) => {
        if (!tableBody) return;
        tableBody.innerHTML = ''; 

        if (data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem;">Nenhum ativo encontrado.</td></tr>';
            return;
        }

        data.forEach((asset, index) => {
            const tr = document.createElement('tr');
            // Calcula o índice original REAL para edição/exclusão segura
            const originalIndex = assetsData.findIndex(originalAsset => 
                originalAsset.assetId === asset.assetId && originalAsset.assetName === asset.assetName 
            ); 

            const conditionClass = asset.condition === 'Crítico' ? 'danger' : asset.condition === 'Atenção' ? 'warning' : 'success';
            const statusClass = asset.status === 'Online' ? 'success' : 'danger';
            
            tr.innerHTML = `
                <td>${asset.assetName || '-'}</td>
                <td>${asset.assetId || '-'}</td>
                <td class="${statusClass}">${asset.status || '-'}</td>
                <td class="${conditionClass}">${asset.condition || '-'}</td>
                <td class="action-icons">
                    <i class="bi bi-pencil-square edit-btn" data-index="${originalIndex}" title="Editar"></i>
                    <i class="bi bi-trash delete-btn" data-index="${originalIndex}" title="Excluir"></i>
                </td>
            `;
            // Aplica atraso na animação
            tr.style.setProperty('--animation-delay', `${index * 0.05}s`);

            tableBody.appendChild(tr);

            // Adiciona listeners aos botões DEPOIS que o TR está no DOM
            const editBtn = tr.querySelector('.edit-btn');
            const deleteBtn = tr.querySelector('.delete-btn');
            
            if(editBtn) editBtn.addEventListener('click', () => {
                const idx = parseInt(editBtn.getAttribute('data-index'));
                 if(!isNaN(idx)) openModal(idx);
            });
             if(deleteBtn) deleteBtn.addEventListener('click', () => {
                 const idx = parseInt(deleteBtn.getAttribute('data-index'));
                 if(!isNaN(idx)) openDeleteModal(idx);
            });

        });
    };
    
    // CSS para a animação de entrada da linha (garante que existe)
     if (!document.getElementById('tableRowAnimationStyle')) {
         const style = document.createElement('style');
         style.id = 'tableRowAnimationStyle';
         style.innerHTML = `
            .inventory-table tbody td { 
                opacity: 0; 
                transform: translateY(10px); 
                animation: fadeInRow 0.4s ease forwards; 
                animation-delay: var(--animation-delay, 0s);
            }
            @keyframes fadeInRow { 
                to { 
                    opacity: 1; 
                    transform: translateY(0); 
                } 
            }
        `;
         document.head.appendChild(style);
     }


    // --- Função de pesquisa ---
    if(searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();
            const filteredAssets = assetsData.filter(asset => 
                (asset.assetName && asset.assetName.toLowerCase().includes(searchTerm)) ||
                (asset.assetId && asset.assetId.toLowerCase().includes(searchTerm)) ||
                (asset.status && asset.status.toLowerCase().includes(searchTerm)) ||
                (asset.condition && asset.condition.toLowerCase().includes(searchTerm)) ||
                (asset.type && asset.type.toLowerCase().includes(searchTerm))
            );
            renderTable(filteredAssets);
        });
    }

    // --- Renderização Inicial ---
    if (tableBody) {
        renderTable(assetsData);
    } else {
        console.warn("Elemento 'inventory-table-body' não encontrado nesta página.");
    }

}); // Fim do DOMContentLoaded


/**
 * Gestor do Menu Lateral e Navegação Animada
 */
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Seleção dos Elementos do DOM
    const botaoMenu = document.querySelector('.botao-menu');
    const menuLateral = document.querySelector('.menu-lateral');
    const conteudo = document.querySelector('.conteudo');
    const background = document.querySelector('.background');
    const navLinks = document.querySelectorAll('.menu-lateral ul li a'); // Seleciona os links do menu principal

    // Verificação de elementos essenciais
    if (!botaoMenu || !menuLateral || !conteudo || !background) {
        console.warn('Aviso: Um ou mais elementos essenciais do menu não foram encontrados nesta página.');
        // Não retorna aqui, pois a navegação ainda pode precisar funcionar
    }

    // 2. Função para Gerir o Estado do Menu (Abrir/Fechar)
    const toggleMenu = (forceClose = false) => {
        // Só executa se os elementos existirem
        if (!menuLateral || !botaoMenu || !conteudo || !background) return; 

        if (forceClose) {
            menuLateral.classList.remove('ativo');
            botaoMenu.classList.remove('ativo');
            conteudo.classList.remove('ativo');
            background.classList.remove('ativo');
        } else {
            menuLateral.classList.toggle('ativo');
            botaoMenu.classList.toggle('ativo');
            conteudo.classList.toggle('ativo');
            background.classList.toggle('ativo');
        }
    };
    
    // 3. Adição dos Eventos de Clique (Listeners)
    
    // Botão do menu abre/fecha
    botaoMenu?.addEventListener('click', () => toggleMenu()); // Usa a função centralizada

    // Fundo escuro fecha o menu
    background?.addEventListener('click', () => {
        if (menuLateral?.classList.contains('ativo')) {
            toggleMenu(true); // Força o fecho
        }
    });

    // 4. Lógica de Navegação Animada para Links do Menu
    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            // Impede a navegação imediata
            event.preventDefault(); 
            
            const targetUrl = link.href; // Guarda o URL de destino
            const menuIsActive = menuLateral?.classList.contains('ativo');

            // Se o menu estiver aberto, fecha-o primeiro com animação
            if (menuIsActive) {
                toggleMenu(true); // Força o fecho do menu

                // Espera a animação de fecho do menu terminar (500ms)
                setTimeout(() => {
                    // Navega para a nova página DEPOIS da animação
                    window.location.href = targetUrl; 
                }, 500); // <-- Ajuste este tempo se a sua animação CSS for diferente
            } else {
                // Se o menu já estiver fechado, navega imediatamente
                window.location.href = targetUrl;
            }
        });
    });

}); // Fim do DOMContentLoaded

