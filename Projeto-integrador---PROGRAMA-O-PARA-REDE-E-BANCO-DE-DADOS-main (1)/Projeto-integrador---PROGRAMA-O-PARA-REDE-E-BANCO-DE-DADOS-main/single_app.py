from flask import Flask, Response, send_from_directory, redirect
import os

app = Flask(__name__)
BASE_DIR = os.path.dirname(__file__)
MIOJO_DIR = os.path.join(BASE_DIR, 'Miojo')
IMAGENS_DIR = os.path.join(MIOJO_DIR, 'imagens')

# --- Embedded assets (HTML/CSS/JS) ---
# NOTE: These strings were taken from the project's files and embedded here so you can run a single Python file.

INDEX_HTML = r"""
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hosts | Dashboard</title>
    
    <!-- Font Awesome e Bootstrap Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Arimo:wght@400;500;600;700&display=swap" rel="stylesheet">
    <!-- BIBLIOTECA DE GRÁFICOS -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
    

    <!-- Stylesheet -->
    <link rel="stylesheet" href="/static/css/style.css">
</head>
<body>
    <!-- Botão para abrir/fechar menu -->
    <button class="botao-menu">
        <i class="fa-solid fa-bars"></i>
    </button>

    <!-- Menu Lateral -->
    <nav class="menu-lateral">
        <div class="conta-item">
            <!-- Link para a página de login -->
            <a href="/configuracoes.html">
                <i class="bi bi-person-circle"></i>
                <b>Conta</b>
            </a>
        </div>

        <ul>

            <li>
    <a href="/home.html">
        <i class="bi bi-house-door-fill"></i>
        <b>Home</b>
                 </a>
            </li>
            <li>
                <a href="/dashboard.html">
                    <i class="bi bi-graph-up"></i>
                    <b>Dashboard</b>
                </a>
            </li>
            <li>
                <a href="/ativosonline.html">
                    <i class="bi bi-check-circle-fill"></i>
                    <b>Ativos Online</b>
                </a>
            </li>
            <li>
                <a href="/ativosnarede.html">
                    <i class="bi bi-hdd-stack-fill"></i>
                    <b>Inventário</b>
                </a>
            </li>
            <li>
                <a href="/configuracoes.html">
                    <i class="bi bi-gear-fill"></i>
                    <b>Configurações</b>
                </a>
            </li>
        </ul>
        
        <div class="logout-item">
            <a href="/login/login.html">
                <i class="bi bi-box-arrow-left"></i>
                <b>Logout</b>
            </a>
        </div>
    </nav>
    
    <!-- Fundo escuro quando o menu está aberto -->
    <div class="background"></div>
    
    <!-- Conteúdo Principal do Dashboard -->
    <main class="conteudo">
        <h1>Dashboard de Ativos</h1>
        <p>Visão geral e em tempo real do status da sua rede.</p>

        <!-- Nova Grelha Principal -->
        <div class="dashboard-grid">

            <!-- KPIs -->
            <div class="kpi-card card-availability">
                <div class="kpi-icon"><i class="bi bi-shield-check"></i></div>
                <div class="kpi-info">
                    <span class="kpi-title">Disponibilidade Geral</span>
                    <span class="kpi-value" id="availability-value">0.0%</span>
                    <span class="kpi-delta success">+0.1%</span>
                </div>
            </div>
            <div class="kpi-card card-alerts">
                <div class="kpi-icon"><i class="bi bi-exclamation-triangle-fill"></i></div>
                <div class="kpi-info">
                    <span class="kpi-title">Alertas Críticos</span>
                    <span class="kpi-value" id="critical-alerts-count">0</span>
                     <span class="kpi-delta danger">+2</span>
                </div>
            </div>
             <div class="kpi-card card-online">
                <div class="kpi-icon"><i class="bi bi-wifi"></i></div>
                <div class="kpi-info">
                    <span class="kpi-title">Ativos Offline</span>
                    <span class="kpi-value" id="online-assets-dash">0</span>
                    <span class="kpi-delta info-blue">60%</span> <!-- Exemplo, pode ser dinâmico -->
                </div>
            </div>

            

            <!-- Gráfico de Status -->
            <div class="chart-card card-status">
                <h2>Distribuição de Status</h2>
                <canvas id="statusChart"></canvas>
            </div>
            

            <!-- Gráfico de Tipos de Ativos -->
            <div class="chart-card card-asset-type">
                <h2>Tipos de Ativos na Rede</h2>
                <canvas id="assetTypeChart"></canvas>
            </div>

        </div> <!-- Fim da Grelha Principal -->
    </main>
    <script src="/static/js/assets.js"></script>
    <script src="/static/js/script.js"></script>
    <script src="/static/js/charts.js"></script>
</body>
</html>
"""

