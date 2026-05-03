-- SCRIPT PARA CRIAÇÃO DO BANCO DE DADOS SOLIDARIDATA NO SQL SERVER --
GO
CREATE DATABASE solidaridata;

GO
USE solidaridata;
--
-- TABELAS DE DOMÍNIO (sem dependências externas)
--

CREATE TABLE servico (
    id_servico INT IDENTITY(1,1) PRIMARY KEY,
    descricao_servico VARCHAR(200) NOT NULL
);

CREATE TABLE endereco (
    id_endereco INT IDENTITY(1,1) PRIMARY KEY,
    logradouro VARCHAR(255) NOT NULL,
    numero VARCHAR(20),
    bairro VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    uf CHAR(2) NOT NULL,
    cep CHAR(8)
);

CREATE TABLE telefone (
    id_telefone INT IDENTITY(1,1) PRIMARY KEY,
    tel_principal VARCHAR(20) NOT NULL,
    tel_alternativo VARCHAR(20)
);

CREATE TABLE email (
    id_email INT IDENTITY(1,1) PRIMARY KEY,
    email_principal VARCHAR(255) NOT NULL UNIQUE,
    email_alternativo VARCHAR(255)
);

--
-- TABELAS PRINCIPAIS (com dependências)
--

CREATE TABLE usuario (
    id_usuario INT IDENTITY(1,1) PRIMARY KEY,
    nome_usuario VARCHAR(150) NOT NULL,
    cpf_usuario CHAR(11) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL, -- Para armazenar a senha codificada
    tipo_usuario INT NOT NULL DEFAULT 2, -- Ex: 1=Admin, 2=Operador
    data_nascimento DATE,
    id_endereco INT,
    id_telefone INT,
    id_email INT,
    CONSTRAINT FK_usuario_endereco FOREIGN KEY (id_endereco) REFERENCES endereco(id_endereco),
    CONSTRAINT FK_usuario_telefone FOREIGN KEY (id_telefone) REFERENCES telefone(id_telefone),
    CONSTRAINT FK_usuario_email FOREIGN KEY (id_email) REFERENCES email(id_email)
);

CREATE TABLE instituicao (
    id_instituicao INT IDENTITY(1,1) PRIMARY KEY,
    nome_instituicao VARCHAR(200) NOT NULL,
    razao_social VARCHAR(200),
    cnpj CHAR(14) NOT NULL UNIQUE,
    id_usuario_responsavel INT NOT NULL, -- Usuário que representa a instituição
    id_endereco INT,
    id_telefone INT,
    id_email INT,
    CONSTRAINT FK_instituicao_usuario FOREIGN KEY (id_usuario_responsavel) REFERENCES usuario(id_usuario),
    CONSTRAINT FK_instituicao_endereco FOREIGN KEY (id_endereco) REFERENCES endereco(id_endereco),
    CONSTRAINT FK_instituicao_telefone FOREIGN KEY (id_telefone) REFERENCES telefone(id_telefone),
    CONSTRAINT FK_instituicao_email FOREIGN KEY (id_email) REFERENCES email(id_email)
);

CREATE TABLE beneficiario (
    id_beneficiario INT IDENTITY(1,1) PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    cpf CHAR(11) UNIQUE,
    data_nascimento DATE,
    grau_parentesco VARCHAR(50),
    id_beneficiario_responsavel INT NULL, -- Chave que aponta para esta mesma tabela
    id_endereco INT,
    id_telefone INT,
    id_email INT,
    CONSTRAINT FK_beneficiario_responsavel FOREIGN KEY (id_beneficiario_responsavel) REFERENCES beneficiario(id_beneficiario),
    CONSTRAINT FK_beneficiario_endereco FOREIGN KEY (id_endereco) REFERENCES endereco(id_endereco),
    CONSTRAINT FK_beneficiario_telefone FOREIGN KEY (id_telefone) REFERENCES telefone(id_telefone),
    CONSTRAINT FK_beneficiario_email FOREIGN KEY (id_email) REFERENCES email(id_email)
);

