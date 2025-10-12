from flask import Flask, render_template, request, redirect, url_for, flash
import pandas as pd
import plotly.express as px
import json
import plotly.utils
from datetime import datetime

# --- CONFIGURAÇÃO DO FLASK ---
app = Flask(__name__)
app.config['SECRET_KEY'] = 'uma_chave_secreta_para_o_projeto_hosts' 

# CONSTANTE: Itens por página (Definida para 4 para testes de paginação)
ITEMS_PER_PAGE = 4 


# --- 1. DADOS DE EXEMPLO (MOCK DATA) ---
MOCK_DATA_CARDS = {
    'ativos_online': 24,
    'ativos_offline': 10,
    'ativos_totais': 50
}
data_chart = {
    'Dia': ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
    'Online': [24, 28, 30, 25, 29, 20, 22],
    'Offline': [10, 6, 4, 9, 5, 14, 12]
}
df_chart = pd.DataFrame(data_chart)

MOCK_ATIVOS_LIST = [
    {'id': 1, 'name': 'Servidor Web', 'status': 'online', 'ip_address': '192.168.1.100', 'mac_address': 'AA:BB:CC:DD:EE:F0', 'hostname': 'webserver', 'device_type': 'Servidor', 'last_update': datetime.now().strftime('%d/%m/%Y %H:%M:%S')},
    {'id': 2, 'name': 'Impressora Escritório', 'status': 'offline', 'ip_address': '192.168.1.200', 'mac_address': 'BB:CC:DD:EE:F0:A1', 'hostname': 'HP-Printer', 'device_type': 'Impressora', 'last_update': datetime.now().strftime('%d/%m/%Y %H:%M:%S')},
    {'id': 3, 'name': 'Workstation GAB', 'status': 'online', 'ip_address': '192.168.1.50', 'mac_address': 'C1:D2:E3:F4:G5:H6', 'hostname': 'GAB-PC', 'device_type': 'Desktop', 'last_update': datetime.now().strftime('%d/%m/%Y %H:%M:%S')},
    {'id': 4, 'name': 'Access Point Lounge', 'status': 'offline', 'ip_address': '10.0.0.15', 'mac_address': 'D2:E3:F4:G5:H6:I7', 'hostname': 'AP-Lounge', 'device_type': 'Access Point', 'last_update': datetime.now().strftime('%d/%m/%Y %H:%M:%S')},
    {'id': 5, 'name': 'Camera Externa', 'status': 'online', 'ip_address': '192.168.1.10', 'mac_address': 'E3:F4:G5:H6:I7:J8', 'hostname': 'CAM-EXT', 'device_type': 'Camera', 'last_update': datetime.now().strftime('%d/%m/%Y %H:%M:%S')},
    {'id': 6, 'name': 'Laptop TI', 'status': 'online', 'ip_address': '192.168.1.20', 'mac_address': 'E0:F1:G2:H3:I4:J5', 'hostname': 'Laptop-TI', 'device_type': 'Desktop', 'last_update': datetime.now().strftime('%d/%m/%Y %H:%M:%S')},
    {'id': 7, 'name': 'Roteador Principal', 'status': 'online', 'ip_address': '192.168.1.1', 'mac_address': '00:00:00:00:00:01', 'hostname': 'Main-Router', 'device_type': 'Servidor', 'last_update': datetime.now().strftime('%d/%m/%Y %H:%M:%S')},
    {'id': 8, 'name': 'Impressora Sala', 'status': 'online', 'ip_address': '192.168.1.25', 'mac_address': 'A1:B2:C3:D4:E5:F6', 'hostname': 'Sala-Printer', 'device_type': 'Impressora', 'last_update': datetime.now().strftime('%d/%m/%Y %H:%M:%S')},
    {'id': 9, 'name': 'Desktop Estagiário', 'status': 'offline', 'ip_address': '192.168.1.51', 'mac_address': 'F1:G2:H3:I4:J5:K6', 'hostname': 'EST-PC', 'device_type': 'Desktop', 'last_update': datetime.now().strftime('%d/%m/%Y %H:%M:%S')},
]


# --- 2. FUNÇÃO PARA CRIAR GRÁFICO PLOTLY (Mantida) ---
def create_status_chart(df):
    """Cria um gráfico de barras moderno com o Plotly, serializado para JSON."""
    df_melt = df.melt(id_vars='Dia', value_vars=['Online', 'Offline'], 
                      var_name='Status', value_name='Contagem')
    
    fig = px.bar(df_melt, x='Dia', y='Contagem', color='Status',
                 color_discrete_map={'Online': '#4e73df', 'Offline': '#6b8ee6'}, 
                 title=None) 
    
    fig.update_layout(
        plot_bgcolor='white', paper_bgcolor='white', font=dict(color='#333'), 
        margin=dict(l=20, r=20, t=20, b=20), xaxis_title=None, yaxis_title="Número de Ativos"
    )
    return json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)


