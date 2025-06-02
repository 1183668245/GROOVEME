// Supabase configuration
const SUPABASE_URL = 'https://fsigwwhcajnxasraiflq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzaWd3d2hjYWpueGFzcmFpZmxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4MzkxMDEsImV4cCI6MjA2NDQxNTEwMX0.rsD5BV0rqAd8-GqTkEAsg7O8aE6oM6ugUB3dqzkNROw';

// 检查安全上下文
(function checkSecureContext() {
    console.log('Protocol:', window.location.protocol);
    console.log('Is secure context:', window.isSecureContext);
    
    if (!window.isSecureContext && window.location.protocol !== 'https:' && !window.location.hostname.includes('localhost')) {
        console.warn('MetaMask requires a secure context (HTTPS or localhost)');
        alert('警告：MetaMask 需要安全上下文 (HTTPS 或 localhost) 才能正常工作。当前环境可能无法连接钱包。');
    }
})();

// BSC 网络配置
const BSC_CHAIN_ID = '0x38'; // BSC Mainnet
const BSC_TESTNET_CHAIN_ID = '0x61'; // BSC Testnet

// BSC 网络参数
const BSC_NETWORK_CONFIG = {
    chainId: BSC_CHAIN_ID,
    chainName: 'Binance Smart Chain',
    nativeCurrency: {
        name: 'BNB',
        symbol: 'BNB',
        decimals: 18
    },
    rpcUrls: ['https://bsc-dataseed.binance.org/'],
    blockExplorerUrls: ['https://bscscan.com/']
};

// Initialize Supabase client
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM elements
const messagesContainer = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('send-button');
const chatMessages = document.getElementById('chat-messages');
const menuIcon = document.querySelector('.menu-icon');
const mobileMenu = document.querySelector('.mobile-menu');

// Track last message ID to avoid duplicates
let lastMessageId = null;

// Force auto refresh regardless of wallet status
let forceAutoRefresh = true;

// Current user wallet
let currentWallet = null;
window.currentWallet = null; // Add to global scope

// Debug MetaMask detection
function debugMetaMask() {
    console.log('=== MetaMask Debug Info ===');
    console.log('Protocol:', window.location.protocol);
    console.log('window.ethereum exists:', typeof window.ethereum !== 'undefined');
    console.log('window.ethereum value:', window.ethereum);
    
    if (window.ethereum) {
        console.log('isMetaMask property:', window.ethereum.isMetaMask);
        console.log('Available methods:', Object.getOwnPropertyNames(window.ethereum));
        
        try {
            window.ethereum.request({ method: 'eth_chainId' })
                .then(chainId => console.log('Connected chain ID:', chainId))
                .catch(err => console.log('Chain ID error:', err));
        } catch (e) {
            console.log('Error calling eth_chainId:', e);
        }
    }
    
    // Check if we're in a secure context
    console.log('Is secure context:', window.isSecureContext);
    console.log('=========================');
}

// 切换到 BSC 网络
async function switchToBscNetwork() {
    const ethereum = await window.detectEthereum();
    if (!ethereum) return false;
    
    try {
        // 尝试切换到 BSC 网络
        await ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: BSC_CHAIN_ID }],
        });
        return true;
    } catch (switchError) {
        // 如果 BSC 网络没有添加到 MetaMask 中
        if (switchError.code === 4902) {
            try {
                // 添加 BSC 网络
                await ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [BSC_NETWORK_CONFIG]
                });
                return true;
            } catch (addError) {
                console.error('Error adding BSC network:', addError);
                return false;
            }
        }
        console.error('Error switching to BSC network:', switchError);
        return false;
    }
}