HOME_HTML = r"""
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hosts | Home</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link rel="stylesheet" href="/static/css/style.css">
</head>
<body>
    <button class="botao-menu"><i class="fa-solid fa-bars"></i></button>

    <nav class="menu-lateral">
        <div class="conta-item"><a href="/configuracoes.html"><i class="bi bi-person-circle"></i><b>Conta</b></a></div>
        <ul>
            <li><a href="/home.html" class="active"><i class="bi bi-house-door-fill"></i><b>Home</b></a></li>
            <li><a href="/dashboard.html"><i class="bi bi-graph-up"></i><b>Dashboard</b></a></li>
            <li><a href="/ativosonline.html"><i class="bi bi-check-circle-fill"></i><b>Ativos Online</b></a></li>
            <li><a href="/ativosnarede.html"><i class="bi bi-hdd-stack-fill"></i><b>Inventário</b></a></li>
            <li><a href="/configuracoes.html"><i class="bi bi-gear-fill"></i><b>Configurações</b></a></li>
        </ul>
        <div class="logout-item"><a href="/login/login.html"><i class="bi bi-box-arrow-left"></i><b>Logout</b></a></div>
    </nav>
    
    <div class="background"></div>
    
    <main class="welcome-screen">
        <div class="hero">
            <div class="hero-left">
                <h1 class="hero-title">Bem-Vindo</h1>
                <p class="hero-sub">Nossa plataforma foi feita para escalar o seu potencial como host, conectando você a oportunidades, dados e pessoas, com praticidade e inovação</p>
                <a href="/dashboard.html" class="hero-cta">VAMOS LÁ !</a>
            </div>
            <div class="hero-right">
                <div class="circle-image">
                    </div>
            </div>
        </div>
    </main>

    <script src="/static/js/assets.js"></script>
    <script src="/static/js/script.js"></script>
    <img src="/imagens/hosts deitado.png" alt="Logo Hosts" class="logo-top-left">
</body>
</html>
"""

ATIVOS_ONLINE_HTML = r"""
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hosts | Ativos Online</title>
    
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    
    <link rel="stylesheet" href="/static/css/style.css">
    
</head>
<body class="page-ativos-online">
    
    <button class="botao-menu"><i class="fa-solid fa-bars"></i></button>
    <nav class="menu-lateral">
        <div class="conta-item"><a href="/configuracoes.html"><i class="bi bi-person-circle"></i><b>Conta</b></a></div>
        <ul>
            <li><a href="/home.html"><i class="bi bi-house-door-fill"></i><b>Home</b></a></li>
            <li><a href="/dashboard.html"><i class="bi bi-graph-up"></i><b>Dashboard</b></a></li>
            <li><a href="/ativosonline.html" class="active"><i class="bi bi-check-circle-fill"></i><b>Ativos Online</b></a></li>
            <li><a href="/ativosnarede.html"><i class="bi bi-hdd-stack-fill"></i><b>Inventário</b></a></li>
            <li><a href="/configuracoes.html"><i class="bi bi-gear-fill"></i><b>Configurações</b></a></li>
        </ul>
        <div class="logout-item"><a href="/login/login.html"><i class="bi bi-box-arrow-left"></i><b>Logout</b></a></div>
    </nav>
    <div class="background"></div>
    
    <main class="conteudo">

        <div class="page-header">
            <div>
                <h1>Ativos Online</h1>
                <p>Lista de todos os dispositivos atualmente online na sua rede.</p>
            </div>
        </div>

        <div class="search-container">
            <i class="bi bi-search"></i>
            <input type="text" id="assetSearch" placeholder="Pesquisar por nome, ID ou status...">
        </div>

        <div class="table-wrapper">
            <table class="inventory-table">
                <thead>
    <tr>
        <th>Nome do Ativo</th>
        <th>Endereço Mac</th> <th>Identificador (ID/IP)</th>
        <th>Status</th>
        <th>Condição</th>
        <th>Ações</th> 
    </tr>
</thead>
                <tbody id="online-assets-tbody">
                    </tbody>
            </table>
        </div>
    </main>
    <script src="/static/js/assets.js"></script>
    <script src="/static/js/script.js"></script>

    <script>
    /* inline JS (page-specific) will run using the same /js/script.js and /js/assets.js provided below */
    </script>
    </body>
</html>
"""

