from flask import Flask, render_template, redirect, request, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
import os

app = Flask(__name__, 
                template_folder='templates',  # Pasta de templates
                static_folder='.',  # Pasta de arquivos estáticos
                static_url_path='')
app.config['SECRET_KEY'] = 'sua_chave_secreta_aqui'  # Altere isto para uma chave secreta segura
import os
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.abspath("SQlite/meu_banco.db")}'
db = SQLAlchemy(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

# Modelo do usuário usando a tabela existente
class User(UserMixin, db.Model):
    __tablename__ = 'usuarios'
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    senha = db.Column(db.String(120), nullable=True)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Rotas que mantêm os nomes de arquivo originais para compatibilidade com links existentes
PAGES = [
    'home.html',
    'dashboard.html',
    'configuracoes.html',
    'ativosonline.html',
    'ativosnarede.html',
    'sobrenos.html',
]

# Rotas protegidas que exigem login
for page in PAGES:
    route_path = f'/{page}'
    template_name = page

    def make_view(tname):
        @login_required
        def view():
            return render_template(tname)
        return view

    app.add_url_rule(route_path, endpoint=page, view_func=make_view(template_name))

# Rota de login
@app.route('/login/login.html', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        print(f"Tentativa de login - Email: {email}, Senha: {password}")  # Debug
        
        user = User.query.filter_by(email=email).first()
        if user:
            print(f"Usuário encontrado - ID: {user.id}, Email: {user.email}, Senha no banco: {user.senha}")  # Debug
        else:
            print("Usuário não encontrado no banco de dados")  # Debug
        
        if user and user.senha == password:
            login_user(user)
            print("Login bem-sucedido!")  # Debug
            return redirect('/home.html')
        else:
            print("Falha no login - senha incorreta ou usuário não existe")  # Debug
            flash('Credenciais inválidas!')
    
    return render_template('login/login.html')

# Raiz -> redireciona para o login
@app.route('/')
def index():
    return redirect(url_for('login'))

# Rota de logout
@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Cria o banco de dados e as tabelas
    port = int(os.environ.get('PORT', 5000))
    app.run(host='127.0.0.1', port=port, debug=True)
