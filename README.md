# API - Pizzaria do seu ZÉ - TCC

## Tecnologias
- VsCode
- Node.js
- Prisma
- Vercel
- JavaScript
- SGBD local XAMPP (MySQL)
- SGBD vercel NEON (POSTGRE)

## Passo a passo para executar localmente
- 1 clonar o repositório, abrir com VsCode e abrir um terminal `cmd` ou `bash` para instalar as dependências
```bash
npm install
```
- 2 Abrir o XAMPP e dar start no MySQL, criar o arquivo `.env` contendo os dados a seguir e altera o arquivo `prisma/schema.prisma` de SGBD `postgresql` para `mysql`.
    - arquivo `.env`
```env
DATABASE_URL="mysql://root@localhost:3306/pizzaria?schema=public&timezone=UTC"
JWT_SECRET="meu-segredo"
```
    - arquivo `prisma/schema.prisma`
```js
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```
- 3 Migrar o banco de dados e executar a api
```bash
npx prisma migrate dev --name init
npm run dev
```

## Para manutenções na API na vercel
- 1 Cada novo commit será um novo deploy
- 2 Caso altere a estrutura do banco de dados no arquivo `schema.prisma` seguir os passos abaixo.
    - 1 Não esquecer de voltar o SGBD para `postgresql`
    - 2 Excluir todas as tabelas no NEON (drop)
    - 3 No arquivo `package.json` executar os comandos a seguir via script `postinstall`
```
prisma migrate reset --force && prisma generate
prisma migrate migrate dev --name init && prisma generate
prisma db seed && prisma generate
prisma generate
```
- Cada comando deve ser dado em um commit diferente
