# Nomenclature SDK

JavaScript/TypeScript SDK for integrating Nomenclature Web3 Naming Service into your dApp.

## Installation

```bash
npm install @nomenclature/sdk
```

## Quick Start

```javascript
import NomenclatureSDK from '@nomenclature/sdk';

// Initialize the SDK
const nomenclature = new NomenclatureSDK({
  rpcEndpoint: 'wss://rpc.shibuya.astar.network', // optional, defaults to Shibuya
  contractAddress: 'YOUR_CONTRACT_ADDRESS' // optional, uses deployed address
});

// Connect to the network
await nomenclature.initialize();

// Resolve a name
const address = await nomenclature.resolveName('alice.web3');
console.log(address); // "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty"
```

## dApp Integration Examples

### Wallet Integration

```javascript
// Show human-readable names in wallet UI
async function displayUserFriendlyAddress(address) {
  const names = await findNamesForAddress(address);
  return names.length > 0 ? names[0] : `${address.slice(0, 8)}...${address.slice(-8)}`;
}
```

### DeFi dApp Integration

```javascript
// Allow users to send tokens using .web3 names
async function sendTokens(recipientName, amount) {
  const recipientAddress = await nomenclature.resolveName(recipientName);
  if (!recipientAddress) {
    throw new Error(`Name ${recipientName} not found`);
  }
  
  // Proceed with token transfer to resolved address
  return transferTokens(recipientAddress, amount);
}
```

### Chat/Social dApp

```javascript
// Display user profiles with .web3 names
async function getUserProfile(address) {
  const name = await findUserName(address);
  return {
    address,
    displayName: name || 'Anonymous User',
    avatar: `https://avatars.dicebear.com/api/identicon/${address}.svg`
  };
}
```

## API Reference

### NomenclatureSDK

#### Methods

##### `initialize(): Promise<void>`
Connect to the Polkadot network and initialize the contract connection.

##### `resolveName(name: string): Promise<string | null>`
Resolve a .web3 name to a blockchain address.

```javascript
const address = await sdk.resolveName('alice.web3');
```

##### `isNameAvailable(name: string): Promise<boolean>`
Check if a name is available for registration.

```javascript
const available = await sdk.isNameAvailable('newname');
```

##### `registerName(name: string, address: string, signer: any): Promise<Result>`
Register a new .web3 name (requires wallet signature).

```javascript
const result = await sdk.registerName('myname', 'my_address', signer);
```

##### `updateAddress(name: string, newAddress: string, signer: any): Promise<Result>`
Update the address for an owned name.

##### `resolveNames(names: string[]): Promise<NameResolution[]>`
Batch resolve multiple names at once.

##### `disconnect(): Promise<void>`
Close the connection to the network.

### Utility Functions

```javascript
import { nomenclatureUtils } from '@nomenclature/sdk';

// Validate name format
nomenclatureUtils.validateName('alice'); // true
nomenclatureUtils.validateName('invalid@name'); // false

// Normalize names
nomenclatureUtils.normalizeName('alice'); // 'alice.web3'
nomenclatureUtils.normalizeName('bob.web3'); // 'bob.web3'

// Validate addresses
nomenclatureUtils.validateAddress('5FHne...'); // true for Polkadot
nomenclatureUtils.validateAddress('0x742d...'); // true for Ethereum
```

## Integration Patterns

### 1. Address Input Enhancement

Replace address inputs with name-aware fields:

```javascript
function AddressInput({ onAddressChange }) {
  const [input, setInput] = useState('');
  const [resolvedAddress, setResolvedAddress] = useState('');

  useEffect(() => {
    if (input.endsWith('.web3')) {
      nomenclature.resolveName(input).then(address => {
        if (address) {
          setResolvedAddress(address);
          onAddressChange(address);
        }
      });
    } else if (nomenclatureUtils.validateAddress(input)) {
      setResolvedAddress(input);
      onAddressChange(input);
    }
  }, [input]);

  return (
    <div>
      <input 
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter address or name.web3"
      />
      {resolvedAddress && (
        <div>Resolved: {resolvedAddress}</div>
      )}
    </div>
  );
}
```

### 2. Transaction Display

Show human-readable names in transaction history:

```javascript
async function formatTransaction(tx) {
  const senderName = await nomenclature.resolveName(tx.from);
  const recipientName = await nomenclature.resolveName(tx.to);
  
  return {
    ...tx,
    fromDisplay: senderName || tx.from,
    toDisplay: recipientName || tx.to
  };
}
```

### 3. User Directory

Build a user directory with .web3 names:

```javascript
async function buildUserDirectory() {
  // This would require additional contract methods to enumerate users
  const users = await getAllRegisteredNames();
  
  return users.map(async (name) => ({
    name,
    address: await nomenclature.resolveName(name),
    profile: await fetchUserProfile(name)
  }));
}
```

## Error Handling

```javascript
try {
  const address = await nomenclature.resolveName('nonexistent.web3');
  if (!address) {
    console.log('Name not found');
  }
} catch (error) {
  console.error('SDK error:', error.message);
}
```

## TypeScript Support

The SDK is written in TypeScript and provides full type definitions:

```typescript
import NomenclatureSDK, { NomenclatureConfig, NameResolution } from '@nomenclature/sdk';

const config: NomenclatureConfig = {
  rpcEndpoint: 'wss://rpc.shibuya.astar.network'
};

const sdk = new NomenclatureSDK(config);
```

## Network Support

Currently supports:
- **Shibuya Testnet** (default)
- **Astar Network** (coming soon)
- **Custom Substrate chains** (configure RPC endpoint)

## Contributing

See our [GitHub repository](https://github.com/nomenclature/sdk) for contribution guidelines.

## License

MIT