// Connect wallet function
async function connectWallet() {
    try {
        console.log('Starting wallet connection...');
        console.log('Window ethereum object:', window.ethereum);
        
        const ethereum = await window.detectEthereum();
        console.log('Ethereum detection result:', ethereum);
        
        if (!ethereum) {
            console.log('No ethereum object found');
            alert('Please install MetaMask to connect your wallet');
            window.open('https://metamask.io/download/', '_blank');
            return null;
        }

        // 检查是否在安全上下文中运行
        console.log('Is secure context:', window.isSecureContext);
        console.log('Current protocol:', window.location.protocol);
        
        // 检查 MetaMask 是否真的注入了
        console.log('Is MetaMask:', ethereum.isMetaMask);
        console.log('Available methods:', Object.getOwnPropertyNames(ethereum));
        
        // 直接尝试请求账户，不先切换网络
        console.log('Requesting accounts...');
        try {
            const accounts = await ethereum.request({
                method: 'eth_requestAccounts'
            });
            
            console.log('Accounts received:', accounts);
            
            if (accounts && accounts.length > 0) {
                const account = accounts[0];
                console.log('Selected account:', account);
                
                // 获取到账户后再切换网络
                console.log('Switching to BSC network...');
                const switched = await switchToBscNetwork();
                if (!switched) {
                    alert('Please switch to BSC network in MetaMask');
                    return null;
                }
                
                // 检查当前网络
                const chainId = await ethereum.request({ method: 'eth_chainId' });
                console.log('Current chain ID:', chainId);
                
                if (chainId !== BSC_CHAIN_ID) {
                    alert('Please switch to BSC network in MetaMask');
                    return null;
                }
                
                // 验证地址格式
                if (web3.utils.isAddress(account)) {
                    console.log('Valid BSC address:', account);
                    currentWallet = account;
                    window.currentWallet = account;
                    localStorage.setItem('wallet', account);
                    localStorage.setItem('loginTime', Date.now().toString());
                    updateUserInfo(account);
                    document.querySelector('.login-overlay')?.remove();
                    updateSendButtonState(true);
                    return account;
                } else {
                    console.error('Invalid BSC address:', account);
                    alert('Invalid BSC address format');
                    return null;
                }
            }
            
            console.log('No accounts received');
            return null;
        } catch (requestError) {
            console.error('Error requesting accounts:', requestError);
            throw requestError;
        }
    } catch (error) {
        console.error('Connection error:', error);
        if (error.code === 4001) {
            alert('Please connect your wallet to continue');
        } else {
            alert('Error connecting to wallet: ' + error.message);
        }
        return null;
    }
}

// Setup wallet events
async function setupWalletEvents() {
    const ethereum = await window.detectEthereum();
    if (!ethereum) {
        console.log('No ethereum object found, cannot set up events');
        return;
    }
    
    console.log('Setting up wallet events');
    
    // 移除任何现有的事件监听器
    try {
        ethereum.removeListener('accountsChanged', () => {});
        ethereum.removeListener('chainChanged', () => {});
        ethereum.removeListener('disconnect', () => {});
    } catch (e) {
        console.log('Error removing listeners:', e);
    }
    
    // 添加新的事件监听器
    ethereum.on('accountsChanged', (accounts) => {
        console.log('Accounts changed:', accounts);
        if (accounts.length === 0) {
            disconnectWallet();
        } else {
            setWalletAccount(accounts[0]);
        }
    });
    
    ethereum.on('disconnect', (error) => {
        console.log('Wallet disconnected:', error);
        disconnectWallet();
    });
    
    ethereum.on('chainChanged', (chainId) => {
        console.log('Chain changed:', chainId);
        if (chainId !== BSC_CHAIN_ID) {
            alert('Please switch to BSC network');
            switchToBscNetwork().catch(console.error);
        }
    });
    
    // 立即检查当前网络
    try {
        const chainId = await ethereum.request({ method: 'eth_chainId' });
        console.log('Current chain ID on setup:', chainId);
    } catch (e) {
        console.error('Error checking chain ID on setup:', e);
    }
}

// Set wallet account
function setWalletAccount(account) {
    console.log('Setting wallet account:', account);
    currentWallet = account;
    window.currentWallet = account;
    localStorage.setItem('wallet', account);
    localStorage.setItem('loginTime', Date.now().toString());
    updateUserInfo(account);
    document.querySelector('.login-overlay')?.remove();
    updateSendButtonState(true);
}

