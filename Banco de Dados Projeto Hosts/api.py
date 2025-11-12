# --- Importações Essenciais ---
import sqlite3
import datetime
from flask import Flask, request, jsonify

# --- Configuração do Aplicativo Flask ---
app = Flask(__name__)
DB_FILE = 'meu_banco.db' # Nosso banco de dados central

# --- Função de Conexão (Centralizada) ---
def conectar():
    """
    Cria e retorna uma conexão com o banco.
    Usamos 'row_factory' para que o banco retorne dicionários,
    o que facilita muito a conversão para JSON.
    """
    conexao = sqlite3.connect(DB_FILE)
    conexao.row_factory = sqlite3.Row 
    return conexao

# --- Função de Registro de Alertas (Centralizada) ---
def registrar_alerta(tipo, mensagem):
    """
    Insere um novo registro na tabela 'alertas'.
    """
    try:
        data_agora = datetime.datetime.now().isoformat()
        conexao = conectar()
        conexao.execute(
            "INSERT INTO alertas (data_hora, tipo_alerta, mensagem) VALUES (?, ?, ?)",
            (data_agora, tipo, mensagem)
        )
        conexao.commit()
    except Exception as e:
        # Apenas imprime o erro no console do servidor, não para a API
        print(f"ERRO AO REGISTRAR ALERTA: {e}")
    finally:
        if conexao:
            conexao.close()

# --- Inicialização: Criar todas as tabelas ---
def criar_tabelas_iniciais():
    """
    Executada uma vez no início para garantir que TODAS
    as nossas tabelas existam.
    """
    try:
        conexao = conectar()
        
        # 1. Tabela de Usuários (com 'senha', como você ajustou)
        conexao.execute('''
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            email TEXT,
            senha TEXT NOT NULL
        )''')
        
        # 2. Tabela de Ativos (com 'data_inicio')
        conexao.execute('''
        CREATE TABLE IF NOT EXISTS ativos_online (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            ip_address TEXT,
            mac_address TEXT,
            status TEXT,
            condicao TEXT,
            data_inicio TEXT
        )''')
        
        # 3. Tabela de Alertas
        conexao.execute('''
        CREATE TABLE IF NOT EXISTS alertas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            data_hora TEXT NOT NULL,
            tipo_alerta TEXT,
            mensagem TEXT
        )''')
        
        conexao.commit()
        print("Todas as tabelas (Usuários, Ativos, Alertas) foram verificadas/criadas.")
    except Exception as e:
        print(f"Erro ao criar tabelas: {e}")
    finally:
        if conexao:
            conexao.close()

# =======================================================
#  ROTAS DA API (ENDPOINTS)
# =======================================================

# --- CRUD: USUÁRIOS ---

@app.route('/usuarios', methods=['GET'])
def get_usuarios():
    """(R)ead: Lista todos os usuários."""
    conexao = conectar()
    usuarios_db = conexao.execute("SELECT * FROM usuarios").fetchall()
    conexao.close()
    return jsonify([dict(usuario) for usuario in usuarios_db])

@app.route('/usuarios', methods=['POST'])
def add_usuario():
    """(C)reate: Adiciona um novo usuário (com senha)."""
    dados = request.json
    nome = dados.get('nome')
    email = dados.get('email')
    senha = dados.get('senha')

    if not nome or not email or not senha:
        return jsonify({"erro": "Nome, email e senha são obrigatórios"}), 400

    try:
        conexao = conectar()
        cursor = conexao.cursor()
        cursor.execute(
            "INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)",
            (nome, email, senha)
        )
        conexao.commit()
        novo_id = cursor.lastrowid
        conexao.close()
        return jsonify({"mensagem": "Usuário adicionado com sucesso!", "id": novo_id}), 201
    except Exception as e:
        return jsonify({"erro": str(e)}), 500

@app.route('/usuarios/<int:id_usuario>', methods=['PUT'])
def update_usuario(id_usuario):
    """(U)pdate: Atualiza um usuário (com senha)."""
    dados = request.json
    nome = dados.get('nome')
    email = dados.get('email')
    senha = dados.get('senha')

    if not nome or not email or not senha:
        return jsonify({"erro": "Nome, email e senha são obrigatórios"}), 400

    try:
        conexao = conectar()
        cursor = conexao.cursor()
        cursor.execute(
            "UPDATE usuarios SET nome = ?, email = ?, senha = ? WHERE id = ?",
            (nome, email, senha, id_usuario)
        )
        conexao.commit()
        
        if cursor.rowcount == 0:
            conexao.close()
            return jsonify({"erro": "Usuário não encontrado"}), 404
        
        conexao.close()
        return jsonify({"mensagem": "Usuário atualizado com sucesso!"})
    except Exception as e:
        return jsonify({"erro": str(e)}), 500

@app.route('/usuarios/<int:id_usuario>', methods=['DELETE'])
def delete_usuario(id_usuario):
    """(D)elete: Deleta um usuário."""
    try:
        conexao = conectar()
        cursor = conexao.cursor()
        cursor.execute("DELETE FROM usuarios WHERE id = ?", (id_usuario,))
        conexao.commit()

        if cursor.rowcount == 0:
            conexao.close()
            return jsonify({"erro": "Usuário não encontrado"}), 404
        
        conexao.close()
        return jsonify({"mensagem": "Usuário deletado com sucesso!"})
    except Exception as e:
        return jsonify({"erro": str(e)}), 500

# --- CRUD: ATIVOS ---