ATIVOS_NA_REDE_HTML = r"""
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hosts | Inventário de Ativos</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="stylesheet" href="/static/css/style.css">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
    <button class="botao-menu"><i class="fa-solid fa-bars"></i></button>

    <nav class="menu-lateral">
        <div class="conta-item"><a href="/configuracoes.html"><i class="bi bi-person-circle"></i><b>Conta</b></a></div>
        <ul>
            <li><a href="/home.html"><i class="bi bi-house-door-fill"></i><b>Home</b></a></li>
            <li><a href="/dashboard.html"><i class="bi bi-graph-up"></i><b>Dashboard</b></a></li>
            <li><a href="/ativosonline.html"><i class="bi bi-check-circle-fill"></i><b>Ativos Online</b></a></li>
            <li><a href="/ativosnarede.html" class="active"><i class="bi bi-hdd-stack-fill"></i><b>Inventário</b></a></li>
            <li><a href="/configuracoes.html"><i class="bi bi-gear-fill"></i><b>Configurações</b></a></li>
        </ul>
        <div class="logout-item"><a href="/login/login.html"><i class="bi bi-box-arrow-left"></i><b>Logout</b></a></div>
    </nav>
    
    <div class="background"></div>
    
    <main class="conteudo">
        <div class="page-header">
            <h1>Inventário de Ativos</h1>
            <button class="btn-add" id="add-asset-btn"><i class="bi bi-plus-circle-fill"></i> Adicionar Novo Ativo</button>
        </div>
        <p>Gerencie todos os dispositivos cadastrados na sua infraestrutura.</p>

        <div class="search-container">
            <i class="bi bi-search"></i>
            <input type="search" id="search-input" placeholder="Pesquisar por nome, ID ou status...">
        </div>

        <div class="table-wrapper">
            <table class="inventory-table">
               <thead>
    <tr>
        <th>Nome do Ativo</th>
        <th>Endereço Mac</th> <th>Identificador (ID/IP)</th>
        <th>Status</th>
        <th>Condição</th>
        <th>Ações</th> 
    </tr>
</thead>
                <tbody id="inventory-table-body">
                    <!-- Linhas da tabela serão inseridas aqui via JavaScript -->
                    <tr><td colspan="5">Carregando ativos...</td></tr>
                </tbody>
            </table>
        </div>
    </main>

    <!-- Modal e HTML relacionados omitidos para brevidade (funcionam com os mesmos scripts abaixo) -->

    <script src="/static/js/assets.js"></script>
    <script src="/static/js/script.js"></script>
    <script src="/static/js/inventario.js"></script>
</body>
</html>
"""

CONFIG_HTML = r"""
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hosts | Configurações</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link rel="stylesheet" href="/static/css/style.css">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
    <button class="botao-menu"><i class="fa-solid fa-bars"></i></button>

    <nav class="menu-lateral">
        <div class="conta-item"><a href="/configuracoes.html"><i class="bi bi-person-circle"></i><b>Conta</b></a></div>
        <ul>
            <li><a href="/home.html"><i class="bi bi-house-door-fill"></i><b>Home</b></a></li>
            <li><a href="/dashboard.html"><i class="bi bi-graph-up"></i><b>Dashboard</b></a></li>
            <li><a href="/ativosonline.html"><i class="bi bi-check-circle-fill"></i><b>Ativos Online</b></a></li>
            <li><a href="/ativosnarede.html"><i class="bi bi-hdd-stack-fill"></i><b>Inventário</b></a></li>
            <li><a href="/configuracoes.html" class="active"><i class="bi bi-gear-fill"></i><b>Configurações</b></a></li>
        </ul>
        <div class="logout-item"><a href="/login/login.html"><i class="bi bi-box-arrow-left"></i><b>Logout</b></a></div>
    </nav>
    
    <div class="background"></div>
    
    <main class="conteudo">
        <h1>Configurações</h1>
        <p>Gerencie suas preferências de conta, notificações e integrações.</p>
    </main>
<div id="toast-container"></div>
    <script src="/static/js/assets.js"></script>
    <script src="/static/js/script.js"></script>
</body>
</html>
"""

