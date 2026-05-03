/********************************************************************
 * ETAPA 1: SCRIPT DE LIMPEZA E RESET DO BANCO DE DADOS
 * Execute este bloco INTEIRO e sozinho primeiro.
 ********************************************************************/

USE solidaridata;
GO

PRINT '------------------------------------------------';
PRINT '[ETAPA 1] Iniciando Limpeza e Reset do Banco de Dados...';
PRINT '------------------------------------------------';

-- Desativa temporariamente todas as constraints de chave estrangeira
EXEC sp_msforeachtable "ALTER TABLE ? NOCHECK CONSTRAINT all";
GO

-- Deleta os dados de todas as tabelas
EXEC sp_msforeachtable "DELETE FROM ?";
GO

PRINT 'Dados de todas as tabelas foram deletados.';

-- Reseta o contador de identidade (semente) para cada tabela que possui IDENTITY
-- CORREÇÃO: Removido o DBCC para a tabela 'servico_instituicao'
DBCC CHECKIDENT ('dbo.atendimento', RESEED, 0);
DBCC CHECKIDENT ('dbo.beneficiario', RESEED, 0);
DBCC CHECKIDENT ('dbo.instituicao', RESEED, 0);
DBCC CHECKIDENT ('dbo.usuario', RESEED, 0);
DBCC CHECKIDENT ('dbo.servico', RESEED, 0);
DBCC CHECKIDENT ('dbo.email', RESEED, 0);
DBCC CHECKIDENT ('dbo.telefone', RESEED, 0);
DBCC CHECKIDENT ('dbo.endereco', RESEED, 0);
GO

PRINT 'Contadores de identidade (IDENTITY) resetados.';

-- Ativa as constraints novamente
EXEC sp_msforeachtable "ALTER TABLE ? WITH CHECK CHECK CONSTRAINT all";
GO

PRINT '[ETAPA 1] Limpeza e Reset concluídos com sucesso.';
GO

/********************************************************************
 * ETAPA 2: SCRIPT DE POVOAMENTO (INSERT)
 * Execute este bloco somente após a Etapa 1 ter sucesso.
 ********************************************************************/

USE solidaridata;
GO

PRINT '------------------------------------------------';
PRINT '[ETAPA 2] Iniciando o povoamento do banco de dados...';
PRINT '------------------------------------------------';

-- 1. Inserindo dados nas tabelas de domínio
PRINT 'Povoando tabela: servico';
INSERT INTO servico (descricao_servico) VALUES
('Distribuição de Cestas Básicas'), ('Acolhimento Noturno e Moradia Temporária'),
('Atendimento Psicológico Social'), ('Orientação Jurídica para População de Baixa Renda'),
('Capacitação Profissional e Inclusão no Mercado'), ('Apoio e Cuidado para Idosos');
GO

PRINT 'Povoando tabela: endereco';
INSERT INTO endereco (logradouro, numero, bairro, cidade, uf, cep) VALUES
('Rua da Consolação', '930', 'Consolação', 'São Paulo', 'SP', '01302000'), ('Avenida Paulista', '1578', 'Bela Vista', 'São Paulo', 'SP', '01310200'),
('Rua Augusta', '2690', 'Jardins', 'São Paulo', 'SP', '01412100'), ('Largo do Arouche', '346', 'República', 'São Paulo', 'SP', '01219010'),
('Avenida Ipiranga', '200', 'República', 'São Paulo', 'SP', '01046921'), ('Rua Frei Caneca', '569', 'Consolação', 'São Paulo', 'SP', '01307001'),
('Alameda Santos', '1165', 'Cerqueira César', 'São Paulo', 'SP', '01419002'), ('Rua Maria Antônia', '294', 'Vila Buarque', 'São Paulo', 'SP', '01222010'),
('Praça da Sé', 'S/N', 'Sé', 'São Paulo', 'SP', '01001000'), ('Avenida Brigadeiro Luís Antônio', '2344', 'Jardim Paulista', 'São Paulo', 'SP', '01402000'),
('Rua 25 de Março', '864', 'Centro', 'São Paulo', 'SP', '01021200'), ('Avenida São João', '439', 'Centro', 'São Paulo', 'SP', '01035000');
GO

PRINT 'Povoando tabela: telefone';
INSERT INTO telefone (tel_principal, tel_alternativo) VALUES
('11987654321', '1125253636'), ('11912345678', NULL), ('11999887766', '1130304545'), ('11966554433', NULL),
('11954321098', '1140506070'), ('11988877765', NULL), ('11911223344', NULL), ('11944332211', '1155667788'),
('11912121212', NULL), ('11934343434', '1145454545'), ('11956565656', NULL), ('11978787878', '1123232323');
GO

