# Projeto Hosts — Versão Flask (conversão)

Este repositório contém a versão convertida do site para uma aplicação Flask mínima que serve as páginas HTML existentes como templates e usa a pasta atual para arquivos estáticos (css/, js/, imagens/, login/).

Como usar (PowerShell no Windows):

```powershell
cd "d:\Downloads\Projeto-integrador---PROGRAMA-O-PARA-REDE-E-BANCO-DE-DADOS-340e24409da8260a436a64878add2b6bfb3d4a7d\Miojo"
python -m venv venv; .\venv\Scripts\Activate
pip install -r requirements.txt
# Iniciar a aplicação
python app.py
# Depois abra http://127.0.0.1:5000/ no navegador
```

Notas:
- Os arquivos estáticos (CSS, JS, imagens) permanecem nas pastas originais e são servidos diretamente pelo Flask.
- As rotas preservam os nomes de arquivo originais (ex.: `/home.html`, `/dashboard.html`, `/login/login.html`) para manter compatibilidade com links internos.
- Se quiser usar o servidor de desenvolvimento do Flask (`flask run`), exporte a variável FLASK_APP e ajuste conforme necessário.
