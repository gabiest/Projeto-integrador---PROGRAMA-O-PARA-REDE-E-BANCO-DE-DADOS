import sqlite3
import datetime
import os
import nmap
import ipaddress
import time 
import subprocess 
from getmac import get_mac_address

# --- Configurações CRÍTICAS ---
DB_FILE = 'meu_banco.db' 
TARGET_NETWORK = '192.168.0.0/24' 
# ------------------------------

# ... (As funções conectar(), netbios_lookup(), get_best_name(), get_os_guess() permanecem exatamente as mesmas) ...

def conectar():
    """Conecta ao banco de dados."""
    try:
        conexao = sqlite3.connect(DB_FILE)
        conexao.row_factory = sqlite3.Row 
        return conexao
    except sqlite3.OperationalError as e:
        print(f"ERRO DE CONEXÃO: {e}")
        raise

def netbios_lookup(ip_address):
    """Tenta obter o Nome NetBIOS (Hostname) usando o 'nbtstat' do Windows."""
    try:
        comando = ['nbtstat', '-A', ip_address]
        resultado = subprocess.run(
            comando, capture_output=True, text=True, timeout=1, check=False)
        
        for line in resultado.stdout.splitlines():
            if '<20>' in line and 'UNIQUE' in line:
                nome_netbios = line.split()[0].strip()
                if nome_netbios:
                    return nome_netbios
    except Exception:
        pass 
    return None

def get_best_name(ip, nm_host_data):
    """Tenta obter o Nome (NetBIOS ou Nmap) ou usa um genérico."""
    netbios_name = netbios_lookup(ip)
    if netbios_name:
        return netbios_name
    
    if 'hostnames' in nm_host_data:
        for h in nm_host_data['hostnames']:
            name = h.get('name')
            if name and name != 'localhost':
                return name

    return f"Dispositivo-{ip.split('.')[-1]}" 

def get_os_guess(nm_host_data):
    """Extrai a melhor estimativa de OS do resultado do Nmap."""
    try:
        if 'osmatch' in nm_host_data and nm_host_data['osmatch']:
            return nm_host_data['osmatch'][0]['name']
    except Exception:
        pass
    return "OS Desconhecido"

# --- FUNÇÃO PRINCIPAL ATUALIZADA ---

def discover_and_add_assets():
    """
    Executa um scan OTIMIZADO em 2 Etapas:
    1. Ping Scan Rápido (para achar IPs vivos)
    2. OS Scan Lento (APENAS nos IPs vivos)
    """
    nm = nmap.PortScanner()
    
    # -----------------------------------------------------------------
    # ETAPA 1: ACHAR HOSTS VIVOS (RÁPIDO)
    # -----------------------------------------------------------------
    print(f"[{datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] OTIMIZAÇÃO (1/2): Buscando hosts ativos (Ping Scan)...")
    try:
        nm.scan(hosts=TARGET_NETWORK, arguments='-sn -T4')
        print("Scan Rápido concluído.")
    except nmap.PortScannerError as e:
        print(f"ERRO CRÍTICO DO NMAP (Etapa 1): {e}")
        return

    live_hosts_ips = nm.all_hosts()
    if not live_hosts_ips:
        print("Nenhum host ativo encontrado na rede.")
        return
        
    print(f"Encontrados {len(live_hosts_ips)} hosts ativos. IPs: {live_hosts_ips}")
    live_hosts_str = ' '.join(live_hosts_ips) # Converte a lista de IPs para uma string

    # -----------------------------------------------------------------
    # ETAPA 2: BUSCAR DETALHES (OS/NOME) APENAS DOS HOSTS VIVOS
    # -----------------------------------------------------------------
    print(f"[{datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] OTIMIZAÇÃO (2/2): Buscando OS/Detalhes dos hosts ativos...")
    try:
        # Roda o scan lento (-sV -O) APENAS nos IPs que responderam
        nm.scan(hosts=live_hosts_str, arguments='-sV -O -T4')
        print("Scan Detalhado concluído. Processando e salvando no banco...")
    except nmap.PortScannerError as e:
        print(f"ERRO CRÍTICO DO NMAP (Etapa 2): {e}")
        return

    # -----------------------------------------------------------------
    # ETAPA 3: PROCESSAR E SALVAR NO BANCO
    # -----------------------------------------------------------------
    conexao = conectar()
    cursor = conexao.cursor()
    data_hora_atual = datetime.datetime.now().strftime('%d/%m/%Y %H:%M:%S')

    for host in nm.all_hosts(): # O 'nm' agora só contém os hosts vivos detalhados
        
        ip_address = host
        mac_address = nm[host]['addresses'].get('mac', 'N/A') 
        nm_host_data = nm[host]
        
        if ip_address == TARGET_NETWORK.split('/')[0]:
             continue 
             
        # --- CORREÇÃO PARA O MAC LOCAL ---
        if mac_address == 'N/A':
            mac_local = get_mac_address(ip=ip_address)
            if mac_local:
                mac_address = mac_local.upper()
        
        # 1. Resolve o nome (Plano A, B, C)
        nome_base = get_best_name(ip_address, nm_host_data)
        
        # 2. Resolve o OS
        sistema_op = get_os_guess(nm_host_data)
        
        # 3. COMBINA OS DOIS NA COLUNA NOME
        nome_ativo_final = f"{nome_base} ({sistema_op})"
        
        # ... (Restante do código para inserir ou atualizar no banco) ...
        cursor.execute(
            "SELECT id FROM ativos_online WHERE ip_address = ? OR (mac_address = ? AND mac_address != 'N/A')",
            (ip_address, mac_address)
        )
        ativo_existente = cursor.fetchone()

        if not ativo_existente:
            cursor.execute(
                """INSERT INTO ativos_online (nome, ip_address, mac_address, status, condicao, data_inicio) 
                   VALUES (?, ?, ?, ?, ?, ?)""",
                (nome_ativo_final, ip_address, mac_address, 'Online', 'Descoberto', data_hora_atual)
            )
        else:
            cursor.execute(
                "UPDATE ativos_online SET status = 'Online', nome = ?, data_inicio = ? WHERE id = ?",
                (nome_ativo_final, data_hora_atual, ativo_existente['id'])
            )
            
    conexao.commit()
    conexao.close()
    print("\nDiscovery Otimizado finalizado. Tabela atualizada com Nomes e Sistemas Operacionais.")

if __name__ == "__main__":
    discover_and_add_assets()