CREATE TABLE atendimento (
    id_atendimento INT IDENTITY(1,1) PRIMARY KEY,
    data_atendimento DATETIME NOT NULL DEFAULT GETDATE(), -- Pega a data e hora atuais por padrão
    nivel_urgencia VARCHAR(50),
    id_instituicao INT NOT NULL,
    id_beneficiario INT NOT NULL,
    CONSTRAINT FK_atendimento_instituicao FOREIGN KEY (id_instituicao) REFERENCES instituicao(id_instituicao),
    CONSTRAINT FK_atendimento_beneficiario FOREIGN KEY (id_beneficiario) REFERENCES beneficiario(id_beneficiario)
);

--
-- TABELAS ASSOCIATIVAS (para relacionamentos N:M)
--

CREATE TABLE servico_instituicao (
    id_instituicao INT NOT NULL,
    id_servico INT NOT NULL,
    CONSTRAINT PK_servico_instituicao PRIMARY KEY (id_instituicao, id_servico), -- Chave primária composta
    CONSTRAINT FK_si_instituicao FOREIGN KEY (id_instituicao) REFERENCES instituicao(id_instituicao),
    CONSTRAINT FK_si_servico FOREIGN KEY (id_servico) REFERENCES servico(id_servico)
);

GO

-- inclusão de objetos 

-- user defined functions(UDF)

-- função01
CREATE FUNCTION fn_VerificaCpfBeneficiarioExistente (@cpf CHAR(11))
RETURNS BIT
AS
BEGIN
    -- Retorna 1 se o CPF já existir na tabela de beneficiários, e 0 caso contrário.
    DECLARE @existe BIT;

    SELECT @existe = IIF(COUNT(*) > 0, 1, 0)
    FROM beneficiario
    WHERE cpf = @cpf;

    RETURN @existe;
END;
GO

-- Exemplo de uso:
SELECT dbo.fn_VerificaCpfBeneficiarioExistente('12345678901') AS CpfExiste;

-- função02
CREATE FUNCTION fn_FormataCNPJ (@cnpj CHAR(14))
RETURNS VARCHAR(18)
AS
BEGIN
    -- Retorna o CNPJ formatado no padrão XX.XXX.XXX/XXXX-XX
    -- Retorna NULL se a entrada for inválida.
    IF LEN(@cnpj) <> 14 OR ISNUMERIC(@cnpj) = 0
        RETURN NULL;

    RETURN STUFF(STUFF(STUFF(STUFF(@cnpj, 3, 0, '.'), 7, 0, '.'), 11, 0, '/'), 16, 0, '-');
END;
GO

-- Exemplo de uso:
SELECT dbo.fn_FormataCNPJ(cnpj) AS CnpjFormatado FROM instituicao;

-- views

-- view01

CREATE VIEW vw_DetalhesAtendimentos AS
SELECT
    at.id_atendimento,
    at.data_atendimento,
    ben.nome AS nome_beneficiario,
    ben.cpf AS cpf_beneficiario,
    inst.nome_instituicao,
    inst.cnpj AS cnpj_instituicao,
    at.nivel_urgencia
FROM
    atendimento AS at
JOIN
    beneficiario AS ben ON at.id_beneficiario = ben.id_beneficiario
JOIN
    instituicao AS inst ON at.id_instituicao = inst.id_instituicao;
GO

-- Simplesmente consulte a view como se fosse uma tabela
SELECT * FROM vw_DetalhesAtendimentos WHERE nivel_urgencia = 'Alta';

-- view 02
CREATE VIEW vw_InstituicoesEServicos AS
SELECT
    inst.id_instituicao,
    inst.nome_instituicao,
    inst.cnpj,
    serv.id_servico,
    serv.descricao_servico
FROM
    instituicao AS inst
JOIN
    servico_instituicao AS si ON inst.id_instituicao = si.id_instituicao
JOIN
    servico AS serv ON si.id_servico = serv.id_servico;
GO

-- Consultar todos os serviços oferecidos pela instituição com ID 1
SELECT descricao_servico FROM vw_InstituicoesEServicos WHERE id_instituicao = 1;

-- triggers