// Disconnect wallet
function disconnectWallet() {
    console.log('Disconnecting wallet');
    currentWallet = null;
    window.currentWallet = null;
    localStorage.removeItem('wallet');
    localStorage.removeItem('loginTime');
    
    // 移除移动端头像和下拉菜单
    const mobileAvatarContainer = document.querySelector('.mobile-avatar-container');
    if (mobileAvatarContainer) {
        mobileAvatarContainer.remove();
    }
    
    // 恢复 header 中的连接按钮
    const headerUserInfo = document.querySelector('header .user-info');
    if (headerUserInfo) {
        const headerLi = headerUserInfo.closest('li');
        if (headerLi) {
            headerLi.innerHTML = `
                <a href="#" class="connect-wallet" id="headerConnectWallet">
                    <i class="fas fa-wallet"></i> Connect Wallet
                </a>
            `;
            
            // 重新绑定点击事件
            const newHeaderConnectWallet = headerLi.querySelector('#headerConnectWallet');
            newHeaderConnectWallet.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const account = await connectWallet();
                if (account) {
                    setWalletAccount(account);
                }
            });
        }
    }
    
    // 恢复移动端菜单中的连接按钮
    const mobileUserInfo = document.querySelector('.mobile-menu .user-info');
    if (mobileUserInfo) {
        const mobileLi = mobileUserInfo.closest('li');
        if (mobileLi) {
            mobileLi.innerHTML = `
                <a href="#" class="connect-wallet" id="mobileConnectWallet">
                    <i class="fas fa-wallet"></i> Connect Wallet
                </a>
            `;
            
            // 重新绑定点击事件
            const newMobileConnectWallet = mobileLi.querySelector('#mobileConnectWallet');
            newMobileConnectWallet.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const account = await connectWallet();
                if (account) {
                    setWalletAccount(account);
                }
            });
        }
    }
    
    updateSendButtonState(false);
    showLoginOverlay();
}

// Load messages from Supabase
async function loadMessages() {
    console.log('Loading messages...');
    const { data, error } = await supabaseClient
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error loading messages:', error);
        return;
    }

    console.log('Messages loaded:', data ? data.length : 0);

    if (!data || data.length === 0) return;

    // First load - clear container and show all messages
    if (lastMessageId === null) {
        console.log('First load, showing all messages');
        messagesContainer.innerHTML = '';
        data.forEach(renderMessage);
        lastMessageId = data[data.length - 1].id;
        scrollToBottom();
        return;
    }

    // Find new messages
    const newMessages = data.filter(msg => msg.id > lastMessageId);
    console.log('New messages found:', newMessages.length);
    
    if (newMessages.length > 0) {
        newMessages.forEach(renderMessage);
        lastMessageId = newMessages[newMessages.length - 1].id;
        scrollToBottom();
    }
}

// Render a message in the chat
function renderMessage(message) {
    console.log('Rendering message:', message.id);
    const messageElement = document.createElement('div');
    
    const currentUserWallet = window.currentWallet || '';
    const isSent = message.wallet_address && message.wallet_address === currentUserWallet;
    
    messageElement.className = `message ${isSent ? 'sent' : 'received'}`;
    
    const avatar = document.createElement('img');
    avatar.src = generateAvatarUrl(message.wallet_address || 'anonymous');
    avatar.className = 'message-avatar';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    const username = document.createElement('div');
    username.className = 'message-username';
    username.textContent = message.wallet_address ? formatWalletAddress(message.wallet_address) : 'Anonymous';
    
    const text = document.createElement('div');
    text.className = 'message-text';
    text.textContent = message.content;
    
    const timestamp = document.createElement('div');
    timestamp.className = 'message-timestamp';
    timestamp.textContent = new Date(message.created_at).toLocaleTimeString();
    
    if (isSent) {
        contentDiv.appendChild(text);
        contentDiv.appendChild(timestamp);
        messageElement.appendChild(contentDiv);
        messageElement.appendChild(avatar);
    } else {
        contentDiv.appendChild(username);
        contentDiv.appendChild(text);
        contentDiv.appendChild(timestamp);
        messageElement.appendChild(avatar);
        messageElement.appendChild(contentDiv);
    }
    
    messagesContainer.appendChild(messageElement);
}

// Scroll to the bottom of the chat
function scrollToBottom() {
    const lastMessage = messagesContainer.lastElementChild;
    if (lastMessage) {
        lastMessage.scrollIntoView({ behavior: 'smooth' });
    }
}

// Send a message
async function sendMessage() {
    console.log('Send message triggered');
    
    // Use window.currentWallet or allow anonymous sending
    const userWallet = window.currentWallet || 'anonymous';
    
    const content = messageInput.value.trim();
    if (!content) {
        console.log('Empty message, not sending');
        return;
    }

    console.log('Sending message:', content);
    messageInput.value = '';
    
    const { data, error } = await supabaseClient
        .from('messages')
        .insert([
            {
                content,
                wallet_address: userWallet,
                created_at: new Date().toISOString()
            }
        ]);

    if (error) {
        console.error('Error sending message:', error);
        return;
    }

    console.log('Message sent successfully:', data);
    await loadMessages();
}