PRINT 'Povoando tabela: email';
INSERT INTO email (email_principal, email_alternativo) VALUES
('admin.solidaridata@email.com', 'contato.admin@email.com'), ('joao.chamusca@email.com', 'j.chamusca.dev@email.com'),
('matheus.pereira@email.com', 'm.pereira.dev@email.com'), ('francisco.luciano@ifsp.edu.br', 'professor.chico@email.com'),
('contato@acolher.org', 'diretoria@acolher.org'), ('ajuda@maosunidas.org.br', NULL),
('caminhos@caminhosluz.com', 'financeiro@caminhosluz.com'), ('novofuturo@institutonf.org', NULL),
('jose.silva@email.com', 'jsilva.pessoal@email.com'), ('ana.costa@email.com', NULL),
('carlos.souza@email.com', 'carloss.pessoal@email.com'), ('beatriz.santos@email.com', NULL);
GO

-- 2. Inserindo Usuários do Sistema
PRINT 'Povoando tabela: usuario';
INSERT INTO usuario (nome_usuario, cpf_usuario, senha_hash, tipo_usuario, data_nascimento, id_endereco, id_telefone, id_email) VALUES
('Administrador', '11111111111', 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', 1, '1990-01-10', 1, 1, 1),
('Joao Antônio Chamusca Martins', '22222222222', 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', 2, '2000-05-20', 2, 2, 2),
('Matheus Pereira Pereira', '33333333333', 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', 2, '2001-07-22', 3, 3, 3),
('Francisco Verissimo Luciano', '44444444444', 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', 2, '1985-10-01', 4, 4, 4);
GO

-- 3. Inserindo Instituições
PRINT 'Povoando tabela: instituicao';
INSERT INTO instituicao (nome_instituicao, razao_social, cnpj, id_usuario_responsavel, id_endereco, id_telefone, id_email) VALUES
('ONG Acolher Bem', 'Associação Acolher para o Bem Comum', '11222333000144', 2, 5, 5, 5),
('Instituto Mãos Unidas', 'Instituto de Caridade Mãos Unidas de SP', '44555666000155', 3, 6, 6, 6),
('Caminhos de Luz', 'Centro Espírita Beneficente Caminhos de Luz', '77888999000166', 4, 7, 7, 7),
('Instituto Novo Futuro', 'Instituto de Capacitação Profissional Novo Futuro', '10101010000177', 2, 8, 8, 8);
GO

-- 4. Inserindo Beneficiários
PRINT 'Povoando tabela: beneficiario';
INSERT INTO beneficiario (nome, cpf, data_nascimento, grau_parentesco, id_beneficiario_responsavel, id_endereco, id_telefone, id_email) VALUES
('José da Silva', '12345678901', '1980-04-15', NULL, NULL, 9, 9, 9),
('Ana Costa', '23456789012', '1992-08-01', NULL, NULL, 10, 10, 10),
('Carlos Souza', '34567890123', '1965-02-28', NULL, NULL, 11, 11, 11),
('Beatriz Santos Souza', '45678901234', '2015-01-30', 'Filha', 3, 11, 11, 11);
GO

-- 5. Povoando Tabelas Associativas
PRINT 'Povoando tabela: servico_instituicao';
INSERT INTO servico_instituicao (id_instituicao, id_servico) VALUES
(1, 1), (1, 2), -- ONG Acolher Bem
(2, 1), (2, 3), (2, 6), -- Instituto Mãos Unidas
(3, 4), (3, 6), -- Caminhos de Luz
(4, 5); -- Instituto Novo Futuro
GO

-- 6. Povoando Tabela Transacional
PRINT 'Povoando tabela: atendimento';
INSERT INTO atendimento (data_atendimento, nivel_urgencia, id_instituicao, id_beneficiario) VALUES
(GETDATE()-10, 'Alta', 1, 1),
(GETDATE()-5, 'Média', 2, 2),
(GETDATE()-2, 'Baixa', 4, 2),
(GETDATE(), 'Alta', 3, 3);
GO

PRINT '------------------------------------------------';
PRINT '[ETAPA 2] Povoamento do banco de dados concluído com sucesso!';
PRINT '------------------------------------------------';
GO


SELECT * FROM beneficiario