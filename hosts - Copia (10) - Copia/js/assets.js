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