// Setup auto refresh for messages
function setupAutoRefresh() {
    console.log('Setting up auto refresh...');
    
    // Enable auto refresh regardless of wallet status
    if (forceAutoRefresh) {
        console.log('Force auto refresh enabled');
    } else {
        const userWallet = window.currentWallet;
        console.log('Current wallet:', userWallet);
        
        if (!userWallet) {
            console.log('No wallet, not setting up refresh');
            return;
        }
    }
    
    // Clear existing interval
    if (window.refreshInterval) {
        console.log('Clearing existing interval');
        clearInterval(window.refreshInterval);
    }
    
    // Set new interval
    console.log('Setting new interval');
    window.refreshInterval = setInterval(() => {
        console.log('Auto refresh triggered');
        loadMessages();
    }, 3000);
}

// Format wallet address for display
function formatWalletAddress(address) {
    if (!address || address === 'anonymous') return 'Anonymous';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

// Generate avatar URL based on wallet address
function generateAvatarUrl(address) {
    if (!address || address === 'anonymous') {
        return 'https://api.dicebear.com/7.x/pixel-art/svg?seed=anonymous';
    }
    return `https://api.dicebear.com/7.x/pixel-art/svg?seed=${address}`;
}

// Show login overlay
function showLoginOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'login-overlay';
    overlay.innerHTML = 'Wallet address login';
    document.querySelector('.chat-input-container').appendChild(overlay);

    overlay.addEventListener('click', async () => {
        const account = await connectWallet();
        if (account) {
            setWalletAccount(account);
            overlay.remove();
        }
    });
}

// Show login button
function showLoginButton() {
    // 查找并更新 header 中的连接按钮
    const headerConnectWalletLi = document.querySelector('#headerConnectWallet')?.closest('li');
    
    if (headerConnectWalletLi) {
        // 创建新的连接钱包按钮
        const loginBtn = document.createElement('a');
        loginBtn.href = '#';
        loginBtn.className = 'connect-wallet';
        loginBtn.id = 'headerConnectWallet';
        loginBtn.innerHTML = `<i class="fas fa-wallet"></i> Connect Wallet`;
        
        // 替换原来的按钮
        headerConnectWalletLi.innerHTML = '';
        headerConnectWalletLi.appendChild(loginBtn);
        
        // 为新创建的按钮添加点击事件
        loginBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Header login button clicked');
            const account = await connectWallet();
            if (account) {
                setWalletAccount(account);
            }
        });
    } else {
        console.warn('Could not find headerConnectWallet element');
    }
    
    // 查找并更新移动端菜单中的连接按钮
    const mobileConnectWalletLi = document.querySelector('#mobileConnectWallet')?.closest('li');
    
    if (mobileConnectWalletLi) {
        // 创建新的连接钱包按钮
        const mobileLoginBtn = document.createElement('a');
        mobileLoginBtn.href = '#';
        mobileLoginBtn.className = 'connect-wallet';
        mobileLoginBtn.id = 'mobileConnectWallet';
        mobileLoginBtn.innerHTML = `<i class="fas fa-wallet"></i> Connect Wallet`;
        
        // 替换原来的按钮
        mobileConnectWalletLi.innerHTML = '';
        mobileConnectWalletLi.appendChild(mobileLoginBtn);
        
        // 为新创建的按钮添加点击事件
        mobileLoginBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Mobile login button clicked');
            const account = await connectWallet();
            if (account) {
                setWalletAccount(account);
            }
        });
    } else {
        console.warn('Could not find mobileConnectWallet element');
    }
}