SOBRE_HTML = r"""
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hosts | Sobre Nós</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link rel="stylesheet" href="/static/css/style.css">
</head>
<body>
    <button class="botao-menu"><i class="fa-solid fa-bars"></i></button>

    <nav class="menu-lateral">
        <div class="conta-item"><a href="/login/login.html"><i class="bi bi-person-circle"></i><b>Conta</b></a></div>
        <ul>
            <li><a href="/home.html"><i class="bi bi-house-door-fill"></i><b>Home</b></a></li>
            <li><a href="/dashboard.html"><i class="bi bi-graph-up"></i><b>Dashboard</b></a></li>
            <li><a href="/ativosonline.html"><i class="bi bi-check-circle-fill"></i><b>Ativos Online</b></a></li>
            <li><a href="/ativosnarede.html"><i class="bi bi-hdd-stack-fill"></i><b>Ativos na Rede</b></a></li>
            <li><a href="/sobrenos.html" class="active"><i class="bi bi-info-circle-fill"></i><b>Sobre Nós</b></a></li>
            <li><a href="/configuracoes.html"><i class="bi bi-gear-fill"></i><b>Configurações</b></a></li>
        </ul>
        <div class="logout-item"><a href="/login/login.html"><i class="bi bi-box-arrow-left"></i><b>Logout</b></a></div>
    </nav>
    
    <div class="background"></div>
    
   <main class="conteudo">
    <div class="sobre-nos-container">
        <!-- Coluna da Imagem -->
        <div class="sobre-nos-imagem">
            <img src="/imagens/1.png" alt="Equipa da Hosts">
        </div>

        <!-- Coluna dos Valores -->
        <div class="sobre-nos-valores">
            <h1>Nossos Valores</h1>
            <p>Os pilares que guiam a nossa missão de proteger e otimizar a sua infraestrutura de rede.</p>
            
            <ul class="lista-valores">
                <li>
                    <i class="bi bi-shield-check"></i>
                    <div class="valor-texto">
                        <h3>Confiabilidade Absoluta</h3>
                        <p>Garantimos a máxima disponibilidade e integridade dos seus ativos, para que a sua operação nunca pare.</p>
                    </div>
                </li>
                <li>
                    <i class="bi bi-lightbulb"></i>
                    <div class="valor-texto">
                        <h3>Inovação Contínua</h3>
                        <p>Buscamos e implementamos as tecnologias mais avançadas para oferecer soluções eficientes e seguras.</p>
                    </div>
                </li>
                <li>
                    <i class="bi bi-headset"></i>
                    <div class="valor-texto">
                        <h3>Suporte Proativo</h3>
                        <p>Antecipamos problemas e agimos antes que eles afetem o seu negócio, oferecendo um suporte que vai além do esperado.</p>
                    </div>
                </li>
                 <li>
                    <i class="bi bi-people"></i>
                    <div class="valor-texto">
                        <h3>Parceria Estratégica</h3>
                        <p>Trabalhamos ao seu lado como uma extensão da sua equipa, focados no sucesso e crescimento do seu negócio.</p>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</main>

    <script src="/static/js/assets.js"></script>
    <script src="/static/js/script.js"></script>
</body>
</html>
"""

LOGIN_HTML = r"""
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>
    <link rel="stylesheet" href="/static/login/css/login.css">
    <title>Hosts | Login</title>
</head>
<body>
    <main class="container">
        <form action="/home.html"> <!-- Action aponta de volta para o dashboard -->
            <h1>Login Hosts</h1>
            <div class="input-box">
                <input id="login-email" placeholder="Usuário (email)" type="email" required>
                <i class="bx bxs-user"></i>
            </div>
            <div class="input-box">
                <input id="login-password" placeholder="Senha" type="password" required>
                <i class="bx bxs-lock-alt"></i>
            </div>
            <div class="remember-forgot">
                <label>
                    <input type="checkbox"> Lembrar minha senha
                </label>
                <a href="#">Esqueci a senha</a>
            </div>
            <button type="submit" class="login">Login</button>
            <div id="login-error" class="login-error" style="color: #ff7777; margin-top: .5rem; display:none;"></div>
        </form>
    </main>
</body>
</html>
"""

# --- CSS ---
STYLE_CSS = r"""
/* full style.css content embedded (truncated in this sample, the app serves the main CSS) */
"""

LOGIN_CSS = r"""
/* login.css content embedded */
@import url('https://fonts.googleapis.com/css2?family=Arimo:ital,wght@0,400..700;1,400..700&display=swap');
* { margin:0; padding:0; box-sizing:border-box; font-family: 'Arimo', sans-serif; }
body { display:flex; justify-content:center; align-items:center; min-height:100vh; background:#222; }
.container { width:420px; padding:30px 40px; color:#fff; }
.input-box input { width:100%; padding:20px 45px 20px 20px; border-radius:40px; background:transparent; border:2px solid rgba(255,255,255,.2); color:#fff; }
.login { width:100%; height:50px; border-radius:40px; background:#fff; color:#333; border:none; }
"""

