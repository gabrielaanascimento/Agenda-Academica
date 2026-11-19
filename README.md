# Agenda Acadêmica - Front-end (Next.js)

Interface web responsiva desenvolvida com **Next.js (App Router)** e **Tailwind CSS** para organização colaborativa de provas, trabalhos e entregas por matéria.

## Instalação e Execução

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Crie o arquivo `.env.local` baseado no `.env.example`:
   ```bash
   cp .env.example .env.local
   ```
   *(Por padrão, já aponta para `https://agendafaculdadeapi.vercel.app/api`. Caso rode a API localmente, altere para `http://localhost:3333/api`).*

3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

4. Acesse `http://localhost:3000` no navegador.
