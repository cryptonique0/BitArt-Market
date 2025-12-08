import { Router, Request, Response } from 'express';
import axios from 'axios';

const router = Router();
const CELO_RPC_URL = process.env.CELO_RPC_URL || 'https://alfajores-forno.celo-testnet.org';

// Health check for Celo RPC
router.get('/health', async (_req: Request, res: Response) => {
  try {
    const response = await axios.post(CELO_RPC_URL, {
      jsonrpc: '2.0',
      id: 1,
      method: 'web3_clientVersion',
      params: []
    }, { headers: { 'Content-Type': 'application/json' } });

    res.json({
      success: true,
      rpcUrl: CELO_RPC_URL,
      clientVersion: response.data?.result || 'unknown'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      rpcUrl: CELO_RPC_URL,
      error: error.message || 'Failed to reach Celo RPC'
    });
  }
});

// Get account balance on Celo
router.get('/account/:address', async (req: Request, res: Response) => {
  const { address } = req.params;

  try {
    const balanceResponse = await axios.post(CELO_RPC_URL, {
      jsonrpc: '2.0',
      id: 2,
      method: 'eth_getBalance',
      params: [address, 'latest']
    }, { headers: { 'Content-Type': 'application/json' } });

    const balanceHex = balanceResponse.data?.result;
    if (!balanceHex) {
      return res.status(400).json({ success: false, error: 'Invalid balance response' });
    }

    const wei = BigInt(balanceHex);
    const celo = Number(wei) / 1e18;

    res.json({
      success: true,
      address,
      balance: celo.toFixed(4),
      balanceWei: wei.toString()
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch balance'
    });
  }
});

export default router;