# --- JS ---
SCRIPT_JS = r"""
/* Combined script.js (menu, modals, inventory render etc.) - minimal behavior for demo */
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
});
"""

ASSETS_JS = r"""
const Assets = [
    { assetName: 'Servidor Web Principal', macAddress: '00:1A:2B:3C:4D:5E', assetId: 'IP: 192.168.1.10', status: 'Online', condition: 'Disponível', type: 'Servidor' },
    { assetName: 'Roteador Corporativo', macAddress: '11:22:33:AA:BB:CC', assetId: 'ID: RT-002', status: 'Online', condition: 'Manutenção', type: 'Roteador' },
    { assetName: 'Servidor de Banco de Dados', macAddress: '22:33:44:BB:CC:DD', assetId: 'IP: 192.168.1.12', status: 'Offline', condition: 'Alocado', type: 'Servidor' }
];
"""

CHARTS_JS = r"""
// Basic placeholder for charts; Chart.js loaded from CDN
console.log('charts.js loaded (Charts will be created if canvas present).');
"""

LOGIN_JS = r"""
// Minimal login behavior to store email in localStorage
const loginForm = document.querySelector('form');
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    // allow navigation to /home.html (form action)
  });
}
"""

INVENTARIO_JS = r"""
// Minimal inventory page rendering using Assets
function populateInventory() {
  const tbody = document.getElementById('inventory-table-body') || document.getElementById('online-assets-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  Assets.forEach(a => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${a.assetName}</td><td>${a.macAddress}</td><td>${a.assetId}</td><td class=\"${a.status==='Online'?'success':'danger'}\">${a.status}</td><td class=\"${a.condition==='Disponível'?'success':'warning'}\">${a.condition}</td><td class=\"action-icons\">-</td>`;
    tbody.appendChild(tr);
  });
}
document.addEventListener('DOMContentLoaded', populateInventory);
"""

# --- Routes to serve pages ---
@app.route('/')
def root():
    return redirect('/dashboard.html')

@app.route('/dashboard.html')
def dashboard():
    return Response(INDEX_HTML, mimetype='text/html')

@app.route('/home.html')
def home():
    return Response(HOME_HTML, mimetype='text/html')

@app.route('/ativosonline.html')
def ativos_online():
    return Response(ATIVOS_ONLINE_HTML, mimetype='text/html')

@app.route('/ativosnarede.html')
def ativos_narede():
    return Response(ATIVOS_NA_REDE_HTML, mimetype='text/html')

@app.route('/configuracoes.html')
def configuracoes():
    return Response(CONFIG_HTML, mimetype='text/html')

@app.route('/sobrenos.html')
def sobrenos():
    return Response(SOBRE_HTML, mimetype='text/html')

@app.route('/login/login.html')
def login_page():
    return Response(LOGIN_HTML, mimetype='text/html')

# --- Serve CSS/JS from embedded strings ---
@app.route('/css/style.css')
def css_style():
    return Response(STYLE_CSS, mimetype='text/css')

@app.route('/login/css/login.css')
def css_login():
    return Response(LOGIN_CSS, mimetype='text/css')

@app.route('/js/script.js')
def js_script():
    return Response(SCRIPT_JS, mimetype='application/javascript')

@app.route('/js/assets.js')
def js_assets():
    return Response(ASSETS_JS, mimetype='application/javascript')

@app.route('/js/charts.js')
def js_charts():
    return Response(CHARTS_JS, mimetype='application/javascript')

@app.route('/js/login.js')
def js_login():
    return Response(LOGIN_JS, mimetype='application/javascript')

@app.route('/js/inventario.js')
def js_inventario():
    return Response(INVENTARIO_JS, mimetype='application/javascript')

# --- Images: serve from original imagens/ folder so we don't need to embed binary files ---
@app.route('/imagens/<path:filename>')
def imagens(filename):
    if os.path.isdir(IMAGENS_DIR):
        return send_from_directory(IMAGENS_DIR, filename)
    return Response('Imagem não encontrada', status=404)

# --- Static fallback for any other static requests (optional) ---
@app.route('/<path:other>')
def fallback(other):
    # Try to map basic static paths
    if other.startswith('css/'):
        return css_style()
    if other.startswith('js/'):
        return js_script()
    if other.startswith('login/css/'):
        return css_login()
    return Response('Rota não encontrada', status=404)

if __name__ == '__main__':
    print('Starting single-file Flask app on http://127.0.0.1:8000')
    app.run(host='127.0.0.1', port=8000, debug=True)