// Update user info display
function updateUserInfo(walletAddress) {
    // 移除任何已存在的用户信息显示
    const existingUserInfo = document.querySelector('.user-info');
    if (existingUserInfo) {
        existingUserInfo.remove();
    }
    
    // 移除任何已存在的移动端头像和下拉菜单
    const existingMobileAvatar = document.querySelector('.mobile-avatar');
    if (existingMobileAvatar) {
        existingMobileAvatar.remove();
    }
    const existingMobileDropdown = document.querySelector('.mobile-dropdown-menu');
    if (existingMobileDropdown) {
        existingMobileDropdown.remove();
    }
    
    // 在原位置替换连接按钮
    const headerConnectWallet = document.querySelector('#headerConnectWallet');
    const mobileConnectWallet = document.querySelector('#mobileConnectWallet');
    
    // 为移动端添加头像和下拉菜单
    const menuIcon = document.querySelector('.menu-icon');
    if (menuIcon) {
        const mobileAvatarContainer = document.createElement('div');
        mobileAvatarContainer.className = 'mobile-avatar-container';
        
        // 创建移动端头像元素
        const mobileAvatar = document.createElement('div');
        mobileAvatar.className = 'mobile-avatar';
        mobileAvatar.innerHTML = `<img src="${generateAvatarUrl(walletAddress)}" alt="avatar">`;
        
        // 创建移动端下拉菜单
        const mobileDropdown = document.createElement('div');
        mobileDropdown.className = 'mobile-dropdown-menu';
        mobileDropdown.innerHTML = `
            <div class="dropdown-content">
                <span class="wallet-address">${formatWalletAddress(walletAddress)}</span>
                <button id="mobileLogoutBtn">Logout</button>
            </div>
        `;
        
        // 添加到容器
        mobileAvatarContainer.appendChild(mobileAvatar);
        mobileAvatarContainer.appendChild(mobileDropdown);
        
        // 插入到菜单图标的前面
        menuIcon.parentNode.insertBefore(mobileAvatarContainer, menuIcon);
        
        // 添加点击事件，显示/隐藏下拉菜单
        mobileAvatar.addEventListener('click', (e) => {
            e.stopPropagation();
            mobileDropdown.classList.toggle('active');
        });
        
        // 点击其他地方关闭下拉菜单
        document.addEventListener('click', (e) => {
            if (!mobileAvatarContainer.contains(e.target)) {
                mobileDropdown.classList.remove('active');
            }
        });
        
        // 设置登出按钮行为
        const mobileLogoutBtn = mobileDropdown.querySelector('#mobileLogoutBtn');
        mobileLogoutBtn.addEventListener('click', disconnectWallet);
    }
    
    if (headerConnectWallet) {
        const headerLi = headerConnectWallet.closest('li');
        if (headerLi) {
            // 创建用户信息显示
            const userInfo = document.createElement('div');
            userInfo.className = 'user-info';
            userInfo.innerHTML = `
                <img src="${generateAvatarUrl(walletAddress)}" alt="avatar">
                <span>${formatWalletAddress(walletAddress)}</span>
                <div class="dropdown-menu">
                    <button id="logoutBtn">Logout</button>
                </div>
            `;
            
            // 替换原来的按钮
            headerLi.innerHTML = '';
            headerLi.appendChild(userInfo);
            
            // 设置下拉菜单行为
            const dropdownMenu = userInfo.querySelector('.dropdown-menu');
            userInfo.addEventListener('click', () => {
                dropdownMenu.classList.toggle('active');
            });
            
            document.addEventListener('click', (e) => {
                if (!userInfo.contains(e.target)) {
                    dropdownMenu.classList.remove('active');
                }
            });
            
            // 设置登出按钮行为
            const logoutBtn = userInfo.querySelector('#logoutBtn');
            logoutBtn.addEventListener('click', disconnectWallet);
        }
    }
    
    // 处理移动端菜单中的按钮
    if (mobileConnectWallet) {
        const mobileLi = mobileConnectWallet.closest('li');
        if (mobileLi) {
            // 创建移动端用户信息显示（只显示地址和登出按钮）
            const mobileUserInfo = document.createElement('div');
            mobileUserInfo.className = 'user-info';
            mobileUserInfo.innerHTML = `
                <span>${formatWalletAddress(walletAddress)}</span>
                <div class="dropdown-menu">
                    <button id="menuLogoutBtn">Logout</button>
                </div>
            `;
            
            // 替换原来的按钮
            mobileLi.innerHTML = '';
            mobileLi.appendChild(mobileUserInfo);
            
            // 设置移动端菜单中登出按钮行为
            const menuLogoutBtn = mobileUserInfo.querySelector('#menuLogoutBtn');
            menuLogoutBtn.addEventListener('click', disconnectWallet);
        }
    }
}

// Update send button state
function updateSendButtonState(isLoggedIn) {
    if (sendButton) {
        if (isLoggedIn) {
            sendButton.disabled = false;
            sendButton.classList.remove('disabled');
        } else {
            sendButton.disabled = true;
            sendButton.classList.add('disabled');
        }
    }
}

