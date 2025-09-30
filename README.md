# AI vs Human - Jogo de Detecção de Imagens

Aplicação web interativa onde usuários identificam se imagens são geradas por IA ou humanas.

## 🚀 Requisitos

- Node.js 20.x ou superior
- npm ou yarn

## 📦 Instalação

```bash
npm install
```

## 🎮 Como Executar

### Modo Desenvolvimento (recomendado):
```bash
npm run dev
```
Isso inicia um servidor único (Express + Vite) em `http://localhost:4111`

### Modo Produção:
```bash
npm start
```
Builda o React e serve tudo via Express em `http://localhost:4111`

## 📁 Estrutura do Projeto

```
HackSense/
├── data/
│   ├── images.json        # Metadados das imagens
│   └── rankings.json      # Placar de líderes
├── public/
│   └── images/
│       ├── ai/           # Coloque aqui imagens geradas por IA
│       └── human/        # Coloque aqui imagens humanas
├── src/
│   ├── App.jsx           # Componente principal
│   ├── App.css           # Estilos liquid glass
│   └── main.jsx          # Entry point React
├── server.js             # Backend Express
├── vite.config.js        # Configuração Vite
└── package.json          # Dependências
```

## 🖼️ Adicionando Imagens

1. Adicione imagens geradas por IA em `public/images/ai/`
2. Adicione imagens humanas em `public/images/human/`
3. Atualize `data/images.json` com os metadados:

```json
[
  {
    "id": "1",
    "file": "ai/minha-imagem.jpg",
    "type": "ai"
  },
  {
    "id": "2",
    "file": "human/minha-foto.jpg",
    "type": "human"
  }
]
```

**Importante:** Você precisa de pelo menos 2 imagens de cada tipo (AI e humana) para o jogo funcionar.

## 🎯 Como Jogar

1. Duas imagens aparecem na tela
2. Clique na imagem que você acha que foi gerada por IA
3. Ganhe 10 pontos por resposta certa
4. Veja o feedback animado
5. Compete no ranking com outros jogadores

## 🏆 Funcionalidades

- ✅ Seleção de imagens lado a lado
- ✅ Sistema de pontuação (+10 por acerto)
- ✅ Animações com confetti para acertos
- ✅ Feedback visual (Acertou!/Errou!)
- ✅ Placar de líderes (Top 10)
- ✅ Design liquid glass (glassmorphism)
- ✅ Responsivo para mobile

## 🛠️ Tecnologias

- **Frontend:** React 18.3, Vite 5.4
- **Backend:** Express 4.18, Node.js
- **Estilo:** CSS com glassmorphism
- **Animações:** canvas-confetti
- **Armazenamento:** JSON files

## 📝 API Endpoints

- `GET /api/pair` - Retorna par aleatório de imagens
- `POST /api/check` - Verifica se a resposta está correta
- `GET /api/rankings` - Retorna top 10 do placar
- `POST /api/score` - Salva pontuação no ranking

## 🔧 Scripts Disponíveis

- `npm run dev` - Inicia frontend (Vite)
- `npm run server` - Inicia backend (Express)
- `npm run build` - Build de produção

## 🎨 Tema

Design inspirado no site HackTudo com efeitos de vidro líquido (glassmorphism) e gradiente roxo/azul.
