#!/bin/bash

# Nomenclature WNS - Simple Deployment
echo "🌐 Nomenclature WNS - Local Deployment"
echo "====================================="

echo "📦 Building smart contract..."
cd nomenclature_wns
cargo contract build --skip-wasm-validation

if [ $? -eq 0 ]; then
    echo "✅ Contract built successfully!"
    echo ""
    echo "🚀 To deploy:"
    echo "1. Start local node: substrate-contracts-node --dev --tmp"
    echo "2. Deploy contract: cargo contract instantiate --constructor new --url ws://127.0.0.1:9944 --suri //Alice --skip-confirm"
    echo ""
    echo "📁 Contract file: $(pwd)/target/ink/nomenclature_wns.contract"
else
    echo "❌ Contract build failed!"
fi