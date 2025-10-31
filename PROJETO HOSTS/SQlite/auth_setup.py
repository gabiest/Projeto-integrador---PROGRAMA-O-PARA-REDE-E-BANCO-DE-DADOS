import sqlite3

def setup_auth():
    try:
        conexao = sqlite3.connect('meu_banco.db')
        cursor = conexao.cursor()

        # Recriar a tabela usuarios com a coluna de senha
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            senha TEXT
        )
        ''')
        print("Tabela de usuários criada/atualizada com sucesso!")
        
        # Criar um usuário admin padrão (se não existir)
        cursor.execute('''
        INSERT OR IGNORE INTO usuarios (nome, email, senha)
        VALUES (?, ?, ?)
        ''', ('admin', 'admin@sistema.com', 'admin123'))
        
        conexao.commit()
        print("\nUsuário admin criado com sucesso!")
        print("\nCredenciais de acesso:")
        print("Email: admin@sistema.com")
        print("Senha: admin123")
        
    except sqlite3.Error as e:
        print(f"Erro ao configurar autenticação: {e}")
        
    finally:
        if cursor:
            cursor.close()
        if conexao:
            conexao.close()
            print("\nConexão com o banco de dados fechada.")

if __name__ == '__main__':
    setup_auth()