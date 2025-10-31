import sqlite3

conexao = None
cursor = None

try:
    # 1. Conectar (ou criar) um banco de dados
    conexao = sqlite3.connect('meu_banco.db')
    cursor = conexao.cursor()

    # --- ETAPA DE CRIAÇÃO (CREATE) ---
    # Garante que a tabela exista
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT
    )
    ''')

    # --- DADOS DE TESTE (Opcional) ---
    # Apenas para garantir que o banco não esteja vazio
    cursor.execute("INSERT OR IGNORE INTO usuarios (id, nome, email) VALUES (?, ?, ?)", (1, 'Ana Silva', 'ana.silva@email.com'))
    cursor.execute("INSERT OR IGNORE INTO usuarios (id, nome, email) VALUES (?, ?, ?)", (2, 'Bruno Costa', 'bruno.costa@email.com'))
    conexao.commit()
    # print("Dados de exemplo inseridos/verificados.")

    # --- CONSULTA (Antes de Adicionar) ---
    print("\n--- DADOS ANTES DE ADICIONAR O NOVO USUÁRIO ---")
    cursor.execute("SELECT * FROM usuarios")
    for usuario in cursor.fetchall():
        print(usuario)

    # --- ETAPA DE ADICIONAR NOVO USUÁRIO (INSERT) ---
    # Esta é a nova parte que adiciona usuários
    
    print("\n--- ADICIONAR NOVO USUÁRIO ---")
    nome_digitado = input("Digite o nome do novo usuário: ")
    email_digitado = input("Digite o email do novo usuário: ")
    
    print(f"\nAdicionando '{nome_digitado}' ao banco de dados...")
    
    cursor.execute(
        "INSERT INTO usuarios (nome, email) VALUES (?, ?)",
        (nome_digitado, email_digitado) 
    )
    
    # 5. Salvar (comitar) a adição
    # O commit é essencial para salvar o INSERT
    conexao.commit()
    print("Usuário adicionado com sucesso.")


    # --- CONSULTA (Depois de Adicionar) ---
    print("\n--- DADOS DEPOIS DE ADICIONAR (LISTA ATUALIZADA) ---")
    # Selecionamos tudo de novo para provar que o novo usuário foi incluído
    cursor.execute("SELECT * FROM usuarios")
    
    todos_os_usuarios = cursor.fetchall()

    if not todos_os_usuarios:
        print("Nenhum usuário encontrado.")
    else:
        for usuario in todos_os_usuarios:
            print(usuario) # Agora deve mostrar o usuário novo no final da lista

except sqlite3.Error as e:
    print(f"Ocorreu um erro ao interagir com o banco de dados: {e}")
    if conexao:
        conexao.rollback() # Desfaz qualquer mudança pendente se der erro

finally:
    # 8. Fechar a conexão
    if cursor:
        cursor.close()
    if conexao:
        conexao.close()
        print("\nConexão com o banco de dados fechada.")