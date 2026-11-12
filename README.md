# Anatomia do Cavalo — atlas e teste de tradução

Recurso educativo da EPDRA: atlas interativo das regiões do exterior do cavalo (PT/EN) e teste de tradução com registo de resultados numa Google Sheet.

- `index.html` — página dos alunos (atlas + teste). Pede o código da turma, o nome e a turma.
- `admin.html` — página do professor (lista de resultados, filtro por turma, CSV).
- `Code.gs` — servidor de resultados (Google Apps Script). Não contém chaves.
- `images/` — fotografias e logótipos.

## Configurar o Google Apps Script

1. Na Google Sheet dos resultados: **Extensões ▸ Apps Script**, cola o conteúdo de `Code.gs`.
2. **Definições do projeto ▸ Propriedades do script** — adiciona:
   - `WRITE_KEY` — igual a `WRITE_KEY` no `index.html` (só permite acrescentar resultados);
   - `ADMIN_PASSWORD` — palavra-passe do professor para o `admin.html`. **Nunca a escrevas nos ficheiros do site.**
3. **Implementar ▸ Gerir implementações ▸ Editar ▸ Nova versão** (executar como *Eu*, acesso *Qualquer pessoa*).
4. Partilha da Google Sheet: **Restrito**. Os colegas consultam os resultados no `admin.html`
   com a palavra-passe `ADMIN_PASSWORD` (sem precisarem de conta Google).

O URL `/exec` está em `RESULTS_ENDPOINT` no `index.html` e no `admin.html`.

## Mudar o código da turma

O `index.html` guarda só o hash SHA-256 do código (em maiúsculas). Para o mudar:

```bash
printf 'NOVOCODIGO' | sha256sum
```

e cola o resultado em `ACCESS_CODE_SHA256`.

## Publicar no GitHub Pages

Envia o conteúdo desta pasta para o repositório e ativa **Settings ▸ Pages ▸ Deploy from a branch** (`main`, pasta `/`).
O site fica em `https://<utilizador>.github.io/<repositório>/` e a página do professor em `.../admin.html`.

## Segurança

O site é estático, por isso tudo o que está nos ficheiros é público. O código da turma só controla o acesso dentro da sala de aula. A proteção dos resultados depende da palavra-passe `ADMIN_PASSWORD`, que só existe no Apps Script.
