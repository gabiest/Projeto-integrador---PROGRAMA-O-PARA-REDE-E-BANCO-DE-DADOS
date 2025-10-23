const Assets = [
    {
        assetName: 'Servidor Principal',
        assetId: 'SRV-001',
        status: 'Online',
        condition: 'Saudável'
    },
    {
        assetName: 'Roteador Borda',
        assetId: 'RT-BDR-01',
        status: 'Offline',
        condition: 'Falha Crítica'
    },
    {
        assetName: 'Switch Core A',
        assetId: 'SW-CORE-A',
        status: 'Online',
        condition: 'Atenção'
    },
    {
        assetName: 'Firewall Perímetro',
        assetId: 'FW-PMT-01',
        status: 'Online',
        condition: 'Saudável'
    },
    {
        assetName: 'Servidor Backup',
        assetId: 'SRV-BKP-01',
        status: 'Offline',
        condition: 'Manutenção'
    },
    {
        assetName: 'Access Point Sala Reunião',
        assetId: 'AP-REU-01',
        status: 'Online',
        condition: 'Saudável'
    }
];

// --- LÓGICA PARA DESENHAR OS GRÁFICOS NO DASHBOARD ---
document.addEventListener('DOMContentLoaded', () => {
    // Só executa se encontrar o elemento do primeiro gráfico (ou seja, se estiver na página do dashboard)
    if (document.getElementById('performanceChart')) {
        
        // Cores do tema
        const blue = '#00BFFF';
        const success = '#41f1b6';
        const warning = '#ffbb55';
        const danger = '#ff7782';
        const textColor = '#677483';
        const gridColor = 'rgba(0, 0, 0, 0.05)';
        const purpleGradient = createGradient(document.getElementById('assetTypeChart').getContext('2d'), 'rgba(144, 57, 212, 0.8)', 'rgba(114, 54, 198, 0.5)');

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
                labels: ['Online', 'Offline', 'Em Alerta'],
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
                    backgroundColor: purpleGradient,
                    borderRadius: 5
                }]
            },
            options: { scales: { y: { grid: { color: gridColor } }, x: { grid: { display: false } } } }
        });
    }
});





