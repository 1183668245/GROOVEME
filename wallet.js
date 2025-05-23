// MetaMask wallet connection functionality
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const connectWalletBtn = document.querySelector('.connect-wallet');
    const networkNameElement = document.getElementById('network-name');
    const walletAddressElement = document.getElementById('wallet-address-text');
    const walletBalanceElement = document.getElementById('wallet-balance-text');
    const walletStatusElement = document.getElementById('wallet-status');
    
    // Check if MetaMask is installed
    const isMetaMaskInstalled = () => {
        return typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask;
    };
    
    // Format address to show only first and last few characters
    function formatAddress(address) {
        if (!address) return 'Not Connected';
        return address.substring(0, 6) + '...' + address.substring(address.length - 4);
    }
    
    // Format ETH balance
    function formatBalance(balance) {
        return parseFloat(balance).toFixed(4);
    }
    
    // Get network name based on chain ID
    function getNetworkName(chainId) {
        const networks = {
            '0x1': 'Ethereum Mainnet',
            '0x3': 'Ropsten Testnet',
            '0x4': 'Rinkeby Testnet',
            '0x5': 'Goerli Testnet',
            '0x2a': 'Kovan Testnet',
            '0x38': 'Binance Smart Chain',
            '0x89': 'Polygon Mainnet',
            '0xa86a': 'Avalanche Mainnet'
        };
        
        return networks[chainId] || `Chain ID: ${chainId}`;
    }
    
    // Update UI based on connection status
    function updateUI(connected, address = '', chainId = '', balance = 0) {
        if (connected) {
            networkNameElement.textContent = getNetworkName(chainId);
            walletAddressElement.textContent = formatAddress(address);
            walletBalanceElement.textContent = formatBalance(balance);
            connectWalletBtn.textContent = 'Disconnect';
            connectWalletBtn.classList.add('connected');
            walletStatusElement.classList.add('connected');
        } else {
            networkNameElement.textContent = 'Not Connected';
            walletAddressElement.textContent = 'Not Connected';
            walletBalanceElement.textContent = '0';
            connectWalletBtn.innerHTML = '<i class="fas fa-wallet"></i> Connect Wallet';
            connectWalletBtn.classList.remove('connected');
            walletStatusElement.classList.remove('connected');
        }
    }
    
    // Get account data
    async function getAccountData() {
        try {
            // Get accounts
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const account = accounts[0];
            
            // Get chain ID
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            
            // Get balance
            const balanceHex = await window.ethereum.request({
                method: 'eth_getBalance',
                params: [account, 'latest']
            });
            
            // Convert balance from wei to ETH
            const balanceWei = parseInt(balanceHex, 16);
            const balanceETH = balanceWei / 1e18;
            
            return {
                account,
                chainId,
                balance: balanceETH
            };
        } catch (error) {
            console.error('Error getting account data:', error);
            return null;
        }
    }
    
    // Connect wallet function
    async function connectWallet() {
        if (!isMetaMaskInstalled()) {
            alert('MetaMask is not installed. Please install MetaMask to connect your wallet.');
            window.open('https://metamask.io/download.html', '_blank');
            return;
        }
        
        try {
            connectWalletBtn.textContent = 'Connecting...';
            
            const accountData = await getAccountData();
            
            if (accountData) {
                updateUI(true, accountData.account, accountData.chainId, accountData.balance);
            } else {
                updateUI(false);
                alert('Failed to connect wallet. Please try again.');
            }
        } catch (error) {
            console.error('Error connecting wallet:', error);
            updateUI(false);
            
            if (error.code === 4001) {
                // User rejected the request
                alert('Please connect to MetaMask to continue.');
            } else {
                alert('Error connecting to wallet. Please try again.');
            }
        }
    }
    
    // Disconnect wallet function
    function disconnectWallet() {
        updateUI(false);
    }
    
    // Initialize
    function initialize() {
        // Check if MetaMask is installed
        if (isMetaMaskInstalled()) {
            // Listen for account changes
            window.ethereum.on('accountsChanged', async (accounts) => {
                if (accounts.length === 0) {
                    // User disconnected their wallet
                    updateUI(false);
                } else {
                    // Account changed, update UI
                    const accountData = await getAccountData();
                    if (accountData) {
                        updateUI(true, accountData.account, accountData.chainId, accountData.balance);
                    }
                }
            });
            
            // Listen for chain changes
            window.ethereum.on('chainChanged', async () => {
                const accountData = await getAccountData();
                if (accountData) {
                    updateUI(true, accountData.account, accountData.chainId, accountData.balance);
                }
            });
            
            // Check if already connected
            window.ethereum.request({ method: 'eth_accounts' })
                .then(async (accounts) => {
                    if (accounts.length > 0) {
                        const accountData = await getAccountData();
                        if (accountData) {
                            updateUI(true, accountData.account, accountData.chainId, accountData.balance);
                        }
                    }
                })
                .catch((error) => {
                    console.error('Error checking connection:', error);
                });
        }
    }
    
    // Connect/Disconnect wallet button click event
    if (connectWalletBtn) {
        connectWalletBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (connectWalletBtn.classList.contains('connected')) {
                disconnectWallet();
            } else {
                connectWallet();
            }
        });
    }
    
    // Initialize the wallet connection
    initialize();
});