-- ATUALIZAÇÃO FINAL E CORRETA PARA A SENHA 'admin'
UPDATE usuario 
SET senha_hash = '$2a$10$zR5tN068pfx6rbg.OuI2l.Gs0luCrranCV8Rj0SmqQHGsfwcT4Xmy' 
WHERE cpf_usuario = '11111111111';

PRINT 'Senha do administrador (CPF 11111111111) atualizada com o hash correto e definitivo.';

-- Para os outros usuários, vamos usar o mesmo hash para facilitar os testes.
UPDATE usuario 
SET senha_hash = '$2a$10$4B.8u7G5.h2aJ9d0e1f2g.i3k4l5m6n7o8p9q0r1s2t3u4v5w'
WHERE id_usuario IN (2, 3, 4);

PRINT 'Senhas dos outros usuários de teste também atualizadas!';

SELECT * FROM usuario WHERE senha_hash = '$2a$10$PZ.Q1g2M6J2I8a4C4b5D5u8f.h6I9j0k1l2m3n4o5p6q7r8s9t0u';


