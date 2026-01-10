# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]: "[plugin:vite:import-analysis] Failed to resolve import \"../hooks/useAdmin\" from \"src/components/admin/UserManagement.tsx\". Does the file exist?"
  - generic [ref=e5]: /home/web3joker/Documents/SAMAD V2/BitArt Market/frontend/src/components/admin/UserManagement.tsx:2:62
  - generic [ref=e6]: "17 | var _s = $RefreshSig$(); 18 | import { useState } from \"react\"; 19 | import { useAdminUsers, useAdminActions } from \"../hooks/useAdmin\"; | ^ 20 | export const UserManagement = ({ onUserAction }) => { 21 | _s();"
  - generic [ref=e7]: at TransformPluginContext._formatLog (file:///home/web3joker/Documents/SAMAD%20V2/BitArt%20Market/node_modules/vite/dist/node/chunks/config.js:28999:43) at TransformPluginContext.error (file:///home/web3joker/Documents/SAMAD%20V2/BitArt%20Market/node_modules/vite/dist/node/chunks/config.js:28996:14) at normalizeUrl (file:///home/web3joker/Documents/SAMAD%20V2/BitArt%20Market/node_modules/vite/dist/node/chunks/config.js:27119:18) at process.processTicksAndRejections (node:internal/process/task_queues:95:5) at async file:///home/web3joker/Documents/SAMAD%20V2/BitArt%20Market/node_modules/vite/dist/node/chunks/config.js:27177:32 at async Promise.all (index 4) at async TransformPluginContext.transform (file:///home/web3joker/Documents/SAMAD%20V2/BitArt%20Market/node_modules/vite/dist/node/chunks/config.js:27145:4) at async EnvironmentPluginContainer.transform (file:///home/web3joker/Documents/SAMAD%20V2/BitArt%20Market/node_modules/vite/dist/node/chunks/config.js:28797:14) at async loadAndTransform (file:///home/web3joker/Documents/SAMAD%20V2/BitArt%20Market/node_modules/vite/dist/node/chunks/config.js:22670:26) at async viteTransformMiddleware (file:///home/web3joker/Documents/SAMAD%20V2/BitArt%20Market/node_modules/vite/dist/node/chunks/config.js:24542:20)
  - generic [ref=e8]:
    - text: Click outside, press Esc key, or fix the code to dismiss.
    - text: You can also disable this overlay by setting
    - code [ref=e9]: server.hmr.overlay
    - text: to
    - code [ref=e10]: "false"
    - text: in
    - code [ref=e11]: vite.config.ts
    - text: .
```