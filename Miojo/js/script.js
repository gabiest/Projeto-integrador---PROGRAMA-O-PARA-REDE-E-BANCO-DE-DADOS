/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

/**
 * Gestor do Menu Lateral e Navegação
 * Este script controla a funcionalidade de abrir e fechar o menu lateral
 * e a navegação SPA (Single Page Application), se aplicável.
 */
document.addEventListener('DOMContentLoaded', () => {
    
    // --- SELEÇÃO DE ELEMENTOS DO MENU ---
    const botaoMenu = document.querySelector('.botao-menu');
    const menuLateral = document.querySelector('.menu-lateral');
    const conteudo = document.querySelector('.conteudo');
    const background = document.querySelector('.background');
    const navLinks = document.querySelectorAll('.nav-link'); // Para SPA
    const pages = document.querySelectorAll('.page');     // Para SPA

    // --- LÓGICA DE USUÁRIO (carregar e atualizar nome/email) ---
    // Funções globais para abrir/fechar modais usados na página de configurações
    window.openModal = (id) => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'flex';
    };
    window.closeModal = (id) => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    };

    const loadUserToUI = () => {
        try {
            const raw = localStorage.getItem('app_user');
            if (!raw) return;
            const user = JSON.parse(raw);
            const profileSpan = document.getElementById('profile-username');
            if (profileSpan && user.name) profileSpan.textContent = user.name;
            const currentUsername = document.getElementById('current-username');
            if (currentUsername && user.name) currentUsername.value = user.name;
            const currentEmail = document.getElementById('current-email');
            if (currentEmail && user.email) currentEmail.value = user.email;
        } catch (e) {
            console.warn('Erro carregando usuário do localStorage', e);
        }
    };

    // Ao submeter o formulário de alterar nome/email, atualiza localStorage e UI
    const bindProfileForm = () => {
        const form = document.getElementById('form-nome-email');
        if (!form) return;
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const newName = document.getElementById('new-username')?.value.trim() || '';
            const newEmail = document.getElementById('new-email')?.value.trim() || '';
            try {
                // Atualiza localStorage preservando campos que possam existir
                const raw = localStorage.getItem('app_user');
                const prev = raw ? JSON.parse(raw) : {};
                const updated = { ...prev, name: newName || prev.name || 'Usuário', email: newEmail || prev.email || '' };
                localStorage.setItem('app_user', JSON.stringify(updated));
                // Atualiza UI
                const profileSpan = document.getElementById('profile-username');
                if (profileSpan) profileSpan.textContent = updated.name;
                const currentUsername = document.getElementById('current-username');
                if (currentUsername) currentUsername.value = updated.name;
                const currentEmail = document.getElementById('current-email');
                if (currentEmail) currentEmail.value = updated.email;
                // Fecha modal
                if (window.closeModal) window.closeModal('modal-nome-email');
            } catch (err) {
                console.warn('Erro ao salvar novo nome/email', err);
            }
        });
    };

    // Executa carregamento e binding
    loadUserToUI();
    bindProfileForm();

    // --- LÓGICA DO MENU LATERAL ---
    const toggleMenu = () => {
        if (menuLateral) menuLateral.classList.toggle('ativo');
        if (botaoMenu) botaoMenu.classList.toggle('ativo');
        if (conteudo) conteudo.classList.toggle('ativo');
        if (background) background.classList.toggle('ativo');
    };

    if (botaoMenu) botaoMenu.addEventListener('click', toggleMenu);
    if (background) {
        background.addEventListener('click', () => {
            if (menuLateral && menuLateral.classList.contains('ativo')) {
                toggleMenu();
            }
        });
    }

    // --- LÓGICA DE NAVEGAÇÃO SPA (se você usa) ---
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
            navLinks.forEach(nav => nav.classList.remove('active'));
            link.classList.add('active');
            showPage(pageId);
            if (window.innerWidth < 768 && menuLateral && menuLateral.classList.contains('ativo')) {
                toggleMenu();
            }
        });
    });
    if (pages.length > 0) showPage('home'); // Mostra a home page por padrão

    
    // =======================================================
    // === LÓGICA DA PÁGINA DE DASHBOARD (Gráficos e KPIs) ===
    // =======================================================
    
    // Verifica se estamos na página do Dashboard olhando para um elemento chave
    const dashboardGrid = document.querySelector('.dashboard-grid');
    if (dashboardGrid && typeof Assets !== 'undefined') {

        // --- CÁLCULO DOS KPIs ---
        const totalAssets = Assets.length;
        const onlineAssets = Assets.filter(asset => asset.status === 'Online').length;
        // **FIX**: Lógica de Alertas atualizada para novas condições
        const alertAssets = Assets.filter(asset => asset.condition === 'Manutenção' || asset.condition === 'Alocado').length;
        const offlineAssets = totalAssets - onlineAssets;

        // --- ATUALIZAÇÃO DOS CARTÕES (KPIs) ---
        const setKPIValue = (elementId, value) => {
            const element = document.getElementById(elementId);
            if (element) element.textContent = value;
        };
        
        setKPIValue('total-assets-value', totalAssets);      // (Assumindo que você tenha um ID 'total-assets-value')
        setKPIValue('online-assets-value', onlineAssets);    // (Assumindo ID 'online-assets-value')
        setKPIValue('alert-assets-value', alertAssets);    // (Assumindo ID 'alert-assets-value')
        setKPIValue('online-assets-dash', onlineAssets);   // (Para o seu cartão 'online-assets-dash')
        setKPIValue('critical-alerts-count', alertAssets); // (Para o seu cartão 'critical-alerts-count')

        // --- LÓGICA DOS CÍRCULOS DE PROGRESSO (se houver) ---
        const onlinePercent = totalAssets > 0 ? Math.round((onlineAssets / totalAssets) * 100) : 0;
        const alertPercent = totalAssets > 0 ? Math.round((alertAssets / totalAssets) * 100) : 0;
        setKPIValue('online-assets-percent', `${onlinePercent}%`);
        setKPIValue('alert-assets-percent', `${alertPercent}%`);

        const setCircleProgress = (circleId, percent) => {
            const circle = document.getElementById(circleId);
            if (circle) {
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

        // --- FUNÇÃO PARA POPULAR TABELAS (DO DASHBOARD) ---
        const populateDashboardTable = (tableBodyId, data) => {
            const tableBody = document.getElementById(tableBodyId);
            if (!tableBody) return;
            tableBody.innerHTML = '';
            data.forEach(asset => {
                const tr = document.createElement('tr');
                // **FIX**: Lógica de Condição atualizada
                const conditionClass = asset.condition === 'Alocado' ? 'danger' : asset.condition === 'Manutenção' ? 'warning' : 'success';
                // **FIX**: Adiciona coluna Mac Address
                tr.innerHTML = `
                    <td>${asset.assetName}</td>
                    <td>${asset.macAddress || 'N/A'}</td> 
                    <td>${asset.assetId}</td>
                    <td class="${asset.status === 'Online' ? 'success' : 'danger'}">${asset.status}</td>
                    <td class="${conditionClass}">${asset.condition}</td>
                `;
                tableBody.appendChild(tr);
            });
        };
        // Popula as tabelas do dashboard (se existirem)
        populateDashboardTable('all-assets-table', Assets);
        populateDashboardTable('online-assets-table', Assets.filter(asset => asset.status === 'Online'));

        // --- LÓGICA DA TABELA "TOP ATIVOS" (com simulação) ---
        const topAssetsTableBody = document.getElementById('top-assets-table');
        if (topAssetsTableBody) {
            const assetsWithLoad = Assets.map(asset => ({
                ...asset,
                // **FIX**: Lógica de simulação de carga atualizada
                cpuLoad: asset.status === 'Offline' ? Math.floor(Math.random() * 10) : (asset.condition === 'Alocado' ? Math.floor(Math.random() * 20) + 80 : Math.floor(Math.random() * 60) + 20),
                memLoad: asset.status === 'Offline' ? Math.floor(Math.random() * 20) : (asset.condition === 'Alocado' ? Math.floor(Math.random() * 15) + 85 : Math.floor(Math.random() * 50) + 30)
            })).sort((a, b) => b.cpuLoad - a.cpuLoad).slice(0, 5);

            topAssetsTableBody.innerHTML = '';
            assetsWithLoad.forEach(asset => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${asset.assetName || '-'}</td> 
                    <td>${asset.cpuLoad || 0}%</td> 
                    <td>${asset.memLoad || 0}%</td>
                `;
                topAssetsTableBody.appendChild(tr);
            });
        }

        // --- LÓGICA DOS GRÁFICOS (CHARTS.JS) ---
        const blue = '#00BFFF';
        const success = '#41f1b6';
        const warning = '#ffbb55';
        const danger = '#ff7782';
        const textColor = '#ffffffff';
        const gridColor = 'rgba(255, 255, 255, 0.14)';
        Chart.defaults.color = textColor;
        Chart.defaults.font.family = 'Arimo';
        Chart.defaults.plugins.legend.display = false;

        function createGradient(ctx, color1, color2) {
            if (!ctx) return 'rgba(0,0,0,0)';
            const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
            gradient.addColorStop(0, color1);
            gradient.addColorStop(1, color2);
            return gradient;
        }

        // Gráfico 1: Performance da Rede (Linha)
        const performanceCtx = document.getElementById('performanceChart');
        if (performanceCtx) {
            const gradientBgLine = createGradient(performanceCtx.getContext('2d'), 'rgba(0, 191, 255, 0.3)', 'rgba(0, 191, 255, 0)');
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
        }

        // Gráfico 2: Status dos Ativos (Donut)
        const statusCtx = document.getElementById('statusChart');
        if (statusCtx) {
            new Chart(statusCtx, {
                type: 'doughnut',
                data: {
                    // **FIX**: Labels e dados atualizados
                    labels: ['Online', 'Offline', 'Manutenção/Alocado'],
                    datasets: [{
                        data: [onlineAssets, offlineAssets, alertAssets],
                        backgroundColor: [success, danger, warning],
                        borderColor: '#fff', // Cor de fundo do seu card
                        borderWidth: 4,
                        hoverOffset: 8
                    }]
                },
                options: {
                    cutout: '70%',
                    plugins: { legend: { display: true, position: 'bottom', labels: { padding: 20 } } }
                }
            });
        }

        // Gráfico 3: Tipo de Ativos (Barra)
        const assetTypeCtx = document.getElementById('assetTypeChart');
        if (assetTypeCtx) {
            const blue3Gradient = createGradient(assetTypeCtx.getContext('2d'), '#00BFFF', 'rgba(0, 191, 255, 0.3)', 'rgba(0, 191, 255, 0)');
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

        // --- LÓGICA DE ANIMAÇÕES DE ENTRADA E CONTAGEM ---
        const cards = document.querySelectorAll('.kpi-card, .chart-card, .table-card');
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.08}s`;
            card.classList.add('animate-entrada');
        });

        const animateCountUp = (elementId, finalValue, duration = 1500) => {
            const element = document.getElementById(elementId);
            if (!element) return;
            let startTimestamp = null;
            const step = (timestamp) => {
                if (!startTimestamp) startTimestamp = timestamp;
                const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                const currentValue = Math.floor(progress * finalValue);
                element.textContent = currentValue;
                if (progress < 1) {
                    window.requestAnimationFrame(step);
                }
            };
            window.requestAnimationFrame(step);
        };

        setTimeout(() => {
            // **FIX**: Lógica de contagem de alertas atualizada
            const criticalAssetsCountAnim = Assets.filter(asset => asset.condition === 'Alocado' || asset.condition === 'Manutenção').length;
            animateCountUp('online-assets-dash', onlineAssets);
            animateCountUp('critical-alerts-count', criticalAssetsCountAnim);
        }, 300);
    }

    
    // =============================================================
    // === LÓGICA DA PÁGINA DE INVENTÁRIO (Tabela CRUD) ===
    // =============================================================
    
    // Verifica se estamos na página de Inventário
    const inventoryTableBody = document.getElementById('inventory-table-body');
    if (inventoryTableBody && typeof Assets !== 'undefined') {

        // --- SELEÇÃO DE ELEMENTOS DO INVENTÁRIO ---
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

        let assetsData = [...Assets]; // Cria uma cópia local dos dados
        let assetIndexToDelete = null;

        // --- LÓGICA DO TOAST (Notificação) ---
        const showToast = (message, type = 'info', duration = 3000) => {
            if (!toastContainer) return;
            const toast = document.createElement('div');
            toast.classList.add('toast', type);
            let iconClass = 'bi-info-circle-fill';
            if (type === 'success') iconClass = 'bi-check-circle-fill';
            if (type === 'error') iconClass = 'bi-x-octagon-fill';
            toast.innerHTML = `<i class="bi ${iconClass}"></i> <span>${message}</span>`;
            toastContainer.prepend(toast);
            const removeTimer = setTimeout(() => {
                toast.style.animation = 'fadeOutToast 0.5s ease forwards';
                toast.addEventListener('animationend', () => toast.remove());
            }, duration);
            toast.addEventListener('click', () => {
                clearTimeout(removeTimer);
                toast.style.animation = 'fadeOutToast 0.3s ease forwards';
                toast.addEventListener('animationend', () => toast.remove());
            });
        };
        if (!document.getElementById('toastAnimationStyle')) {
            const style = document.createElement('style');
            style.id = 'toastAnimationStyle';
            style.innerHTML = `@keyframes fadeOutToast { from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(100%); } }`;
            document.head.appendChild(style);
        }

        // --- LÓGICA DO MODAL (Abrir/Fechar) ---
        const openModal = (index = null) => {
            if (!modal || !assetForm || !modalTitle || !assetIndexInput) return;
            assetForm.reset();
            assetIndexInput.value = '';
            if (index !== null && assetsData[index]) {
                // Modo Edição
                modalTitle.textContent = 'Editar Ativo';
                const asset = assetsData[index];
                document.getElementById('assetName').value = asset.assetName || '';
                if (document.getElementById('assetMac')) document.getElementById('assetMac').value = asset.macAddress || ''; // **FIX**
                document.getElementById('assetId').value = asset.assetId || '';
                document.getElementById('assetType').value = asset.type || '';
                document.getElementById('assetStatus').value = asset.status || 'Online';
                document.getElementById('assetCondition').value = asset.condition || 'Disponível'; // **FIX**
                assetIndexInput.value = index;
            } else {
                // Modo Adição
                modalTitle.textContent = 'Adicionar Novo Ativo';
            }
            modal.style.display = 'flex';
        };

        const closeModal = () => {
            if (modal) modal.style.display = 'none';
        };

        if (addAssetBtn) addAssetBtn.addEventListener('click', () => openModal());
        if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
        if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

        // --- LÓGICA DO MODAL DE EXCLUSÃO ---
        const openDeleteModal = (index) => {
            if (deleteModal && assetNameToDeleteSpan && assetsData[index]) {
                assetIndexToDelete = index;
                assetNameToDeleteSpan.textContent = assetsData[index].assetName;
                deleteModal.style.display = 'flex';
            }
        };
        const closeDeleteModal = () => {
            if (deleteModal) deleteModal.style.display = 'none';
            assetIndexToDelete = null;
        };
        if (cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', closeDeleteModal);
        if (deleteModal) deleteModal.addEventListener('click', (e) => { if (e.target === deleteModal) closeDeleteModal(); });

        // --- LÓGICA DE SALVAR (Submit do Formulário) ---
        if (assetForm) {
            assetForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const assetData = {
                    assetName: document.getElementById('assetName')?.value || 'Nome Indefinido',
                    macAddress: document.getElementById('assetMac')?.value || '', // **FIX**
                    assetId: document.getElementById('assetId')?.value || 'ID Indefinido',
                    type: document.getElementById('assetType')?.value || 'Outro',
                    status: document.getElementById('assetStatus')?.value || 'Online',
                    condition: document.getElementById('assetCondition')?.value || 'Disponível' // **FIX**
                };
                const indexToEdit = assetIndexInput.value;

                if (indexToEdit !== '' && assetsData[indexToEdit]) {
                    assetsData[indexToEdit] = assetData;
                    showToast(`Ativo "${assetData.assetName}" atualizado!`, 'success');
                } else {
                    assetsData.unshift(assetData);
                    showToast(`Novo ativo "${assetData.assetName}" adicionado!`, 'success');
                }
                renderTable(assetsData);
                closeModal();
            });
        }

        // --- LÓGICA DE EXCLUIR (Confirmação) ---
        if (confirmDeleteBtn) {
            confirmDeleteBtn.addEventListener('click', () => {
                if (assetIndexToDelete !== null && assetsData[assetIndexToDelete]) {
                    const deletedAssetName = assetsData[assetIndexToDelete].assetName;
                    assetsData.splice(assetIndexToDelete, 1);
                    renderTable(assetsData);
                    showToast(`Ativo "${deletedAssetName}" excluído.`, 'info');
                }
                closeDeleteModal();
            });
        }

        // --- FUNÇÃO DE RENDERIZAR TABELA (Principal do Inventário) ---
        const renderTable = (data) => {
            inventoryTableBody.innerHTML = '';
            if (data.length === 0) {
                inventoryTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem;">Nenhum ativo encontrado.</td></tr>`; // **FIX: colspan="6"**
                return;
            }

            data.forEach((asset, index) => {
                const tr = document.createElement('tr');
                const originalIndex = assetsData.findIndex(originalAsset => originalAsset.assetId === asset.assetId && originalAsset.assetName === asset.assetName);
                
                // **FIX**: Lógica de Condição atualizada
                let conditionClass = '';
                if (asset.condition === 'Alocado') {
                    conditionClass = 'danger';
                } else if (asset.condition === 'Manutenção') {
                    conditionClass = 'warning';
                } else if (asset.condition === 'Disponível') {
                    conditionClass = 'success';
                }
                const statusClass = asset.status === 'Online' ? 'success' : 'danger';

                // **FIX**: HTML da linha (tr) atualizado com Mac Address
                tr.innerHTML = `
                    <td>${asset.assetName || '-'}</td>
                    <td>${asset.macAddress || 'N/A'}</td> 
                    <td>${asset.assetId || '-'}</td>
                    <td class="${statusClass}">${asset.status || '-'}</td>
                    <td class="${conditionClass}">${asset.condition || '-'}</td>
                    <td class="action-icons">
                        <i class="bi bi-pencil-square edit-btn" data-index="${originalIndex}" title="Editar"></i>
                        <i class="bi bi-trash delete-btn" data-index="${originalIndex}" title="Excluir"></i>
                    </td>
                `;
                tr.style.setProperty('--animation-delay', `${index * 0.05}s`);
                inventoryTableBody.appendChild(tr);

                // Adiciona listeners aos botões
                tr.querySelector('.edit-btn')?.addEventListener('click', () => {
                    const idx = parseInt(tr.querySelector('.edit-btn').getAttribute('data-index'));
                    if (!isNaN(idx)) openModal(idx);
                });
                tr.querySelector('.delete-btn')?.addEventListener('click', () => {
                    const idx = parseInt(tr.querySelector('.delete-btn').getAttribute('data-index'));
                    if (!isNaN(idx)) openDeleteModal(idx);
                });
            });
        };

        // --- CSS DE ANIMAÇÃO DA TABELA ---
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
                    to { opacity: 1; transform: translateY(0); } 
                }`;
            document.head.appendChild(style);
        }

        // --- LÓGICA DE PESQUISA ---
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase().trim();
                const filteredAssets = assetsData.filter(asset =>
                    (asset.assetName && asset.assetName.toLowerCase().includes(searchTerm)) ||
                    (asset.macAddress && asset.macAddress.toLowerCase().includes(searchTerm)) || // **FIX**
                    (asset.assetId && asset.assetId.toLowerCase().includes(searchTerm)) ||
                    (asset.status && asset.status.toLowerCase().includes(searchTerm)) ||
                    (asset.condition && asset.condition.toLowerCase().includes(searchTerm)) ||
                    (asset.type && asset.type.toLowerCase().includes(searchTerm))
                );
                renderTable(filteredAssets);
            });
        }

        // --- RENDERIZAÇÃO INICIAL ---
        renderTable(assetsData);
    }

}); // Fim do DOMContentLoaded principal

// =======================================================
// == FUNÇÕES DE CONTROLE DE MODAIS (POP UPS) GERAIS ===
// =======================================================

// Função principal para abrir qualquer modal
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    const background = document.querySelector('.background'); // Usando o background do menu
    
    if (modal) {
        modal.style.display = 'flex';
        // Pequeno timeout para garantir que o CSS de transição funcione
        setTimeout(() => {
            modal.style.opacity = '1';
        }, 10);
    }
    
    // Opcional: Fechar o menu lateral ao abrir o modal se ele estiver aberto
    const menu = document.querySelector('.menu-lateral');
    const botaoMenu = document.querySelector('.botao-menu');
    if (menu && menu.classList.contains('ativo')) {
        menu.classList.remove('ativo');
        botaoMenu.classList.remove('ativo');
        if (background) background.classList.remove('ativo');
    }
}

// Função principal para fechar qualquer modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.opacity = '0';
        // Espera a transição do CSS (definida no seu .modal-overlay) antes de esconder
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300); // Deve ser um pouco maior que a transição CSS
    }
}

// Função genérica para fechar ao clicar no fundo cinza (overlay)
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', function(e) {
        // Fecha apenas se o clique for no overlay, e não no conteúdo interno
        if (e.target === this) {
            closeModal(this.id);
        }
    });
});

// =======================================================
// == CONFIGURAÇÃO DOS LISTENERS DOS BOTÕES DO MENU =======
// =======================================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. NOME E ALTERAR NOME/EMAIL
    // O link no menu que leva para configurações geralmente não existe, mas vamos linkar ao cartão de perfil que você criou.
    const perfilCard = document.querySelector('.cartao-perfil');
    if (perfilCard) {
        perfilCard.onclick = () => {
            // Como você não tem um link específico, clicamos no cartão que agrupa Nome/Email
            openModal('modal-nome-email');
            document.getElementById('new-username').value = ''; // Limpa o campo de novo nome
            document.getElementById('new-email').value = ''; // Limpa o campo de novo email
        };
    }

    // 2. TROCAR SENHA
    const senhaLink = document.querySelector('a[href="#"] .bi-key').closest('.configuracao-item');
    if (senhaLink) {
        senhaLink.onclick = (e) => {
            e.preventDefault();
            openModal('modal-trocar-senha');
            document.getElementById('form-trocar-senha').reset(); // Limpa o formulário ao abrir
        };
    }
    
    // 3. ATUALIZAÇÃO DE SOFTWARE
    const updateLink = document.querySelector('a[href="#"] .bi-cloud-download').closest('.configuracao-item');
    if (updateLink) {
        updateLink.onclick = (e) => {
            e.preventDefault();
            openModal('modal-atualizacao-software');
        };
    }

    // 4. LINGUAGEM
    const langLink = document.querySelector('a[href="#"] .bi-globe').closest('.configuracao-item');
    if (langLink) {
        langLink.onclick = (e) => {
            e.preventDefault();
            openModal('modal-linguagem');
            // O valor atual do span 'Português (Brasil)' deve ser refletido no select
            const currentLangText = langLink.querySelector('.detalhe').textContent.trim();
            const selectElement = document.getElementById('language-select');
            // Busca o option que corresponde ao texto atual (precisa de lógica mais robusta em produção)
            // Aqui, apenas vamos garantir que o select esteja visível
            selectElement.value = 'pt-br'; // Define um valor padrão ou o que for mais lógico
        };
    }

    // 5. TERMOS E CONDIÇÕES
    const termosLink = document.querySelector('a[href="#"] .bi-file-earmark-text').closest('.configuracao-item');
    if (termosLink) {
        termosLink.onclick = (e) => {
            e.preventDefault();
            openModal('modal-termos-condicoes');
        };
    }


    // =======================================================
    // == TRATAMENTO DOS SUBMIT DOS FORMULÁRIOS (Exemplo) =====
    // =======================================================
    
    // 1. Form de Nome/Email
    document.getElementById('form-nome-email').onsubmit = function(e) {
        e.preventDefault();
        const newUsername = document.getElementById('new-username').value;
        const newEmail = document.getElementById('new-email').value;

        // **AQUI VOCÊ COLOCARIA A LÓGICA DE BACKEND/API**
        console.log(`Novo Nome: ${newUsername}, Novo Email: ${newEmail}`);
        alert(`Informações salvas!\nNovo Nome: ${newUsername}\nNovo Email: ${newEmail}`);

        // Atualizar a exibição na página (ex: o cartao-perfil)
        document.querySelector('.cartao-perfil .perfil-info span').textContent = newUsername;
        document.getElementById('current-email').value = newEmail; // Atualiza o campo read-only

        closeModal('modal-nome-email');
    };

    // 2. Form de Troca de Senha
    document.getElementById('form-trocar-senha').onsubmit = function(e) {
        e.preventDefault();
        const currentPass = document.getElementById('current-password').value;
        const newPass = document.getElementById('new-password').value;
        
        // **AQUI VOCÊ COLOCARIA A LÓGICA DE VERIFICAÇÃO DE SENHA ATUAL E CRIPTOGRAFIA**
        if (newPass.length < 6) {
            alert('A nova senha deve ter pelo menos 6 caracteres.');
            return;
        }
        
        console.log(`Senha alterada. Senha Atual: ${currentPass} | Nova Senha: ${newPass}`);
        alert('Senha alterada com sucesso!');
        
        closeModal('modal-trocar-senha');
    };
    
    // 4. Form de Linguagem
    document.getElementById('form-linguagem').onsubmit = function(e) {
        e.preventDefault();
        const selectedLang = document.getElementById('language-select').value;
        const langText = document.getElementById('language-select').options[document.getElementById('language-select').selectedIndex].text;
        
        // **AQUI VOCÊ COLOCARIA A LÓGICA PARA MUDAR O IDIOMA DA APLICAÇÃO**
        console.log(`Idioma selecionado: ${selectedLang}`);
        alert(`Idioma alterado para: ${langText}`);

        // Atualizar o texto no item do menu/configuração
        const langItem = document.querySelector('a[href="#"] .bi-globe').closest('.configuracao-item');
        if (langItem) {
            langItem.querySelector('.detalhe').textContent = langText;
        }
        
        closeModal('modal-linguagem');
    };
});

