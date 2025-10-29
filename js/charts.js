
       // --- CRIAÇÃO DOS GRÁFICOS (Chart.js) ---
        // Cores e Configs AJUSTADAS PARA TEXTO BRANCO E GRADES BRANCAS
        const blue = '#00BFFF'; // Cor da linha do gráfico de performance
        const success = '#41f1b6';
        const warning = '#ffbb55';
        const danger = '#ff7782';
        const textColorChart = '#FFFFFF'; // Texto principal dos gráficos (BRANCO)
        const textSecondaryChart = 'rgba(255, 255, 255, 0.7)'; // Texto secundário (legendas, eixos) (BRANCO com transparência)
        const gridColor = 'rgba(255, 255, 255, 0.1)';
        const darkOrange = 'rgba(255, 140, 0, 0.8)'; // Linhas de grade (BRANCO bem transparente)
        const lightYellow = 'rgba(255, 215, 0, 0.8)';
        const darkGreen = 'rgba(0, 128, 128, 0.9)';   // <-- ADICIONE ESTA LINHA (Verde escuro/Teal)
        const lightGreen = success;

        // Configurações Padrão para TODOS os gráficos
        Chart.defaults.color = textColorChart; // Define a cor PADRÃO do texto do gráfico
        Chart.defaults.font.family = 'Arimo';
        Chart.defaults.plugins.legend.display = false; // Desliga legendas por padrão (ligaremos no doughnut)
        Chart.defaults.plugins.legend.labels.color = textSecondaryChart; // Cor padrão da legenda
        Chart.defaults.plugins.tooltip.titleColor = textColorChart; // Cor do título no tooltip
        Chart.defaults.plugins.tooltip.bodyColor = textSecondaryChart; // Cor do corpo no tooltip

        // Define cores dos EIXOS (ticks - os números/nomes) e das LINHAS DE GRADE
        Chart.defaults.scales.category.ticks.color = textSecondaryChart; // Eixo X (categorias - Seg, Ter...)
        Chart.defaults.scales.category.grid.color = gridColor;          // Linhas verticais da grade
        Chart.defaults.scales.linear.ticks.color = textSecondaryChart; // Eixo Y (valores - 24, 26...)
        Chart.defaults.scales.linear.grid.color = gridColor;           // Linhas horizontais da grade

        function createGradient(ctx, color1, color2) {
            // ... (sua função createGradient continua igual) ...
             if (!ctx || !ctx.canvas) return color1; 
            const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
            gradient.addColorStop(0, color1);
            gradient.addColorStop(1, color2);
            return gradient;
        }
        
        

        // --- INICIALIZAÇÃO DOS GRÁFICOS --- 
        // (O código de new Chart(...) para cada gráfico continua igual abaixo,
        // as cores dos textos já foram definidas nos Chart.defaults acima)

        // Gráfico 1: Performance
        const performanceCtx = document.getElementById('performanceChart')?.getContext('2d');
        if (performanceCtx) {
            // ... (o código para criar o gráfico de performance continua igual) ...
             const gradientBgLine = createGradient(performanceCtx, '#fff', '#fff');
            new Chart(performanceCtx, {
                type: 'line',
                data: { 
                    labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
                    datasets: [{
                        label: 'Latência (ms)',
                        data: [30, 25, 35, 28, 40, 32, 38],
                        borderColor: blue, backgroundColor: gradientBgLine, tension: 0.4, fill: true, pointBackgroundColor: blue, pointRadius: 3, pointHoverRadius: 5
                    }]
                },
                options: { 
                    maintainAspectRatio: false, 
                    scales: { 
                        y: { beginAtZero: true }, 
                        x: {} 
                    },
                    plugins: { legend: { display: false } } // Legenda desabilitada para este
                }
            });
        }

        // Gráfico 2: Status
        const statusCtx = document.getElementById('statusChart')?.getContext('2d');
        if (statusCtx) {
             // Certifique-se que totalAssets e onlineAssetsCount estão definidos antes daqui
             const offlineAssets = totalAssets - onlineAssetsCount; 
             const alertAssetsNow = assetsData.filter(a => a.condition === 'Atenção' || a.condition === 'Crítico').length; 
            new Chart(statusCtx, {
                type: 'doughnut',
                data: { 
                    labels: ['Online', 'Offline', 'Em Alerta'],
                    datasets: [{
                        data: [onlineAssetsCount, offlineAssets, alertAssetsNow],
                        backgroundColor: [successColor, dangerColor, warningColor], 
                        borderColor: 'var(--bg-card)', /* Cor de fundo do cartão para borda */
                        borderWidth: 5, 
                        hoverOffset: 8
                    }]
                },
                options: { 
                    maintainAspectRatio: false, 
                    cutout: '70%', 
                    plugins: { 
                        legend: { 
                            display: true, 
                            position: 'bottom', 
                            labels: { 
                                padding: 15, 
                                boxWidth: 12 
                                // A cor já está definida nos defaults
                            } 
                        } 
                    } 
                }
            });
        }

        // Gráfico 3: Tipo de Ativos
    const assetTypeCtx = document.getElementById('assetTypeChart')?.getContext('2d');
    if (assetTypeCtx && typeof assetsData !== 'undefined') {
         const assetTypes = assetsData.reduce((acc, asset) => {
             const type = asset.type || 'Outro';
             acc[type] = (acc[type] || 0) + 1;
             return acc;
         }, {});
         const labels = Object.keys(assetTypes);
         const dataCounts = Object.values(assetTypes);

         // --- MODIFICAÇÃO AQUI ---
         // Cria o gradiente amarelo/laranja
         const greenGradient = createGradient(assetTypeCtx, lightGreen, darkGreen); // <-- SUBSTITUA yellowGradient

        new Chart(assetTypeCtx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Quantidade',
                    data: dataCounts,
                    // Usa o novo gradiente amarelo
                    backgroundColor: yellowGradient, // <-- SUBSTITUA A LINHA ANTIGA POR ESTA
                    borderRadius: 5
                }]
            },
            options: {
                // ... (resto das opções continua igual) ...
                 maintainAspectRatio: false,
                scales: {
                    y: { ticks: { stepSize: 1 } },
                    x: {}
                },
                plugins: { legend: { display: false } }
            }
        });
    }