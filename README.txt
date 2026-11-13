SNIPEDLY — Website Frontend
===========================

Project files
- index.html: responsive SNIPEDLY website structure
- styles.css: visual theme, responsive layouts and motion effects
- script.js: navigation, discovery category switching, community post interactions,
  story navigation and contribution checkout hand-off UI
- assets/snipedly-logo.jpeg: supplied SNIPEDLY logo

Run locally
1. Keep the folder structure unchanged.
2. Open index.html in a browser, or run it with VS Code Live Server.

Deploy
- Upload the project folder to Netlify or connect its Git repository.
- A static hosting provider can publish this frontend.

Integration requirements before production features are enabled
- Coin listings and market figures currently use illustrative frontend content.
  Connect a trusted market-data API before presenting them as live prices or metrics.
- Card and Apple Pay options are checkout interface selections only. Connect a
  supported hosted payment provider and verify the merchant account before accepting
  payments. Never collect or store raw card details in this static frontend.
- Community posts and likes currently update the page only. Add authentication,
  an API and a database for persistent user accounts and shared posts.
- Wallet connection, Solana transactions, live charts, trading, portfolio data,
  AI services and admin tools require secure backend/API integrations.
- Never request wallet seed phrases or private keys.

The site does not fabricate successful payments or confirmed blockchain activity.