-- trigger01
CREATE TRIGGER trg_ImpedeCnpjDuplicado_Instituicao
ON instituicao
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1
        FROM instituicao i
        JOIN inserted ins ON i.cnpj = ins.cnpj
        WHERE i.id_instituicao <> ins.id_instituicao
    )
    BEGIN
        -- Desfaz a operação
        ROLLBACK TRANSACTION;
        -- Lança um erro com mensagem personalizada
        THROW 50001, 'Erro: O CNPJ informado já está cadastrado para outra instituição.', 1;
    END;
END;
GO

-- trigger02
CREATE TRIGGER trg_ImpedeServicoDuplicado
ON servico
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1
        FROM servico s
        JOIN inserted ins ON UPPER(s.descricao_servico) = UPPER(ins.descricao_servico)
        WHERE s.id_servico <> ins.id_servico
    )
    BEGIN
        ROLLBACK TRANSACTION;
        THROW 50002, 'Erro: A descrição deste serviço já existe no cadastro.', 1;
    END;
END;
GO

-- stored procedures

-- 01
CREATE PROCEDURE sp_CadastrarBeneficiario
    @nome VARCHAR(150),
    @cpf CHAR(11),
    @data_nascimento DATE = NULL,
    @grau_parentesco VARCHAR(50) = NULL,
    @id_beneficiario_responsavel INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Verifica se o CPF foi fornecido e se já existe
    IF @cpf IS NOT NULL AND dbo.fn_VerificaCpfBeneficiarioExistente(@cpf) = 1
    BEGIN
        THROW 50003, 'Erro: O CPF informado já está cadastrado.', 1;
        RETURN; -- Encerra a execução
    END

    -- Insere o novo beneficiário
    INSERT INTO beneficiario (nome, cpf, data_nascimento, grau_parentesco, id_beneficiario_responsavel)
    VALUES (@nome, @cpf, @data_nascimento, @grau_parentesco, @id_beneficiario_responsavel);

    -- Retorna o ID do beneficiário recém-criado
    SELECT SCOPE_IDENTITY() AS NovoIdBeneficiario;
END;
GO

EXEC sp_CadastrarBeneficiario
    @nome = 'Maria da Silva',
    @cpf = '98765432100',
    @data_nascimento = '1985-05-20';

-- 02
CREATE PROCEDURE sp_RegistrarAtendimento
    @id_instituicao INT,
    @id_beneficiario INT,
    @nivel_urgencia VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRANSACTION; -- Inicia a transação

    BEGIN TRY
        -- 1. Validar se a instituição existe
        IF NOT EXISTS (SELECT 1 FROM instituicao WHERE id_instituicao = @id_instituicao)
        BEGIN
            THROW 50004, 'Erro: Instituição não encontrada.', 1;
        END

        -- 2. Validar se o beneficiário existe
        IF NOT EXISTS (SELECT 1 FROM beneficiario WHERE id_beneficiario = @id_beneficiario)
        BEGIN
            THROW 50005, 'Erro: Beneficiário não encontrado.', 1;
        END

        -- 3. Inserir o atendimento
        INSERT INTO atendimento (id_instituicao, id_beneficiario, nivel_urgencia)
        VALUES (@id_instituicao, @id_beneficiario, @nivel_urgencia);

        -- Se tudo deu certo, confirma a transação
        COMMIT TRANSACTION;
        PRINT 'Atendimento registrado com sucesso!';

    END TRY
    BEGIN CATCH
        -- Se ocorreu algum erro, desfaz a transação
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        -- Relança o erro original para a aplicação poder capturá-lo
        THROW;
    END CATCH;
END;
GO

-- Supondo que o beneficiário de ID 1 e a instituição de ID 1 existem
EXEC sp_RegistrarAtendimento @id_instituicao = 1, @id_beneficiario = 1, @nivel_urgencia = 'Média';

-- Tentativa de registrar com um beneficiário que não existe (ex: ID 999)
-- Isso irá cair no bloco CATCH e executar o ROLLBACK
EXEC sp_RegistrarAtendimento @id_instituicao = 1, @id_beneficiario = 999, @nivel_urgencia = 'Alta';

