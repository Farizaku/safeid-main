-- =================================================================
-- SCRIPT PARA CRIAR UM NOVO LOGIN E USUÁRIO PARA A APLICAÇÃO
-- =================================================================

-- Cria um novo LOGIN no nível do SERVIDOR. É com este login que a aplicação irá se conectar.
-- IMPORTANTE: Troque 'SenhaForte!2025' por uma senha de sua preferência.
CREATE LOGIN solidaridata_user WITH PASSWORD = 'SenhaForte!2025';
GO

-- Conecta ao seu banco de dados específico.
USE solidaridata;
GO

-- Cria um USUÁRIO dentro do banco de dados 'solidaridata' e o vincula ao LOGIN que criamos acima.
CREATE USER solidaridata_app_user FOR LOGIN solidaridata_user;
GO

-- Dá ao novo usuário permissões totais DENTRO do banco 'solidaridata'.
-- Para desenvolvimento, 'db_owner' é mais simples.
ALTER ROLE db_owner ADD MEMBER solidaridata_app_user;
GO

PRINT 'Login "solidaridata_user" e usuário "solidaridata_app_user" criados com sucesso!';