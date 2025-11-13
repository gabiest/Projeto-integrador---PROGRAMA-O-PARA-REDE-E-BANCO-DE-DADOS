/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

/**
 * Gestor do Menu Lateral, Navegação, Dashboard, Inventário e Configurações
 * Este script unificado controla as funcionalidades principais da aplicação.
 * VERSÃO CORRIGIDA E UNIFICADA COM API
 */
document.addEventListener('DOMContentLoaded', () => {
    
    // --- SELEÇÃO DE ELEMENTOS GERAIS ---
    const botaoMenu = document.querySelector('.botao-menu');
    const menuLateral = document.querySelector('.menu-lateral');
    const conteudo = document.querySelector('.conteudo');
    const background = document.querySelector('.background');
    
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

    // --- (BLOCO DE SPA REMOVIDO DAQUI) ---

    // =======================================================
    // === LÓGICA DA PÁGINA DE DASHBOARD (Gráficos e KPIs) ===
    // === VERSÃO CORRIGIDA COM API (FETCH) ===
    // =======================================================
    
    const dashboardGrid = document.querySelector('.dashboard-grid');
    if (dashboardGrid) { // Se for a página do Dashboard
    
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
        
        // Variáveis globais para guardar as instâncias dos gráficos
        let statusChartInstance = null;
        let assetTypeChartInstance = null;

        function createGradient(ctx, color1, color2) {
            if (!ctx?.canvas) return color1;
            const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
            gradient.addColorStop(0, color1);
            gradient.addColorStop(1, color2);
            return gradient;
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
        
        // --- FUNÇÕES DE BUSCA DE DADOS DA API ---
        
        async function carregarEstatisticas() {
            try {
                const response = await fetch('/api/estatisticas');
                if (!response.ok) throw new Error('Falha ao buscar estatísticas');
                const stats = await response.json();
                
                // Calcular disponibilidade
                let disponibilidade = 0.0;
                if (stats.total_ativos > 0) {
                    disponibilidade = (stats.ativos_online / stats.total_ativos * 100);
                }
                
                // Animar os valores dos KPIs
                animateCountUp('availability-value', disponibilidade, 1500, 1, '%');
                animateCountUp('online-assets-dash', stats.ativos_online, 1500, 0, '');
                // (Não temos 'alertas criticos' na API ainda, então deixamos 0)
                animateCountUp('critical-alerts-count', 0, 1500, 0, ''); 
                
            } catch (error) {
                console.error("Erro ao carregar KPIs:", error);
            }
        }
        
        async function carregarDadosDosGraficos() {
             try {
                const response = await fetch('/api/ativos');
                if (!response.ok) throw new Error('Falha ao buscar ativos');
                const assets = await response.json();
                
                // --- Preparar dados para Gráfico de Status (Donut) ---
                const onlineAssets = assets.filter(asset => asset.status === 'Online').length;
                const offlineAssets = assets.filter(asset => asset.status !== 'Online').length; // Offline, Pendente, etc.

                const statusCtx = document.getElementById('statusChart');
                if (statusCtx) {
                    if (statusChartInstance) statusChartInstance.destroy(); // Destrói gráfico antigo
                    statusChartInstance = new Chart(statusCtx.getContext('2d'), {
                        type: 'doughnut',
                        data: {
                            labels: ['Online', 'Offline'],
                            datasets: [{
                                data: [onlineAssets, offlineAssets],
                                backgroundColor: [success, danger],
                                borderColor: 'transparent',
                                borderWidth: 0,
                                hoverOffset: 8
                            }]
                        },
                        options: {
                            maintainAspectRatio: false,
                            cutout: '70%',
                            plugins: { legend: { display: true, position: 'bottom', labels: { padding: 20 } } }
                        }
                    });
                }
                
                // --- Preparar dados para Gráfico de Tipos (Barra) ---
                const assetTypeCtx = document.getElementById('assetTypeChart');
                if (assetTypeCtx) {
                    const tipos = {};
                    assets.forEach(asset => {
                        // Tenta adivinhar o tipo pelo nome
                        let tipo = 'Outros'; 
                        const nome = (asset.nome || '').toLowerCase();
                        if (nome.includes('servidor')) tipo = 'Servidores';
                        else if (nome.includes('roteador')) tipo = 'Roteadores';
                        else if (nome.includes('switch')) tipo = 'Switches';
                        else if (nome.includes('firewall')) tipo = 'Firewalls';
                        
                        tipos[tipo] = (tipos[tipo] || 0) + 1;
                    });
                
                    const blue3Gradient = createGradient(assetTypeCtx.getContext('2d'), '#00BFFF', 'rgba(0, 191, 255, 0.3)');
                    if (assetTypeChartInstance) assetTypeChartInstance.destroy(); // Destrói gráfico antigo
                    assetTypeChartInstance = new Chart(assetTypeCtx.getContext('2d'), {
                        type: 'bar',
                        data: {
                            labels: Object.keys(tipos),
                            datasets: [{
                                label: 'Quantidade',
                                data: Object.values(tipos),
                                backgroundColor: blue3Gradient,
                                borderRadius: 5
                            }]
                        },
                        options: { 
                            maintainAspectRatio: false,
                            scales: { 
                                y: { grid: { color: gridColor }, beginAtZero: true, ticks: { stepSize: 1 } }, 
                                x: { grid: { display: false } } 
                            } 
                        }
                    });
                }

            } catch (error) {
                console.error("Erro ao carregar dados dos gráficos:", error);
            }
        }
        
        // --- Carregamento Inicial do Dashboard ---
        carregarEstatisticas();
        carregarDadosDosGraficos();
    } // Fim do IF do Dashboard


    // =============================================================
    // === LÓGICA DA PÁGINA DE INVENTÁRIO (Tabela CRUD) ===
    // === VERSÃO CORRIGIDA COM API (FETCH) ===
    // =============================================================

    const inventoryTableBody = document.getElementById('inventory-table-body');

    // Só executa se estivermos na página de inventário
    if (inventoryTableBody) {

        // --- SELEÇÃO DE ELEMENTOS DO INVENTÁRIO ---
        const searchInput = document.getElementById('search-input');
        const addAssetBtn = document.getElementById('add-asset-btn');
        const modal = document.getElementById('asset-modal');
        const cancelBtn = document.getElementById('cancel-btn');
        const assetForm = document.getElementById('asset-form');
        const modalTitle = document.getElementById('modal-title');
        
        const assetIdInput = document.getElementById('assetIndex'); // Mantemos o ID do HTML
        
        const deleteModal = document.getElementById('delete-confirm-modal');
        const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
        const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
        const assetNameToDeleteSpan = document.getElementById('asset-name-to-delete');

        // API URL BASE
        const API_URL = '/api/ativos'; // <-- URL da nossa API

        let assetsData = []; // Começa VAZIO. Será preenchido pela API.
        let assetIdToDelete = null;

        // --- LÓGICA DO MODAL (Abrir/Fechar) ---
        if (addAssetBtn) {
            addAssetBtn.addEventListener('click', () => {
                assetForm.reset();
                assetIdInput.value = ''; // Limpa o ID
                modalTitle.textContent = 'Adicionar Novo Ativo';
                window.openModal('asset-modal');
            });
        }
        if (cancelBtn) cancelBtn.addEventListener('click', () => window.closeModal('asset-modal'));
        if (cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', () => window.closeModal('delete-confirm-modal'));


        // --- LÓGICA DE SALVAR (Submit do Formulário) ---
        if (assetForm) {
            assetForm.addEventListener('submit', async (e) => { // <-- Agora é async
                e.preventDefault();
                
                // 1. Coleta os dados do formulário
                const assetData = {
                    // IDs do banco (snake_case) - ATENÇÃO A ISSO
                    nome: document.getElementById('assetName')?.value || 'Nome Indefinido',
                    mac_address: document.getElementById('macAddress')?.value || '',
                    ip_address: document.getElementById('assetId')?.value || '', // NOTE: Seu form chama 'assetId' mas é o IP
                    // type: document.getElementById('assetType')?.value || 'Outro', // O 'tipo' não existe no seu banco
                    status: document.getElementById('assetStatus')?.value || 'Online',
                    condicao: document.getElementById('assetCondition')?.value || 'Disponível'
                };
                
                const idParaEditar = assetIdInput.value;
                
                let url = API_URL;
                let method = 'POST'; // Modo Adição (CREATE)
                let toastMessage = 'Ativo adicionado com sucesso!';

                if (idParaEditar) {
                    // Modo Edição (UPDATE)
                    url = `${API_URL}/${idParaEditar}`;
                    method = 'PUT';
                    toastMessage = 'Ativo atualizado com sucesso!';
                }

                // 2. Envia para a API (fetch)
                try {
                    const response = await fetch(url, {
                        method: method,
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(assetData)
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.erro || 'Falha ao salvar ativo');
                    }
                    
                    showToast(toastMessage, 'success');
                    window.closeModal('asset-modal');
                    carregarDadosDaAPI(); // RECARREGA a tabela inteira do banco

                } catch (error) {
                    console.error("Erro ao salvar:", error);
                    showToast(error.message, 'error');
                }
            });
        }

        // --- LÓGICA DE EXCLUIR (Confirmação) ---
        if (confirmDeleteBtn) {
            confirmDeleteBtn.addEventListener('click', async () => { // <-- Agora é async
                if (assetIdToDelete !== null) {
                    
                    try {
                        // 1. Envia o DELETE para a API
                        const response = await fetch(`${API_URL}/${assetIdToDelete}`, {
                            method: 'DELETE'
                        });
                        
                        if (!response.ok) {
                            const errorData = await response.json();
                            throw new Error(errorData.erro || 'Falha ao excluir ativo');
                        }
                        
                        // 2. Se deu certo, mostra o toast
                        showToast(`Ativo excluído com sucesso.`, 'info');
                        carregarDadosDaAPI(); // RECARREGA a tabela

                    } catch (error) {
                        console.error("Erro ao deletar:", error);
                        showToast(error.message, 'error');
                    }
                    
                    window.closeModal('delete-confirm-modal');
                    assetIdToDelete = null; // Reseta o ID
                }
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
                
                let conditionClass = '';
                if (asset.condicao === 'Alocado' || asset.condicao === 'Crítico') {
                    conditionClass = 'danger';
                } else if (asset.condicao === 'Manutenção') {
                    conditionClass = 'warning';
                } else if (asset.condicao === 'Disponível' || asset.condicao === 'Saudável') {
                    conditionClass = 'success';
                }
                
                const statusClass = asset.status === 'Online' ? 'success' : 'danger';

                tr.innerHTML = `
                    <td>${asset.nome || '-'}</td>
                    <td>${asset.mac_address || '-'}</td> 
                    <td>${asset.ip_address || '-'}</td>
                    <td class="${statusClass}">${asset.status || '-'}</td>
                    <td class="${conditionClass}">${asset.condicao || '-'}</td>
                    <td class="action-icons">
                        <i class="bi bi-pencil-square edit-btn" data-id="${asset.id}" title="Editar"></i>
                        <i class="bi bi-trash delete-btn" data-id="${asset.id}" title="Excluir"></i>
                    </td>
                `;
                tr.style.setProperty('--animation-delay', `${index * 0.05}s`);
                inventoryTableBody.appendChild(tr);

                // Adiciona listeners aos botões
                tr.querySelector('.edit-btn')?.addEventListener('click', (e) => {
                    const id = e.target.getAttribute('data-id');
                    const assetToEdit = assetsData.find(a => a.id == id);
                    
                    if (assetToEdit) {
                        assetForm.reset();
                        assetIdInput.value = assetToEdit.id; // Guarda o ID real do banco
                        modalTitle.textContent = 'Editar Ativo';
                        
                        document.getElementById('assetName').value = assetToEdit.nome || '';
                        document.getElementById('macAddress').value = assetToEdit.mac_address || '';
                        document.getElementById('assetId').value = assetToEdit.ip_address || ''; // Seu form chama de 'assetId'
                        document.getElementById('assetStatus').value = assetToEdit.status || 'Online';
                        document.getElementById('assetCondition').value = assetToEdit.condicao || 'Disponível';
                        window.openModal('asset-modal');
                    }
                });
                
                tr.querySelector('.delete-btn')?.addEventListener('click', (e) => {
                    const id = e.target.getAttribute('data-id');
                    const assetToDelete = assetsData.find(a => a.id == id);
                    if (assetToDelete) {
                        assetIdToDelete = assetToDelete.id; // Guarda o ID real
                        assetNameToDeleteSpan.textContent = assetToDelete.nome;
                        window.openModal('delete-confirm-modal');
                    }
                });
            });
        };

        // --- CSS DE ANIMAÇÃO DA TABELA (Não muda) ---
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

        // --- LÓGICA DE PESQUISA (Não muda) ---
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase().trim();
                const filteredAssets = assetsData.filter(asset =>
                    (asset.nome && asset.nome.toLowerCase().includes(searchTerm)) ||
                    (asset.mac_address && asset.mac_address.toLowerCase().includes(searchTerm)) || 
                    (asset.ip_address && asset.ip_address.toLowerCase().includes(searchTerm)) ||
                    (asset.status && asset.status.toLowerCase().includes(searchTerm)) ||
                    (asset.condicao && asset.condicao.toLowerCase().includes(searchTerm))
                );
                renderTable(filteredAssets);
            });
        }

        // --- NOVA FUNÇÃO PARA CARREGAR DADOS ---
        async function carregarDadosDaAPI() {
            try {
                showToast('Carregando ativos do servidor...', 'info', 1500);
                const response = await fetch(API_URL); 
                
                if (!response.ok) {
                    throw new Error(`Erro de rede: ${response.statusText}`);
                }
                
                assetsData = await response.json(); 
                renderTable(assetsData); 
                
            } catch (error) {
                console.error("Falha ao carregar ativos:", error);
                showToast('Erro ao carregar ativos do servidor.', 'error');
                inventoryTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem; color: #ff7782;">Falha ao conectar com o servidor.</td></tr>`;
            }
        }

        // --- RENDERIZAÇÃO INICIAL ---
        carregarDadosDaAPI();
    } // Fim do IF do Inventário


    // =======================================================
    // == LÓGICA DA PÁGINA DE CONFIGURAÇÕES
    // =======================================================
    
    // --- BINDING DOS LINKS PARA ABRIR MODAIS ---
    const perfilCard = document.querySelector('.cartao-perfil');
    if (perfilCard) {
        perfilCard.onclick = () => {
            const newUsername = document.getElementById('new-username');
            const newEmail = document.getElementById('new-email');
            if (newUsername) newUsername.value = '';
            if (newEmail) newEmail.value = '';
            window.openModal('modal-nome-email');
        };
    }
    
    // 2. Link "Trocar Senha"
    const senhaLink = document.querySelector('a[href="#"] .bi-key')?.closest('.configuracao-item');
    if (senhaLink) {
        senhaLink.onclick = (e) => {
            e.preventDefault();
            window.openModal('modal-trocar-senha');
        };
    }

    // Formulário "Trocar Senha"
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
            // TODO: Aqui você faria um FETCH PUT para /api/usuarios/<id> com a nova senha
            
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
            
            const langItem = document.querySelector('a[href="#"] .bi-globe')?.closest('.configuracao-item');
            if (langItem) {
                langItem.querySelector('.detalhe').textContent = langText;
            }
            
            window.closeModal('modal-linguagem');
            showToast(`Idioma alterado para: ${langText}`, 'info');
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