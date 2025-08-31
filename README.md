<p align="center">
  <img src="https://github.com/Soymaferlopezp/wave/blob/main/public/wave_blue_trans.png" alt="WAVE Logo" height="170">
</p>

<h1 align="center">W.A.V.E — Web3 Accessible Virtual Education</h1>

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/medicenmafer221-5173s-projects/v0-wave)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/H5XGYDfiLuB)

---
## 📖 Overview

W.A.V.E is an inclusive EdTech platform that allows people to learn about Web3 with a 100% accessible approach for those with dyslexia, autism, ADHD, and visual impairments.
Our MVP demonstrates how accessibility can be part of the initial onboarding to the world of the Web3 ecosystem, even before connecting a real wallet.

## 📜 Demo Flow — W.A.V.E
1. **Landing Page**
   - The web app loads.
   - The Accessibility Modal pops up automatically.
   - The user can choose between:
       • Dyslexia
       • Autism
       • ADHD
       • Visual Impairment
   - Or skip and use the default configuration.

2. **Hero + Accessible Navigation**
   - The simplified Header is displayed.
   - CTA buttons:
       • "Start Without Wallet"
       • "Accessibility Preference"
   - Navigation validated: works with keyboard (Tab) 
     and visible focus.

3. **Wallet Simulator**
   - Clicking the CTA opens the Wallet Simulator.
   - The user can:
       • Copy their seed phrase.
       • Explore basic Web3 actions without risk:
         Receive | Send | History
       • Follow tooltips explaining each step.
       • Download MetaMask from its official website.
       • Redirect to the Educational Dashboard.

4. **Dashboard**
   - Home: Overview of user’s progress.
   - Learning Modules: Basic, simplified, interactive
     lessons adapted to each accessibility profile.
   - Game to Learn: Educational mini-game about the 
     BASE ecosystem.
   - Achievements: Off-chain badges earned by practicing
     in the simulator and completing lessons.

5. **Floating Accessibility Button**
   - Available at all times.
   - Allows reconfiguration of the experience → 
     switch accessibility profile live.

6. **Closing Flow**
   - Dashboard shows accumulated XP.
   - Motivational message appears:

     "You practiced safely. 
      Next step: connect your real wallet and earn 
      your certificate on blockchain."

## 🚀 Problem we solve
Millions of people with cognitive or visual disabilities encounter barriers when trying to learn Web3.
The lack of accessible interfaces excludes users from the very first step, limiting their participation in new technologies.

⚠️ Important:
We have not yet implemented the connection to the real wallet or the NFT system. These are defined in the roadmap for the next phase.

## 🛠️ Tech Stack
* Next.js 14 (frontend)
* TailwindCSS + shadcn/ui (UI accesible)
* LocalStorage (persistencia de preferencias de accesibilidad)

## 📂 Repo Structure

```bash
/public        # Assets (logos, imágenes)
/src
  /components  # UI accesible (modals, botones, headers)
/pages         # Landing, Simulador, Dashboard
/styles        # Tailwind + overrides por perfil de accesibilidad
```
## 🛤️ ROADMAP — W.A.V.E
[✔] 1. Accessibility Modal (initial setup)
     - User chooses profile (Dyslexia, Autism, ADHD, 
       Visual Impairment).

[✔] 2. Wallet Simulator with educational flow
     - Safe practice: Receive | Send | History.

[✔] 3. Basic Gamification
     - XP system and progress feedback.

[ ] 4. Integration with real wallets
     - MetaMask / Rainbow connection.

[ ] 5. Certificates & Badges as Dynamic NFTs
     - On-chain proof of learning.

[ ] 6. Full Learning Dashboard
     - Interactive modules, progression tracking.

## 🌊 W.A.V.E — MVP Demo Flow

```bash
 ┌───────────────────────────────┐
   │ [1] Landing Page              │
   │ - Accessibility Modal         │
   │ - Choose Profile or Skip      │
   └───────────────┬───────────────┘
                   │
                   ▼
   ┌───────────────────────────────┐
   │ [2] Hero + Navigation         │
   │ - Simplified Header           │
   │ - CTA: Start Without Wallet   │
   │       or Accessibility Pref.  │
   └───────────────┬───────────────┘
                   │
                   ▼
   ┌───────────────────────────────┐
   │ [3] Wallet Simulator          │
   │ - Copy Seed Phrase            │
   │ - Receive | Send | History    │
   │ - Tooltips step by step       │
   │ - Download MetaMask link      │
   │ - Redirect to Dashboard       │
   └───────────────┬───────────────┘
                   │
                   ▼
   ┌───────────────────────────────┐
   │ [4] Dashboard                 │
   │ - Home (Progress Overview)    │
   │ - Learning Modules            │
   │ - Game to Learn (BASE)        │
   │ - Achievements (badges)       │
   └───────────────┬───────────────┘
                   │
                   ▼
   ┌───────────────────────────────┐
   │ [6] Closing Flow              │
   │ - Show XP                     │
   │ - Message:                    │
   │   "Next step: connect real    │
   │    wallet & earn certificate" │
   └───────────────────────────────┘


   ┌───────────────────────────────┐
   │ [5] Floating Accessibility    │
   │ Button                        │
   │ - Available anytime           │
   │ - Reconfigure profile live    │
   └───────────────▲───────────────┘
                   │ (can be triggered
                   │  from any step)
```

---
🌐 Demo

[wave-blockbears](https://wave-blockbears.vercel.app)
---
💼 Business Model

Web3 Accessibility & Virtual Education
 A scalable B2B & infrastructure-first model 
 for an inclusive decentralized future.

 "We start as a product. We grow into infrastructure."
 W.A.V.E evolves from an EdTech platform into the
 onboarding layer for inclusive Web3.

----------------------------------------------------
 📊 2 Revenue Layers
----------------------------------------------------
 1) B2B SaaS Licensing
 2) Accessibility SDK/API for Web3 platforms

----------------------------------------------------
 📌 Phase 1: EdTech Inclusive SaaS
----------------------------------------------------
 For:
   - NGOs
   - Educational Institutions
   - DAOs
   - Governments

 How it works:
   - License W.A.V.E to onboard and educate users 
     with disabilities
   - Branded dashboards
   - Accessibility presets
   - Certification modules

 Revenue:
   - Annual plans based on users
   - Course customizations
   - On-chain certificates (SBTs)

----------------------------------------------------
 📌 Phase 2: "W.A.V.E Inside" SDK/API
----------------------------------------------------
 For:
   - DApps
   - Wallets
   - Web3 platforms

 Revenue:
   - TBC (to be confirmed)

---
## 👥 Team

    👩‍💻 Mafer Lopez — Dev & UX/UI Designer
    🚀 Mary Lopez — Reasercher | BizDev
    💜 Zula — PM | Marketing

---
## 📜 License

MIT — use with attribution.
Visual assets licensed by the ZetaQuest team.
