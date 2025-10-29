/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

/**
 * Gestor do Menu Lateral, Navegação, Dashboard, Inventário e Configurações
 * Este script unificado controla as funcionalidades principais da aplicação.
 * VERSÃO CORRIGIDA E UNIFICADA
 */
document.addEventListener('DOMContentLoaded', () => {
    
    // --- SELEÇÃO DE ELEMENTOS GERAIS ---
    const botaoMenu = document.querySelector('.botao-menu');
    const menuLateral = document.querySelector('.menu-lateral');
    const conteudo = document.querySelector('.conteudo');
    const background = document.querySelector('.background');
    const navLinks = document.querySelectorAll('.nav-link'); // Para SPA
    const pages = document.querySelectorAll('.page');     // Para SPA
    
    // --- LÓGICA DO TOAST (Notificação Global) ---
    const toastContainer = document.getElementById('toast-container');
    const showToast = (message, type = 'info', duration = 3000) => {
        // Se o container não existir em uma página, não faz nada
        if (!toastContainer) {
            console.warn('Container de Toast não encontrado nesta página.');
            return; 
        }
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
    // Adiciona estilos de animação do toast (apenas uma vez)
    if (toastContainer && !document.getElementById('toastAnimationStyle')) {
        const style = document.createElement('style');
        style.id = 'toastAnimationStyle';
        style.innerHTML = `@keyframes fadeOutToast { from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(100%); } }`;
        document.head.appendChild(style);
    }
    // Torna o showToast global para ser usado em 'onclick' no HTML
    window.showToast = showToast;


    // --- FUNÇÕES GLOBAIS DE MODAL (Definidas uma vez) ---
    // (Usando a versão mais completa que lida com animação de opacidade)
    window.openModal = (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            setTimeout(() => { // Pequeno timeout para a transição de opacidade funcionar
                modal.style.opacity = '1';
            }, 10);
        }
        // Fecha o menu lateral se estiver aberto
        if (menuLateral && menuLateral.classList.contains('ativo')) {
            toggleMenu();
        }
    };

    window.closeModal = (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.opacity = '0';
            setTimeout(() => { // Espera a transição de opacidade
                modal.style.display = 'none';
            }, 300); // Duração da transição CSS
        }
    };

    // Listener para fechar modais ao clicar no overlay
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', function(e) {
            if (e.target === this) {
                window.closeModal(this.id);
            }
        });
    });


    // --- LÓGICA DE USUÁRIO (localStorage para nome/email) ---
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

    // (Esta é a única função que lida com o form-nome-email)
    const bindProfileForm = () => {
        const form = document.getElementById('form-nome-email');
        if (!form) return; // Sai se não estiver na página de Configurações
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const newName = document.getElementById('new-username')?.value.trim() || '';
            const newEmail = document.getElementById('new-email')?.value.trim() || '';
            try {
                // Atualiza localStorage
                const raw = localStorage.getItem('app_user');
                const prev = raw ? JSON.parse(raw) : {};
                const updated = { ...prev, name: newName || prev.name || 'Usuário', email: newEmail || prev.email || '' };
                localStorage.setItem('app_user', JSON.stringify(updated));
                // Atualiza UI
                loadUserToUI(); // Re-carrega os dados para os campos
                // Fecha modal e mostra Toast
                window.closeModal('modal-nome-email');
                showToast('Informações salvas com sucesso!', 'success');
                
            } catch (err) {
                console.warn('Erro ao salvar novo nome/email', err);
                showToast('Erro ao salvar informações.', 'error');
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
        // Específico para a Home (main.welcome-screen)
        const welcomeScreen = document.querySelector('main.welcome-screen');
        if (welcomeScreen) welcomeScreen.classList.toggle('ativo');
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
    
    const dashboardGrid = document.querySelector('.dashboard-grid');
    if (dashboardGrid && typeof Assets !== 'undefined') {

        // --- CÁLCULO DOS KPIs ---
        const totalAssets = Assets.length;
        const onlineAssets = Assets.filter(asset => asset.status === 'Online').length;
        const alertAssets = Assets.filter(asset => asset.condition === 'Manutenção' || asset.condition === 'Alocado' || asset.condition === 'Crítico').length;
        const offlineAssets = totalAssets - onlineAssets;

        // --- ATUALIZAÇÃO DOS CARTÕES (KPIs) ---
        const setKPIValue = (elementId, value) => {
            const element = document.getElementById(elementId);
            if (element) element.textContent = value;
        };
        
        setKPIValue('online-assets-dash', onlineAssets);
        setKPIValue('critical-alerts-count', alertAssets);
        // 'availability-value' é atualizado pela animação

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
            if (!ctx?.canvas) return color1;
            const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
            gradient.addColorStop(0, color1);
            gradient.addColorStop(1, color2);
            return gradient;
        }

        // Gráfico 1: Performance (Se existir no HTML)
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
                options: { 
                    maintainAspectRatio: false, // <-- CORREÇÃO
                    scales: { y: { grid: { color: gridColor } }, x: { grid: { display: false } } } 
                }
            });
        }

        // Gráfico 2: Status dos Ativos (Donut)
        const statusCtx = document.getElementById('statusChart');
        if (statusCtx) {
            new Chart(statusCtx.getContext('2d'), { // Adicionado getContext('2d')
                type: 'doughnut',
                data: {
                    labels: ['Online', 'Offline', 'Manutenção/Alocado/Crítico'],
                    datasets: [{
                        data: [onlineAssets, offlineAssets, alertAssets],
                        backgroundColor: [success, danger, warning],
                        borderColor: 'transparent',
                        borderWidth: 0,
                        hoverOffset: 8
                    }]
                },
                options: {
                    maintainAspectRatio: false, // <-- CORREÇÃO
                    cutout: '70%',
                    plugins: { legend: { display: true, position: 'bottom', labels: { padding: 20 } } }
                }
            });
        }

        // Gráfico 3: Tipo de Ativos (Barra)
        const assetTypeCtx = document.getElementById('assetTypeChart');
        if (assetTypeCtx) {
            const blue3Gradient = createGradient(assetTypeCtx.getContext('2d'), '#00BFFF', 'rgba(0, 191, 255, 0.3)', 'rgba(0, 191, 255, 0)');
            new Chart(assetTypeCtx.getContext('2d'), { // Adicionado getContext('2d')
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
                            Assets.filter(a => a.type === 'Outro' || !a.type).length,
                        ],
                        backgroundColor: blue3Gradient,
                        borderRadius: 5
                    }]
                },
                options: { 
                    maintainAspectRatio: false, // <-- CORREÇÃO
                    scales: { 
                        y: { grid: { color: gridColor }, beginAtZero: true, ticks: { stepSize: 1 } }, 
                        x: { grid: { display: false } } 
                    } 
                }
            });
        }

        // --- LÓGICA DE ANIMAÇÕES DE ENTRADA E CONTAGEM ---
        const cards = document.querySelectorAll('.kpi-card, .chart-card, .table-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0'; // Garante estado inicial
            card.style.animationDelay = `${index * 0.08}s`;
            card.classList.add('animate-entrada');
        });

        const animateCountUp = (elementId, finalValue, duration = 1500, decimalPlaces = 0, suffix = '') => {
            const element = document.getElementById(elementId);
            if (!element) return;
            let startTimestamp = null;
            const step = (timestamp) => {
                if (!startTimestamp) startTimestamp = timestamp;
                const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                const currentValue = progress * finalValue;
                element.textContent = currentValue.toFixed(decimalPlaces) + suffix;
                if (progress < 1) {
                    window.requestAnimationFrame(step);
                } else {
                    element.textContent = finalValue.toFixed(decimalPlaces) + suffix;
                }
            };
            window.requestAnimationFrame(step);
        };

        // Chama as animações
        setTimeout(() => {
            animateCountUp('online-assets-dash', onlineAssets, 1500, 0, '');
            animateCountUp('critical-alerts-count', alertAssets, 1500, 0, '');
            animateCountUp('availability-value', 99.8, 2500, 1, '%'); // <-- CORREÇÃO (duração maior)
        }, 300);
    }

    
    // =============================================================
    // === LÓGICA DA PÁGINA DE INVENTÁRIO (Tabela CRUD) ===
    // =============================================================
    
    const inventoryTableBody = document.getElementById('inventory-table-body');
    if (inventoryTableBody && typeof Assets !== 'undefined') {

        // --- SELEÇÃO DE ELEMENTOS DO INVENTÁRIO ---
        const searchInput = document.getElementById('search-input');
        const addAssetBtn = document.getElementById('add-asset-btn');
        const modal = document.getElementById('asset-modal');
        const cancelBtn = document.getElementById('cancel-btn'); // Específico do modal 'asset-modal'
        const assetForm = document.getElementById('asset-form');
        const modalTitle = document.getElementById('modal-title');
        const assetIndexInput = document.getElementById('assetIndex');
        const deleteModal = document.getElementById('delete-confirm-modal');
        const cancelDeleteBtn = document.getElementById('cancel-delete-btn'); // Específico do 'delete-modal'
        const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
        const assetNameToDeleteSpan = document.getElementById('asset-name-to-delete');

        let assetsData = [...Assets]; // Cria uma cópia local dos dados
        let assetIndexToDelete = null;

        // --- LÓGICA DO MODAL (Abrir/Fechar) ---
        // (Usa as funções globais window.openModal/closeModal)
        if (addAssetBtn) {
            addAssetBtn.addEventListener('click', () => {
                assetForm.reset();
                assetIndexInput.value = ''; // Limpa o índice
                modalTitle.textContent = 'Adicionar Novo Ativo';
                window.openModal('asset-modal');
            });
        }
        if (cancelBtn) cancelBtn.addEventListener('click', () => window.closeModal('asset-modal'));
        if (cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', () => window.closeModal('delete-confirm-modal'));


        // --- LÓGICA DE SALVAR (Submit do Formulário) ---
        if (assetForm) {
            assetForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const assetData = {
                    assetName: document.getElementById('assetName')?.value || 'Nome Indefinido',
                    macAddress: document.getElementById('macAddress')?.value || 'ID Indefinido', // <-- CORREÇÃO (de assetMac)
                    assetId: document.getElementById('assetId')?.value || 'ID Indefinido',
                    type: document.getElementById('assetType')?.value || 'Outro',
                    status: document.getElementById('assetStatus')?.value || 'Online',
                    condition: document.getElementById('assetCondition')?.value || 'Disponível'
                };
                const indexToEdit = assetIndexInput.value;

                if (indexToEdit !== '' && assetsData[indexToEdit]) {
                    // Modo Edição
                    assetsData[indexToEdit] = assetData;
                    showToast(`Ativo "${assetData.assetName}" atualizado!`, 'success');
                } else {
                    // Modo Adição
                    assetsData.unshift(assetData); // Adiciona no início
                    showToast(`Novo ativo "${assetData.assetName}" adicionado!`, 'success');
                }
                renderTable(assetsData); // Atualiza a tabela
                window.closeModal('asset-modal'); // Fecha o modal
            });
        }

        // --- LÓGICA DE EXCLUIR (Confirmação) ---
        if (confirmDeleteBtn) {
            confirmDeleteBtn.addEventListener('click', () => {
                if (assetIndexToDelete !== null && assetsData[assetIndexToDelete]) {
                    const deletedAssetName = assetsData[assetIndexToDelete].assetName;
                    assetsData.splice(assetIndexToDelete, 1); // Remove o item
                    renderTable(assetsData);
                    showToast(`Ativo "${deletedAssetName}" excluído.`, 'info');
                }
                window.closeModal('delete-confirm-modal');
                assetIndexToDelete = null; // Reseta o índice
            });
        }

        // --- FUNÇÃO DE RENDERIZAR TABELA (Principal do Inventário) ---
        const renderTable = (data) => {
            inventoryTableBody.innerHTML = '';
            if (data.length === 0) {
                inventoryTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem;">Nenhum ativo encontrado.</td></tr>`;
                return;
            }

            data.forEach((asset, index) => {
                const tr = document.createElement('tr');
                // Encontra o índice REAL do item no array 'assetsData' original
                const originalIndex = assetsData.findIndex(originalAsset => 
                    originalAsset.assetId === asset.assetId && originalAsset.assetName === asset.assetName
                );
                
                // --- CORREÇÃO (Lógica de Condição) ---
                let conditionClass = '';
                if (asset.condition === 'Alocado' || asset.condition === 'Crítico') {
                    conditionClass = 'danger';
                } else if (asset.condition === 'Manutenção') {
                    conditionClass = 'warning';
                } else if (asset.condition === 'Disponível' || asset.condition === 'Saudável') {
                    conditionClass = 'success';
                }
                // --- Fim da Correção ---
                
                const statusClass = asset.status === 'Online' ? 'success' : 'danger';

                tr.innerHTML = `
                    <td>${asset.assetName || '-'}</td>
                    <td>${asset.macAddress || '-'}</td> 
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
                tr.querySelector('.edit-btn')?.addEventListener('click', (e) => {
                    const idx = parseInt(e.target.getAttribute('data-index'));
                    if (!isNaN(idx) && assetsData[idx]) {
                        // Preenche o modal de edição com os dados
                        assetForm.reset();
                        assetIndexInput.value = idx; // Guarda o índice original
                        modalTitle.textContent = 'Editar Ativo';
                        const assetToEdit = assetsData[idx];
                        document.getElementById('assetName').value = assetToEdit.assetName || '';
                        document.getElementById('macAddress').value = assetToEdit.macAddress || '';
                        document.getElementById('assetId').value = assetToEdit.assetId || '';
                        document.getElementById('assetType').value = assetToEdit.type || '';
                        document.getElementById('assetStatus').value = assetToEdit.status || 'Online';
                        document.getElementById('assetCondition').value = assetToEdit.condition || 'Disponível';
                        window.openModal('asset-modal');
                    }
                });
                tr.querySelector('.delete-btn')?.addEventListener('click', (e) => {
                    const idx = parseInt(e.target.getAttribute('data-index'));
                    if (!isNaN(idx) && assetsData[idx]) {
                        assetIndexToDelete = idx; // Guarda o índice original
                        assetNameToDeleteSpan.textContent = assetsData[idx].assetName;
                        window.openModal('delete-confirm-modal');
                    }
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
                    (asset.macAddress && asset.macAddress.toLowerCase().includes(searchTerm)) || 
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


    // =======================================================
    // == LÓGICA DA PÁGINA DE CONFIGURAÇÕES
    // =======================================================
    // (Apenas adiciona listeners se os elementos existirem nesta página)

    // --- BINDING DOS LINKS PARA ABRIR MODAIS ---
    // (Usa as funções globais window.openModal/closeModal)

    // 1. Cartão de Perfil (abre modal nome/email)
    const perfilCard = document.querySelector('.cartao-perfil');
    if (perfilCard) {
        perfilCard.onclick = () => {
            // Limpa campos antes de abrir
            const newUsername = document.getElementById('new-username');
            const newEmail = document.getElementById('new-email');
            if (newUsername) newUsername.value = '';
            if (newEmail) newEmail.value = '';
            window.openModal('modal-nome-email');
        };
    }
    
    // (O formulário 'form-nome-email' já está sendo tratado pela função 'bindProfileForm' no topo)


    // 2. Link "Trocar Senha"
    // (Seu HTML original não tinha 'onclick', então usamos querySelector)
    const senhaLink = document.querySelector('a[href="#"] .bi-key')?.closest('.configuracao-item');
    if (senhaLink) {
        senhaLink.onclick = (e) => {
            e.preventDefault();
            window.openModal('modal-trocar-senha');
        };
    }

    // Formulário "Trocar Senha" (Substitui o alert() por showToast())
    const formTrocarSenha = document.getElementById('form-trocar-senha');
    if (formTrocarSenha) {
        formTrocarSenha.onsubmit = function(e) {
            e.preventDefault();
            const newPass = document.getElementById('new-password').value;
            const confirmPass = document.getElementById('confirm-new-password').value;

            if (newPass.length < 6) {
                showToast('A nova senha deve ter pelo menos 6 caracteres.', 'error'); 
                return;
            }
            if (newPass !== confirmPass) {
                showToast('As senhas não coincidem.', 'error');
                return;
            }
            
            // Lógica de salvar (simulação)
            console.log('Senha alterada (simulação)');
            
            window.closeModal('modal-trocar-senha');
            showToast('Senha alterada com sucesso!', 'success');
        };
    }
    
    // 3. Link "Atualização de Software"
    const updateLink = document.querySelector('a[href="#"] .bi-cloud-download')?.closest('.configuracao-item');
    if (updateLink) {
        updateLink.onclick = (e) => {
            e.preventDefault();
            window.openModal('modal-atualizacao-software');
        };
    }
    // (O botão 'Verificar' dentro do modal já tem o onclick="showToast(...)" no HTML)


    // 4. Link "Termos e Condições"
    const termosLink = document.querySelector('a[href="#"] .bi-file-earmark-text')?.closest('.configuracao-item');
    if (termosLink) {
        termosLink.onclick = (e) => {
            e.preventDefault();
            window.openModal('modal-termos-condicoes');
        };
    }

    // 5. Formulário de Linguagem (Se existir)
    const formLinguagem = document.getElementById('form-linguagem');
    if (formLinguagem) {
        formLinguagem.onsubmit = function(e) {
            e.preventDefault();
            const selectedLang = document.getElementById('language-select').value;
            const langText = document.getElementById('language-select').options[document.getElementById('language-select').selectedIndex].text;
            
            console.log(`Idioma selecionado: ${selectedLang}`);
            // alert(`Idioma alterado para: ${langText}`); // <-- REMOVIDO
            
            const langItem = document.querySelector('a[href="#"] .bi-globe')?.closest('.configuracao-item');
            if (langItem) {
                langItem.querySelector('.detalhe').textContent = langText;
            }
            
            window.closeModal('modal-linguagem');
            showToast(`Idioma alterado para: ${langText}`, 'info'); // <-- SUBSTITUÍDO
        };
    }

    // 6. Lógica do "Olho da Senha" (na página de Configurações)
    document.querySelectorAll('.password-toggle-icon').forEach(icon => {
        icon.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const inputField = document.getElementById(targetId);
            if (inputField) {
                if (inputField.type === 'password') {
                    inputField.type = 'text';
                    this.classList.remove('bi-eye-slash-fill');
                    this.classList.add('bi-eye-fill');
                } else {
                    inputField.type = 'password';
                    this.classList.remove('bi-eye-fill');
                    this.classList.add('bi-eye-slash-fill');
                }
            }
        });
    });

}); // --- FIM DO ÚNICO 'DOMContentLoaded' ---