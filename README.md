# Vox Messenger

Um super-app de mensagens *privacy-first*, projetado para combinar comunicação ultrassegura com um ecossistema modular de mini-apps. O Vox Messenger garante a autenticidade dos usuários através de verificação de identidade oficial (GOV.br) sem comprometer a privacidade diária, unindo o melhor da criptografia de ponta a ponta com flexibilidade de plataforma.

## 🎯 Nossa Visão e Objetivos
O mercado atual de mensageiros frequentemente força o usuário a escolher entre **privacidade total** e **rica funcionalidade**. O Vox Messenger resolve isso através de um modelo arquitetural focado no usuário:
- **Comunicação Blindada:** Criptografia de ponta a ponta nativa usando o padrão ouro da indústria (Signal Protocol). O servidor atua apenas como um relé cego de dados (ciphertext), sem qualquer conhecimento do conteúdo das mensagens.
- **Identidade Real, Perfil Privado:** Integração com OAuth2 do GOV.br para erradicar bots, golpes e perfis falsos. O identificador governamental é criptografado localmente e bloqueado via cofre jurídico (*Legal Hold*). No dia a dia, o usuário navega apenas com seu *username* escolhido, mantendo seu número e documentos privados.
- **Ecossistema Modular (Super-App):** Inspirado nos super-apps globais, mas com controle nas mãos do usuário. Integrações de terceiros (Delivery, Jogos, Produtividade) podem ser baixadas e removidas dinamicamente do app. O usuário escolhe o que quer no seu celular, otimizando espaço e mantendo a interface limpa.
- **Customização e Sustentabilidade:** O app não vende os dados dos usuários. A monetização baseia-se em recursos de personalização profunda, como a loja de Temas e Pacotes de Stickers.

## 🛠 Tecnologias e Arquitetura
Construído com as ferramentas mais modernas e robustas para garantir escalabilidade e performance:
- **Frontend Mobile:** React Native, Expo SDK 55, Expo Router, TypeScript (Strict Mode).
- **Gerenciamento de Estado:** Zustand (leve, rápido e escalável).
- **Data Abstraction Layer (DAL):** Padrão de arquitetura que isola a lógica de negócios do banco de dados, permitindo migração de provedores (vendor lock-in free) sem refatorar o código da interface.
- **Backend (MVP):** Supabase (PostgreSQL, Realtime WebSockets, Auth).
- **Segurança Criptográfica:** `@noble/curves` e `@noble/hashes` para geração e manipulação de chaves localmente no dispositivo.

## 🚀 O Que Já Temos Pronto (Fase 1: Fundação)
A base arquitetural de nível empresarial do Vox Messenger já está estabelecida e em funcionamento:
- [x] **Setup do Projeto:** Estrutura monorepo com TypeScript, verificação rigorosa (0 vulnerabilidades reportadas no npm) e roteamento *file-based* 100% tipado.
- [x] **Data Abstraction Layer (DAL):** Interface de comunicação com o banco de dados concluída (`IDataAdapter`). Implementação completa via `SupabaseAdapter` abrangendo Auth, Gestão de Usuários, Conversas, Mensagens, PreKeys (Signal) e Storage.
- [x] **Design System (UI):** Tokens de interface implementados (paleta baseada em HSL com prioridade ao *Dark Mode*, sistema de espaçamento e tipografia).
- [x] **Navegação Base (App Shell):** Estrutura de roteamento principal com Tab Navigator (Conversas, Loja, Configurações) protegido por um *Auth Guard* global que restaura a sessão silenciosamente.
- [x] **Isolamento de Banco de Dados:** Schema PostgreSQL exclusivo (desacoplado do schema `public`) criado via script de migração. Inclui segurança via *Row Level Security* (RLS) minucioso para impedir acesso não autorizado a dados.
- [x] **Preparo para LGPD e IA:** Estruturas de banco desenhadas para versionamento de consentimento da Lei Geral de Proteção de Dados e toggle nativo para *Content Filter* on-device.

## 🛣 Planos Futuros (Roadmap)
- **Fase 2:** Autenticação. Integração do fluxo OAuth2 com GOV.br, criação e recuperação segura de sessão no SecureStorage do dispositivo.
- **Fase 3:** Criptografia. Implementação do *Double Ratchet* (Signal Protocol) para estabelecimento de sessões E2EE.
- **Fase 4:** Tempo Real. Motor de chat bidirecional via Supabase Realtime, confirmação de leitura e status "digitando".
- **Fase 5:** Loja e Customização. Lançamento da infraestrutura de Temas e Stickers.
- **Fase 6:** Super-App. Abertura do Motor de Módulos para o download dinâmico de integrações de terceiros.

---
*Construído com precisão, segurança e visão de longo prazo.*
