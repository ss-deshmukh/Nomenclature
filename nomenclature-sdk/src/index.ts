import { ApiPromise, WsProvider } from '@polkadot/api';
import { ContractPromise } from '@polkadot/api-contract';
import { Keyring } from '@polkadot/keyring';

// Contract ABI - this will be updated with actual deployed contract metadata
const CONTRACT_ABI = {
  "source": {
    "hash": "0x...",
    "language": "ink! 5.1.1",
    "compiler": "rustc 1.75.0-nightly",
    "build_info": {
      "build_mode": "Release",
      "cargo_contract_version": "4.1.1",
      "rust_toolchain": "nightly-x86_64-unknown-linux-gnu",
      "wasm_opt_settings": {
        "keep_debug_symbols": false,
        "optimization_passes": "Z"
      }
    }
  },
  "contract": {
    "name": "nomenclature_wns",
    "version": "0.1.0"
  },
  "types": [
    // Types will be populated from actual contract
  ],
  "spec": {
    "constructors": [
      {
        "args": [],
        "default": false,
        "docs": [],
        "label": "new",
        "payable": false,
        "returnType": {
          "displayName": [
            "ink_primitives",
            "ConstructorResult"
          ],
          "type": 0
        },
        "selector": "0x9bae9d5e"
      }
    ],
    "docs": [],
    "environment": {
      "accountId": {
        "displayName": [
          "AccountId"
        ],
        "type": 1
      },
      "balance": {
        "displayName": [
          "Balance"
        ],
        "type": 2
      },
      "blockNumber": {
        "displayName": [
          "BlockNumber"
        ],
        "type": 3
      },
      "chainExtension": {
        "displayName": [
          "ChainExtension"
        ],
        "type": 4
      },
      "hash": {
        "displayName": [
          "Hash"
        ],
        "type": 5
      },
      "maxEventTopics": 4,
      "timestamp": {
        "displayName": [
          "Timestamp"
        ],
        "type": 6
      }
    },
    "events": [
      {
        "args": [
          {
            "docs": [],
            "indexed": true,
            "label": "name",
            "type": {
              "displayName": [
                "String"
              ],
              "type": 7
            }
          },
          {
            "docs": [],
            "indexed": true,
            "label": "owner",
            "type": {
              "displayName": [
                "AccountId"
              ],
              "type": 1
            }
          }
        ],
        "docs": [],
        "label": "NameRegistered"
      }
    ],
    "lang_error": {
      "displayName": [
        "ink",
        "LangError"
      ],
      "type": 8
    },
    "messages": [
      {
        "args": [
          {
            "label": "name",
            "type": {
              "displayName": [
                "String"
              ],
              "type": 7
            }
          },
          {
            "label": "address",
            "type": {
              "displayName": [
                "String"
              ],
              "type": 7
            }
          }
        ],
        "default": false,
        "docs": [],
        "label": "register_name",
        "mutates": true,
        "payable": false,
        "returnType": {
          "displayName": [
            "ink",
            "MessageResult"
          ],
          "type": 9
        },
        "selector": "0xa87b7bb2"
      },
      {
        "args": [
          {
            "label": "name",
            "type": {
              "displayName": [
                "String"
              ],
              "type": 7
            }
          }
        ],
        "default": false,
        "docs": [],
        "label": "resolve_name",
        "mutates": false,
        "payable": false,
        "returnType": {
          "displayName": [
            "ink",
            "MessageResult"
          ],
          "type": 10
        },
        "selector": "0xb8f3e8f5"
      },
      {
        "args": [
          {
            "label": "name",
            "type": {
              "displayName": [
                "String"
              ],
              "type": 7
            }
          }
        ],
        "default": false,
        "docs": [],
        "label": "is_name_available",
        "mutates": false,
        "payable": false,
        "returnType": {
          "displayName": [
            "ink",
            "MessageResult"
          ],
          "type": 11
        },
        "selector": "0x123456789"
      }
    ]
  }
};

export interface NomenclatureConfig {
  rpcEndpoint?: string;
  contractAddress?: string;
}

export interface NameResolution {
  name: string;
  address: string;
  owner?: string;
}

export class NomenclatureSDK {
  private api: ApiPromise | null = null;
  private contract: ContractPromise | null = null;
  private config: Required<NomenclatureConfig>;

  // Default configuration - Using Westend (Official Polkadot testnet)
  private static readonly DEFAULTS = {
    rpcEndpoint: 'wss://westend-rpc.polkadot.io',
    contractAddress: 'YOUR_DEPLOYED_CONTRACT_ADDRESS' // Will be updated after deployment
  };

  constructor(config: NomenclatureConfig = {}) {
    this.config = {
      ...NomenclatureSDK.DEFAULTS,
      ...config
    };
  }