@app.route('/ativos', methods=['GET'])
def get_ativos():
    """(R)ead: Lista todos os ativos."""
    conexao = conectar()
    ativos_db = conexao.execute("SELECT * FROM ativos_online").fetchall()
    conexao.close()
    return jsonify([dict(ativo) for ativo in ativos_db])

@app.route('/ativos', methods=['POST'])
def add_ativo():
    """(C)reate: Adiciona um novo ativo E REGISTRA O ALERTA."""
    dados = request.json
    nome = dados.get('nome')
    ip = dados.get('ip_address')
    
    if not nome:
        return jsonify({"erro": "O campo 'nome' é obrigatório"}), 400
    
    # Pegamos os dados do JSON, usamos 'get' para evitar erros se a chave não existir
    data_inicio = datetime.datetime.now().isoformat()
    mac = dados.get('mac_address')
    status = dados.get('status', 'Pendente') # Valor padrão
    condicao = dados.get('condicao', 'Desconhecida') # Valor padrão

    try:
        conexao = conectar()
        cursor = conexao.cursor()
        cursor.execute(
            "INSERT INTO ativos_online (nome, ip_address, mac_address, status, condicao, data_inicio) VALUES (?, ?, ?, ?, ?, ?)",
            (nome, ip, mac, status, condicao, data_inicio)
        )
        conexao.commit()
        novo_id = cursor.lastrowid
        conexao.close()
        
        # *** AQUI A MÁGICA ACONTECE ***
        # Além de adicionar, também registramos o alerta.
        registrar_alerta("Adição", f"Novo ativo entrou na rede: {nome} (IP: {ip}, ID: {novo_id})")
        
        return jsonify({"mensagem": "Ativo adicionado e alerta registrado!", "id": novo_id}), 201
    except Exception as e:
        return jsonify({"erro": str(e)}), 500

@app.route('/ativos/<int:id_ativo>', methods=['PUT'])
def update_ativo(id_ativo):
    """(U)pdate: Atualiza um ativo."""
    dados = request.json
    nome = dados.get('nome')
    ip = dados.get('ip_address')
    mac = dados.get('mac_address')
    status = dados.get('status')
    condicao = dados.get('condicao')

    if not nome or not status or not condicao:
        return jsonify({"erro": "Nome, status e condição são campos obrigatórios"}), 400

    try:
        conexao = conectar()
        cursor = conexao.cursor()
        cursor.execute(
            """UPDATE ativos_online 
               SET nome = ?, ip_address = ?, mac_address = ?, status = ?, condicao = ?
               WHERE id = ?""",
            (nome, ip, mac, status, condicao, id_ativo)
        )
        conexao.commit()
        
        if cursor.rowcount == 0:
            conexao.close()
            return jsonify({"erro": "Ativo não encontrado"}), 404
        
        conexao.close()
        return jsonify({"mensagem": "Ativo atualizado com sucesso!"})
    except Exception as e:
        return jsonify({"erro": str(e)}), 500

@app.route('/ativos/<int:id_ativo>', methods=['DELETE'])
def delete_ativo(id_ativo):
    """(D)elete: Remove um ativo E REGISTRA O ALERTA."""
    try:
        conexao = conectar()
        # 1. Pega os dados do ativo ANTES de deletar (para usar no alerta)
        cursor = conexao.cursor()
        cursor.execute("SELECT nome, ip_address FROM ativos_online WHERE id = ?", (id_ativo,))
        ativo = cursor.fetchone()
        
        if not ativo:
            conexao.close()
            return jsonify({"erro": "Ativo não encontrado"}), 404

        # Guarda o nome e o IP para o alerta
        nome_ativo = ativo['nome']
        ip_ativo = ativo['ip_address']

        # 2. Deleta o ativo
        cursor.execute("DELETE FROM ativos_online WHERE id = ?", (id_ativo,))
        conexao.commit()
        conexao.close()
        
        # *** A MÁGICA ACONTECE DE NOVO ***
        # Registra o alerta de remoção.
        registrar_alerta("Remoção", f"Ativo saiu da rede: {nome_ativo} (IP: {ip_ativo}, ID: {id_ativo})")
        
        return jsonify({"mensagem": "Ativo deletado e alerta registrado!"})
    except Exception as e:
        return jsonify({"erro": str(e)}), 500

# --- CRUD: ALERTAS ---

@app.route('/alertas', methods=['GET'])
def get_alertas():
    """(R)ead: Lista todos os alertas (os mais novos primeiro)."""
    conexao = conectar()
    # Usamos "ORDER BY id DESC" para que os alertas mais recentes
    # apareçam no topo da lista.
    alertas_db = conexao.execute("SELECT * FROM alertas ORDER BY id DESC").fetchall()
    conexao.close()
    return jsonify([dict(alerta) for alerta in alertas_db])

# --- Ponto de Partida: Roda o Servidor ---
if __name__ == '__main__':
    # 1. Garante que o Flask esteja instalado (rode 'pip install Flask' no terminal)
    
    # 2. (Opcional) Se você quiser começar do zero, apague o arquivo 'meu_banco.db'
    #    antes de rodar este script.
    
    # 3. Garante que todas as tabelas existam
    criar_tabelas_iniciais() 
    
    # 4. Inicia o servidor da API
    print("=========================================================")
    print(" Servidor da API Mestre (Usuários, Ativos, Alertas)")
    print(" Rodando em: http://127.0.0.1:5000")
    print(" Use (Ctrl+C) para parar o servidor.")
    print("=========================================================")
    app.run(debug=True)