// Check login status
async function checkLoginStatus() {
    const wallet = localStorage.getItem('wallet');
    const loginTime = localStorage.getItem('loginTime');
    
    if (wallet && loginTime) {
        const timePassed = Date.now() - parseInt(loginTime);
        if (timePassed < 86400000) { // 24 hours
            // 验证钱包是否仍然连接
            const ethereum = await window.detectEthereum();
            if (ethereum) {
                try {
                    const accounts = await ethereum.request({ method: 'eth_accounts' });
                    if (accounts && accounts.length > 0 && accounts[0].toLowerCase() === wallet.toLowerCase()) {
                        console.log('Wallet still connected:', wallet);
                        setWalletAccount(wallet);
                        return true;
                    }
                } catch (error) {
                    console.error('Error checking accounts:', error);
                }
            }
            // 如果验证失败，清除存储的钱包信息
            localStorage.removeItem('wallet');
            localStorage.removeItem('loginTime');
        } else {
            localStorage.removeItem('wallet');
            localStorage.removeItem('loginTime');
        }
    }
    updateSendButtonState(false);
    return false;
}

// Setup mobile menu
function setupMobileMenu() {
    if (menuIcon && mobileMenu) {
        menuIcon.addEventListener('click', function(e) {
            e.stopPropagation();
            mobileMenu.classList.toggle('active');
            
            // Close menu when clicking outside
            document.addEventListener('click', function closeMenu(e) {
                if (!mobileMenu.contains(e.target) && !menuIcon.contains(e.target)) {
                    mobileMenu.classList.remove('active');
                    document.removeEventListener('click', closeMenu);
                }
            });
        });
    }
}

// Initialize chat
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM Content Loaded');
    debugMetaMask();
    
    // Add a delay to check if MetaMask injects later
    setTimeout(() => {
        console.log('Delayed MetaMask check:');
        debugMetaMask();
    }, 1000);
    
    // Setup wallet events
    await setupWalletEvents();
    
    // Setup connect wallet buttons with more robust error handling
    const connectWalletButtons = document.querySelectorAll('.connect-wallet');
    console.log('Found connect wallet buttons:', connectWalletButtons.length);
    
    connectWalletButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            console.log('Connect wallet button clicked');
            e.preventDefault();
            e.stopPropagation();
            
            try {
                const account = await connectWallet();
                if (account) {
                    console.log('Connected to account:', account);
                } else {
                    console.log('No account returned from connectWallet');
                }
            } catch (err) {
                console.error('Error in wallet button click handler:', err);
            }
        });
    });

    // Setup send button
    if (sendButton) {
        sendButton.addEventListener('click', async () => {
            if (!window.currentWallet) {
                const account = await connectWallet();
                if (account) {
                    setWalletAccount(account);
                }
                return;
            }
            sendMessage();
        });
    }

    // Setup message input
    if (messageInput) {
        messageInput.addEventListener('keypress', async (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (!window.currentWallet) {
                    const account = await connectWallet();
                    if (account) {
                        setWalletAccount(account);
                    }
                    return;
                }
                sendMessage();
            }
        });
    }

    // Setup mobile menu
    setupMobileMenu();

    // Check if already logged in
    const isLoggedIn = await checkLoginStatus();
    if (isLoggedIn) {
        await loadMessages();
        setupAutoRefresh();
        return;
    }
    
    // Show login button and overlay
    showLoginButton();
    showLoginOverlay();
    
    // Load messages for anonymous viewing
    await loadMessages();
    setupAutoRefresh();
});

// Add style for the modal
document.head.insertAdjacentHTML('beforeend', `
<style>
.separator {
    display: flex;
    align-items: center;
    text-align: center;
    margin: 20px 0;
    color: rgba(255, 255, 255, 0.5);
}

.separator::before,
.separator::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.separator span {
    padding: 0 10px;
}

.metamask-btn {
    background: #F6851B;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
}

.metamask-btn:hover {
    background: #E2761B;
}

.metamask-help {
    margin-top: 20px;
    text-align: center;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);
}

.metamask-help a {
    color: var(--primary-color);
    text-decoration: none;
}

.metamask-help a:hover {
    text-decoration: underline;
}
</style>
`); 