  /**
   * Initialize the SDK connection
   */
  async initialize(): Promise<void> {
    try {
      const provider = new WsProvider(this.config.rpcEndpoint);
      this.api = await ApiPromise.create({ provider });
      
      this.contract = new ContractPromise(
        this.api,
        CONTRACT_ABI,
        this.config.contractAddress
      );
    } catch (error) {
      throw new Error(`Failed to initialize Nomenclature SDK: ${error}`);
    }
  }

  /**
   * Register a new .web3 name
   */
  async registerName(
    name: string,
    address: string,
    signer: any
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    if (!this.contract || !this.api) {
      throw new Error('SDK not initialized. Call initialize() first.');
    }

    try {
      const gasLimit = this.api.registry.createType('WeightV2', {
        refTime: 3000000000,
        proofSize: 131072,
      });

      const { result } = await this.contract.tx.registerName(
        { gasLimit, storageDepositLimit: null },
        name,
        address
      ).signAndSend(signer.address, { signer: signer.signer });

      return { success: true, txHash: result.toString() };
    } catch (error) {
      return { success: false, error: error.toString() };
    }
  }

  /**
   * Resolve a .web3 name to an address
   */
  async resolveName(name: string): Promise<string | null> {
    if (!this.contract || !this.api) {
      throw new Error('SDK not initialized. Call initialize() first.');
    }

    try {
      // Use a dummy address for read-only queries
      const { result, output } = await this.contract.query.resolveName(
        '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY', // dummy address
        { gasLimit: -1, storageDepositLimit: null },
        name
      );

      if (result.isOk) {
        return output.toHuman() as string;
      }
      return null;
    } catch (error) {
      console.error('Error resolving name:', error);
      return null;
    }
  }

  /**
   * Check if a name is available for registration
   */
  async isNameAvailable(name: string): Promise<boolean> {
    if (!this.contract || !this.api) {
      throw new Error('SDK not initialized. Call initialize() first.');
    }

    try {
      const { result, output } = await this.contract.query.isNameAvailable(
        '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY', // dummy address
        { gasLimit: -1, storageDepositLimit: null },
        name
      );

      if (result.isOk) {
        return output.toHuman() as boolean;
      }
      return false;
    } catch (error) {
      console.error('Error checking name availability:', error);
      return false;
    }
  }

  /**
   * Update address for an existing name (owner only)
   */
  async updateAddress(
    name: string,
    newAddress: string,
    signer: any
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    if (!this.contract || !this.api) {
      throw new Error('SDK not initialized. Call initialize() first.');
    }

    try {
      const gasLimit = this.api.registry.createType('WeightV2', {
        refTime: 3000000000,
        proofSize: 131072,
      });

      const { result } = await this.contract.tx.updateAddress(
        { gasLimit, storageDepositLimit: null },
        name,
        newAddress
      ).signAndSend(signer.address, { signer: signer.signer });

      return { success: true, txHash: result.toString() };
    } catch (error) {
      return { success: false, error: error.toString() };
    }
  }

  /**
   * Batch resolve multiple names
   */
  async resolveNames(names: string[]): Promise<NameResolution[]> {
    const results: NameResolution[] = [];
    
    for (const name of names) {
      const address = await this.resolveName(name);
      if (address) {
        results.push({ name, address });
      }
    }
    
    return results;
  }

  /**
   * Disconnect from the network
   */
  async disconnect(): Promise<void> {
    if (this.api) {
      await this.api.disconnect();
      this.api = null;
      this.contract = null;
    }
  }

  /**
   * Get the current API instance (for advanced usage)
   */
  getApi(): ApiPromise | null {
    return this.api;
  }

  /**
   * Get the contract instance (for advanced usage)
   */
  getContract(): ContractPromise | null {
    return this.contract;
  }
}

// Export utility functions
export const nomenclatureUtils = {
  /**
   * Validate a .web3 name format
   */
  validateName(name: string): boolean {
    const namePattern = /^[a-zA-Z0-9-_]{1,50}$/;
    return namePattern.test(name.replace('.web3', ''));
  },

  /**
   * Normalize a name (add .web3 if missing)
   */
  normalizeName(name: string): string {
    return name.endsWith('.web3') ? name : `${name}.web3`;
  },

  /**
   * Check if an address appears to be a valid blockchain address
   */
  validateAddress(address: string): boolean {
    // Basic validation for common blockchain address formats
    const patterns = [
      /^5[a-km-zA-HJ-NP-Z1-9]{47}$/, // Substrate/Polkadot
      /^0x[a-fA-F0-9]{40}$/,         // Ethereum
      /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/, // Bitcoin
      /^[1-9A-HJ-NP-Za-km-z]{32,44}$/, // Solana
    ];

    return patterns.some(pattern => pattern.test(address));
  }
};

// Default export
export default NomenclatureSDK;