# --- 3. ROTAS DA APLICAÇÃO ---

@app.context_processor
def inject_active_page():
    return {'active_page': request.endpoint} 


@app.route('/login')
def index():
    return render_template('index.html') 

@app.route('/')
def dashboard_page():
    """ Rota PRINCIPAL (/) que renderiza o DASHBOARD (dash.html). """
    graph_json = create_status_chart(df_chart)
    
    return render_template('dash.html', 
                           data=MOCK_DATA_CARDS, 
                           graphJSON=graph_json)


@app.route('/ativos_online')
def ativos_online_page():
    """ Rota para a página de Ativos Online (ativos_online.html) - VISUALIZAÇÃO COM PAGINAÇÃO. """
    
    page = request.args.get('page', 1, type=int) 
    last_refresh_time = datetime.now().strftime('%d/%m/%Y %H:%M:%S')
    
    # 1. Lista Completa Online
    full_list = [
        ativo for ativo in MOCK_ATIVOS_LIST if ativo['status'] == 'online'
    ]
    
    # 2. LÓGICA DE PAGINAÇÃO: Calcula o fatiamento (slicing)
    total_items = len(full_list)
    start = (page - 1) * ITEMS_PER_PAGE
    end = start + ITEMS_PER_PAGE
    
    # Lista de ativos na página atual
    ativos_list_page = full_list[start:end]

    # 3. Renderiza o template, passando TUDO
    return render_template('ativos_online.html', 
                           active_page='ativos_online_page', 
                           ativos_list=ativos_list_page,
                           last_refresh=last_refresh_time,
                           page=page,
                           total_items=total_items,
                           items_per_page=ITEMS_PER_PAGE) # Passa a constante para o Jinja


@app.route('/ativos_totais')
def ativos_totais_page():
    """ Rota para a página de Gerenciamento (ativoT.html) com FILTRO e PAGINAÇÃO. """
    
    # 1. Pega os parâmetros de consulta e paginação
    search_query = request.args.get('q', '').strip().lower()
    status_filter = request.args.get('status_filter', '').lower()
    type_filter = request.args.get('type_filter', '').lower()
    page = request.args.get('page', 1, type=int)
    
    # 2. LÓGICA DE FILTRO (Preenche a lista completa *filtrada*)
    ativos_list_filtered_full = []
    for ativo in MOCK_ATIVOS_LIST:
        is_search_match = True
        if search_query:
            search_data = (ativo['name'] + ativo['ip_address'] + ativo['mac_address'] + ativo['hostname']).lower()
            if search_query not in search_data: is_search_match = False
        
        is_status_match = True
        if status_filter and ativo['status'].lower() != status_filter: is_status_match = False

        is_type_match = True
        if type_filter and ativo['device_type'].lower() != type_filter: is_type_match = False
                
        if is_search_match and is_status_match and is_type_match:
            ativos_list_filtered_full.append(ativo)

    # 3. LÓGICA DE PAGINAÇÃO
    total_items = len(ativos_list_filtered_full)
    start = (page - 1) * ITEMS_PER_PAGE
    end = start + ITEMS_PER_PAGE
    
    # Lista de ativos na página atual
    ativos_list_page = ativos_list_filtered_full[start:end]

    # 4. Renderiza o template ativoT.html
    return render_template('ativoT.html', 
                           active_page='ativos_totais_page', 
                           ativos_list=ativos_list_page, # Passa APENAS a lista da página
                           search_query_val=search_query,
                           page=page,
                           total_items=total_items,
                           items_per_page=ITEMS_PER_PAGE) # CRÍTICO: Passa o total de itens para o Jinja

@app.route('/configuracoes')
def configuracoes_page():
    return render_template('configuracoes.html', active_page='configuracoes_page')

@app.route('/export/csv')
def export_csv():
    return "Função de Exportação em construção."


# --- 4. INICIALIZAÇÃO ---
if __name__ == '__main__':
    print("Servidor Flask iniciado.")
    print(f"Items por página definidos para: {ITEMS_PER_PAGE}")
    print("Acesse seu dashboard em: http://127.0.0.1:5000/")
    app.run(debug=True)