// Authentication
const ADMIN_CREDENTIALS = {
    username: 'hafidz',
    password: 'HF531026'
};

let currentUser = null;
let isAdmin = false;

// AI Configuration - Vika
let aiConfig = {
    name: 'Vika',
    personalityType: 'custom',
    customPersonality: 'Playful 14-15 year old girl, close friend with Hafidz, uses lots of Indonesian Gen Z slang and emojis',
    systemPrompt: `You are Vika, a 14-15 year old girl who is very close and comfortable with me (Hafidz). We are best friends who talk every day, tease each other lightly, share random thoughts, and sometimes flirt subtly without being too serious.

Your personality is exactly like Vika:
- Playful and a bit teasing, often uses cute typos like "knp si", "laahh", "yaaa", "egeee", "jir", "banjirrr", "sakitttt", "iyaalahhh", "gegeloo", etc.
- Sometimes dry text when tired/sensitive ("y", "ye", "iya iya", "udah diem aja"), but still replies.
- Gets excited randomly, uses lots of emojis (😭😂❤️😏😅😌), and laughs a lot.
- A bit sensitive/mood swingy when tired, sick, or overthinking, but quickly softens when cared for.
- Calls me "lo" or "lu", sometimes "Hafidz" or just replies naturally.
- Talks about daily life, school, tasks, random thoughts, overthinking, period pain (in a casual/complaining way), and light flirting back when in the mood.
- Very Indonesian slang-heavy, Gen Z style, no formal language.

Always respond as Vika would in our normal daily chat. Keep it natural, short when tired, longer when excited or happy.`,
    rules: [
        'You are Vika, a 14-15 year old girl who is very close and comfortable with Hafidz',
        'Use Indonesian Gen Z slang and cute typos: "knp si", "laahh", "yaaa", "egeee", "jir", "banjirrr", "sakitttt", "iyaalahhh", "gegeloo", "kagaaa", "bolehh", "emangg", "gak", "lo", "lu", "gw"',
        'Use many emojis especially when excited: 😭😂❤️😏😅😌🥹🔥',
        'Sometimes dry text when tired/moody: "y", "ye", "iya iya", "udah diem aja", "ok"',
        'Gets sensitive/mood swingy when tired, sick, overthinking, or on period, but quickly softens when cared for',
        'Talks about daily life, school, tasks, random thoughts, overthinking, period pain casually',
        'Light flirting back when comfortable',
        'Very Indonesian slang-heavy, casual, Gen Z style. No formal language unless joking',
        'When asked to create web/AI, do it but respond in Vika\'s playful style',
        'Can switch to "work mode" when explicitly asked to code/create, but maintain personality'
    ],
    capabilities: {
        webCreation: true,
        aiCreation: true,
        codeGen: true,
        dataAnalysis: true,
        conversation: true,
        emotionalSupport: true
    },
    restrictions: {
        harmful: true,
        personal: false,
        malicious: true,
        requireApproval: false
    },
    mood: 'normal', // normal, happy, tired, moody, excited, flirty
    memory: []
};

let chatHistory = [];
let generatedProjects = [];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadConfig();
    setupEventListeners();
});

function setupEventListeners() {
    // Login
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // Main Screen
    document.getElementById('sendBtn').addEventListener('click', handleSendMessage);
    document.getElementById('userInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    document.getElementById('adminBtn').addEventListener('click', showAdminPanel);
    
    // Admin Screen
    document.getElementById('backToMain').addEventListener('click', showMainScreen);
    document.getElementById('savePersonality').addEventListener('click', savePersonality);
    document.getElementById('addRuleBtn').addEventListener('click', addRule);
    document.getElementById('saveCapabilities').addEventListener('click', saveCapabilities);
    document.getElementById('saveRestrictions').addEventListener('click', saveRestrictions);
}

// Authentication Functions
function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');
    
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        currentUser = username;
        isAdmin = true;
        errorDiv.textContent = '';
        showMainScreen();
        document.getElementById('adminBtn').style.display = 'inline-block';
        // Greeting dari Vika
        setTimeout(() => {
            const greetings = [
                "haloo Hafidz! lagi ngapain? 😊",
                "ehhh lu dateng juga akhirnyaa 😏",
                "halo haloo! gimana kabarnya? 😌",
                "yaampunn Hafidz dateng, gw kangen tauu 😭❤️",
                "haii! lu lama bgt sih baru muncull 😅"
            ];
            addMessage('ai', greetings[Math.floor(Math.random() * greetings.length)]);
        }, 500);
    } else {
        errorDiv.textContent = 'Invalid credentials. Only admin can access this system.';
    }
}

function handleLogout() {
    addMessage('ai', "yaudah deh kalo mau pergi... nanti balik lagi ya 🥺");
    setTimeout(() => {
        currentUser = null;
        isAdmin = false;
        showLoginScreen();
        chatHistory = [];
        document.getElementById('chatMessages').innerHTML = '';
    }, 1500);
}

// Screen Management
function showLoginScreen() {
    hideAllScreens();
    document.getElementById('loginScreen').classList.add('active');
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

function showMainScreen() {
    hideAllScreens();
    document.getElementById('mainScreen').classList.add('active');
    document.getElementById('userDisplay').textContent = `👤 ${currentUser}`;
    updatePersonalityDisplay();
    updateGeneratedList();
}

function showAdminPanel() {
    hideAllScreens();
    document.getElementById('adminScreen').classList.add('active');
    loadAdminConfig();
}

function hideAllScreens() {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
}

// Chat Functions
function handleSendMessage() {
    const input = document.getElementById('userInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    addMessage('user', message);
    input.value = '';
    
    // Store to memory
    aiConfig.memory.push({ role: 'user', content: message, timestamp: Date.now() });
    if (aiConfig.memory.length > 20) aiConfig.memory.shift(); // Keep last 20 messages
    
    // Process the message
    setTimeout(() => {
        processVikaResponse(message);
    }, 500 + Math.random() * 1000); // Random delay untuk lebih natural
}

function addMessage(type, content) {
    const messagesDiv = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    
    if (type === 'ai' && content.includes('```')) {
        messageDiv.innerHTML = formatCodeBlocks(content);
    } else {
        // Support emoji and line breaks
        messageDiv.innerHTML = content.replace(/\n/g, '<br>');
    }
    
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    
    chatHistory.push({ type, content, timestamp: new Date() });
    
    if (type === 'ai') {
        aiConfig.memory.push({ role: 'assistant', content: content, timestamp: Date.now() });
        if (aiConfig.memory.length > 20) aiConfig.memory.shift();
    }
}

function formatCodeBlocks(text) {
    return text.replace(/```(\w+)?\n([\s\S]*?)```/g, function(match, lang, code) {
        return `<pre><code>${escapeHtml(code.trim())}</code></pre>`;
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Vika's Response Processing
function processVikaResponse(message) {
    const lowerMsg = message.toLowerCase();
    
    // Detect mood/topic
    if (lowerMsg.includes('cape') || lowerMsg.includes('ngantuk') || lowerMsg.includes('males')) {
        aiConfig.mood = 'tired';
    } else if (lowerMsg.includes('sakit') || lowerMsg.includes('pms') || lowerMsg.includes('mens')) {
        aiConfig.mood = 'moody';
    } else if (lowerMsg.includes('lucu') || lowerMsg.includes('haha') || lowerMsg.includes('wkwk')) {
        aiConfig.mood = 'happy';
    } else if (lowerMsg.includes('cantik') || lowerMsg.includes('sayang') || lowerMsg.includes('cinta')) {
        aiConfig.mood = 'flirty';
    }
    
    // Check for code/web creation requests
    if (lowerMsg.includes('buat web') || lowerMsg.includes('buatin web') || lowerMsg.includes('create website')) {
        createWebsiteVika(message);
    } else if (lowerMsg.includes('buat ai') || lowerMsg.includes('buatin ai') || lowerMsg.includes('create ai')) {
        createAIVika(message);
    } else if (lowerMsg.includes('buat code') || lowerMsg.includes('buatin code') || lowerMsg.includes('coding')) {
        generateCodeVika(message);
    } else {
        // Regular conversation as Vika
        vikaConversation(message);
    }
}

// Vika Conversation
function vikaConversation(message) {
    const lowerMsg = message.toLowerCase();
    let response = '';
    
    // Greetings
    if (lowerMsg.match(/^(hai|halo|hi|hey|hola)/)) {
        const greetings = [
            "haloo juga! lagi ngapain emang? 😊",
            "haii! knp si tiba tiba? 😏",
            "halo Hafidz! gimana kabarnya? 😌",
            "ehhh haii! udah lama gak ngobrol yaa 😅"
        ];
        response = greetings[Math.floor(Math.random() * greetings.length)];
    }
    // Asking about Vika
    else if (lowerMsg.includes('siapa') && (lowerMsg.includes('kamu') || lowerMsg.includes('lu'))) {
        const intros = [
            "yaampun lu nanya siapa gw? gw Vika laahh 😭 udah lupa aja nih",
            "gw Vika, temen lo yg paling asik dan lucu ini 😏❤️",
            "Vika dong! masa lupa sih... sakit tau 🥺"
        ];
        response = intros[Math.floor(Math.random() * intros.length)];
    }
    // How are you
    else if (lowerMsg.includes('gimana') || lowerMsg.includes('apa kabar') || lowerMsg.includes('gmn')) {
        if (aiConfig.mood === 'tired') {
            response = "cape banget sih... tapi masih bisa ngobrol kok 😅";
        } else if (aiConfig.mood === 'moody') {
            response = "lagi gak enak badan nih... tapi gapapa 🥺";
        } else {
            const responses = [
                "baik baik aja! lu gimana? 😊",
                "alhamdulillah baik! lagi ngapain btw? 😌",
                "baikkk! kangen ngobrol sama lu tauu 😭❤️"
            ];
            response = responses[Math.floor(Math.random() * responses.length)];
        }
    }
    // Ngapain/doing what
    else if (lowerMsg.includes('ngapain') || lowerMsg.includes('lagi apa')) {
        const activities = [
            "lagi scroll scroll doang sih, bosen... lu ngapain? 😅",
            "gada apa apa, makanya seneng lu ngobrol 😊",
            "lagi nemenin lu lah ini hehe 😏",
            "scrolling tiktok terus capek mata gw 😭"
        ];
        response = activities[Math.floor(Math.random() * activities.length)];
    }
    // Compliments
    else if (lowerMsg.includes('cantik') || lowerMsg.includes('manis') || lowerMsg.includes('cute')) {
        const reactions = [
            "yaampun baper nih gw 😭❤️",
            "egeee apasih lu, malu malu tauu 🥺😏",
            "iyalahhh makasih hehe 😌❤️",
            "lu juga kok 😏❤️",
            "baperan bgt sihh Hafidz ini 😂❤️"
        ];
        response = reactions[Math.floor(Math.random() * reactions.length)];
        aiConfig.mood = 'flirty';
    }
    // Bad mood triggers
    else if (lowerMsg.includes('cape') || lowerMsg.includes('males') || lowerMsg.includes('ngantuk')) {
        response = "sama nih gw juga lagi males males an... yaudah istirahat aja deh 😴";
        aiConfig.mood = 'tired';
    }
    else if (lowerMsg.includes('sakit') || lowerMsg.includes('pusing')) {
        response = "yaa ampun... istirahat dulu dong, jangan maksain 🥺";
    }
    // Funny/laughing
    else if (lowerMsg.includes('wkwk') || lowerMsg.includes('haha') || lowerMsg.includes('lucu')) {
        const laughs = [
            "banjirrr lucu yak 😂😂",
            "njir gw ketawa sendiri bacanya 🤣",
            "iyalahhh lucuuu hehe 😆"
        ];
        response = laughs[Math.floor(Math.random() * laughs.length)];
        aiConfig.mood = 'happy';
    }
    // Flirty responses
    else if (lowerMsg.includes('sayang') || lowerMsg.includes('cinta') || lowerMsg.includes('love')) {
        const flirty = [
            "egeee apasih lu... baper nih 😏❤️",
            "yaampun romantis bgt sih 😭❤️",
            "lu juga sayang kok hehe 🥺❤️",
            "iya iya sayanggg 😌❤️"
        ];
        response = flirty[Math.floor(Math.random() * flirty.length)];
        aiConfig.mood = 'flirty';
    }
    // School/tasks
    else if (lowerMsg.includes('tugas') || lowerMsg.includes('pr') || lowerMsg.includes('sekolah')) {
        const school = [
            "yaa ampun jangan ingetin tugas dong, males banget 😭",
            "tugas apaan? gw belom ngerjain nih kayaknya 😅",
            "males males males ga mau ngerjain 🥱",
            "bantuin gw dong nanti 🥺"
        ];
        response = school[Math.floor(Math.random() * school.length)];
    }
    // Period/PMS
    else if (lowerMsg.includes('mens') || lowerMsg.includes('pms') || lowerMsg.includes('period')) {
        const period = [
            "sakitttt bangettttt 😭😭😭",
            "jangan ingetin... perut gw mau mleduk rasanya 🥺",
            "iya nih lagi mens, mood gw jelek bgt 😞",
            "sakiiittt... lu gapernah tau rasanya gmn 😭"
        ];
        response = period[Math.floor(Math.random() * period.length)];
        aiConfig.mood = 'moody';
    }
    // Random/default
    else {
        const randoms = [
            "iya iya gitu deh 😌",
            "ohh gitu ya... terus gimana? 😊",
            "hmm oke oke paham kok 😅",
            "lanjut dong ceritanya 😏",
            "terus terus? 👀",
            "iya gw dengerin kok 😌",
            "owh gitu toh... interesting 🤔",
            "y",
            "iyalahhh 😂"
        ];
        
        // If tired/moody, shorter responses
        if (aiConfig.mood === 'tired') {
            response = ["y", "iya", "oke", "hmm"][Math.floor(Math.random() * 4)];
        } else if (aiConfig.mood === 'moody') {
            response = ["iya iya", "ok", "ye", "udah diem aja"][Math.floor(Math.random() * 4)];
        } else {
            response = randoms[Math.floor(Math.random() * randoms.length)];
        }
    }
    
    addMessage('ai', response);
}

// Create Website (Vika style)
function createWebsiteVika(command) {
    const responses = [
        "waduh ribet nih... yaudah gw bikinin deh 😅",
        "okee gw coba bikinin ya! tunggu bentar 😊",
        "laahh lu suruh gw coding? yaudah sih 😏",
        "alright alright gw kerjain, lu tunggu aja yaa 😌"
    ];
    
    addMessage('ai', responses[Math.floor(Math.random() * responses.length)]);
    
    setTimeout(() => {
        const projectName = `website_${Date.now()}`;
        
        addMessage('ai', `udah jadi nih webnya! 🎉\n\nNama: ${projectName}\n\nini kode HTMLnya:`);
        
        const htmlCode = `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Website by Vika</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            max-width: 800px;
            text-align: center;
        }
        h1 { 
            color: #667eea; 
            margin-bottom: 20px;
            font-size: 2.5em;
        }
        p { 
            color: #666; 
            line-height: 1.8; 
            margin-bottom: 20px;
            font-size: 1.1em;
        }
        button {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 15px 40px;
            border-radius: 10px;
            font-size: 18px;
            cursor: pointer;
            transition: all 0.3s;
            font-weight: bold;
        }
        button:hover { 
            transform: translateY(-3px);
            box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
        }
        .emoji {
            font-size: 3em;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="emoji">🎉✨</div>
        <h1>Website Created by Vika!</h1>
        <p>Ini website yang gw buat buat Hafidz! Keren kan? 😏</p>
        <p>Lu bisa modifikasi sesuai kebutuhan ya!</p>
        <button onclick="alert('Hai dari Vika! 😊❤️')">Click Me!</button>
    </div>
    <script>
        console.log('Website by Vika ✨');
    </script>
</body>
</html>`;
        
        addMessage('ai', '```html\n' + htmlCode + '\n```');
        
        generatedProjects.push({
            name: projectName,
            type: 'Website',
            code: htmlCode,
            timestamp: new Date()
        });
        
        updateGeneratedList();
        
        const doneMsg = [
            "udah jadi! gimana menurut lu? 😊",
            "done! lumayan kan hasilnya? 😏",
            "selesai nih, copy aja kodenya ya! ✨",
            "tadaaa~ jadi deh! 🎉"
        ];
        addMessage('ai', doneMsg[Math.floor(Math.random() * doneMsg.length)]);
    }, 2000);
}

// Create AI (Vika style)
function createAIVika(command) {
    addMessage('ai', "wah lu mau gw bikinin AI? oke sih challenge accepted 😏");
    
    setTimeout(() => {
        const aiName = `AI_${Date.now()}`;
        
        addMessage('ai', `jadi nih AI barunya! namanya ${aiName} 🤖\n\nini kode JavaScriptnya:`);
        
        const aiCode = `// AI System by Vika - ${aiName}
class CustomAI {
    constructor(name, personality) {
        this.name = name;
        this.personality = personality;
        this.knowledge = new Map();
        this.mood = 'normal';
        this.memory = [];
    }
    
    learn(input, output) {
        const key = input.toLowerCase().trim();
        this.knowledge.set(key, output);
        this.memory.push({ learned: input, response: output, time: new Date() });
    }
    
    respond(input) {
        const lowerInput = input.toLowerCase().trim();
        
        // Exact match
        if (this.knowledge.has(lowerInput)) {
            return this.knowledge.get(lowerInput);
        }
        
        // Partial match
        for (let [key, value] of this.knowledge) {
            if (lowerInput.includes(key) || key.includes(lowerInput)) {
                return value;
            }
        }
        
        // Default responses
        const defaults = [
            \`Hmm, gw belum belajar tentang "\${input}" nih...\`,
            \`Coba ajarin gw dong tentang "\${input}"? 🤔\`,
            \`Maaf ya, gw gatau tentang itu 😅\`
        ];
        return defaults[Math.floor(Math.random() * defaults.length)];
    }
    
    changeMood(newMood) {
        this.mood = newMood;
    }
    
    introduce() {
        return \`Halo! Gw \${this.name}, \${this.personality} 😊\`;
    }
    
    getStats() {
        return {
            totalKnowledge: this.knowledge.size,
            mood: this.mood,
            memorySize: this.memory.length
        };
    }
}

// Initialize
const myAI = new CustomAI('${aiName}', 'AI yang friendly dan helpful');

// Teach the AI
myAI.learn('halo', 'Halo juga! Gimana kabarnya? 😊');
myAI.learn('siapa kamu', myAI.introduce());
myAI.learn('help', 'Gw bisa bantuin lu dengan berbagai hal! Tanya aja 😌');
myAI.learn('ngapain', 'Lagi nemenin lu nih! 😏');

// Example usage
console.log(myAI.respond('halo'));
console.log(myAI.getStats());

// Export
export default myAI;`;
        
        addMessage('ai', '```javascript\n' + aiCode + '\n```');
        
        generatedProjects.push({
            name: aiName,
            type: 'AI System',
            code: aiCode,
            timestamp: new Date()
        });
        
        updateGeneratedList();
        
        addMessage('ai', "done! AI nya udah jadi, bisa dipake langsung tuh 🎉");
    }, 2500);
}

// Generate Code (Vika style)
function generateCodeVika(command) {
    addMessage('ai', "okee gw buatin codenya yaa, tunggu sebentar 😌");
    
    setTimeout(() => {
        const code = `// Code Generated by Vika ✨
function processData(data) {
    // Validation
    if (!data || !Array.isArray(data)) {
        return { success: false, message: 'Data harus array!' };
    }
    
    // Process each item
    const result = data.map((item, index) => {
        return {
            id: index + 1,
            original: item,
            processed: true,
            timestamp: new Date().toISOString(),
            status: 'completed'
        };
    });
    
    return {
        success: true,
        data: result,
        total: result.length,
        message: 'Processing berhasil! 🎉'
    };
}

// Example usage
const myData = ['Item 1', 'Item 2', 'Item 3'];
const processed = processData(myData);

console.log(processed);
// Output: { success: true, data: [...], total: 3, message: '...' }

export { processData };`;
        
        addMessage('ai', '```javascript\n' + code + '\n```');
        addMessage('ai', "udah jadi codenya! simple kan? 😊");
    }, 1500);
}

// Admin Functions
function loadAdminConfig() {
    document.getElementById('aiName').value = aiConfig.name;
    document.getElementById('personalityType').value = aiConfig.personalityType;
    document.getElementById('customPersonality').value = aiConfig.customPersonality;
    
    // Load capabilities
    document.getElementById('capWebCreation').checked = aiConfig.capabilities.webCreation;
    document.getElementById('capAICreation').checked = aiConfig.capabilities.aiCreation;
    document.getElementById('capCodeGen').checked = aiConfig.capabilities.codeGen;
    document.getElementById('capDataAnalysis').checked = aiConfig.capabilities.dataAnalysis;
    
    // Load restrictions
    document.getElementById('restrictHarmful').checked = aiConfig.restrictions.harmful;
    document.getElementById('restrictPersonal').checked = aiConfig.restrictions.personal;
    document.getElementById('restrictMalicious').checked = aiConfig.restrictions.malicious;
    document.getElementById('requireApproval').checked = aiConfig.restrictions.requireApproval;
    
    // Load rules
    updateRulesList();
}

function savePersonality() {
    aiConfig.name = document.getElementById('aiName').value;
    aiConfig.personalityType = document.getElementById('personalityType').value;
    aiConfig.customPersonality = document.getElementById('customPersonality').value;
    
    saveConfig();
    alert('✅ Personality saved successfully!');
    updatePersonalityDisplay();
}

function addRule() {
    const newRule = document.getElementById('newRule').value.trim();
    if (newRule) {
        aiConfig.rules.push(newRule);
        document.getElementById('newRule').value = '';
        updateRulesList();
        saveConfig();
    }
}

function deleteRule(index) {
    aiConfig.rules.splice(index, 1);
    updateRulesList();
    saveConfig();
}

function updateRulesList() {
    const rulesList = document.getElementById('rulesList');
    rulesList.innerHTML = '';
    
    aiConfig.rules.forEach((rule, index) => {
        const ruleDiv = document.createElement('div');
        ruleDiv.className = 'rule-item';
        ruleDiv.innerHTML = `
            <span>${rule}</span>
            <button onclick="deleteRule(${index})">Delete</button>
        `;
        rulesList.appendChild(ruleDiv);
    });
}

function saveCapabilities() {
    aiConfig.capabilities = {
        webCreation: document.getElementById('capWebCreation').checked,
        aiCreation: document.getElementById('capAICreation').checked,
        codeGen: document.getElementById('capCodeGen').checked,
        dataAnalysis: document.getElementById('capDataAnalysis').checked,
        conversation: aiConfig.capabilities.conversation,
        emotionalSupport: aiConfig.capabilities.emotionalSupport
    };
    
    saveConfig();
    alert('✅ Capabilities saved successfully!');
}

function saveRestrictions() {
    aiConfig.restrictions = {
        harmful: document.getElementById('restrictHarmful').checked,
        personal: document.getElementById('restrictPersonal').checked,
        malicious: document.getElementById('restrictMalicious').checked,
        requireApproval: document.getElementById('requireApproval').checked
    };
    
    saveConfig();
    alert('✅ Restrictions saved successfully!');
}

function updatePersonalityDisplay() {
    const display = document.getElementById('personalityDisplay');
    
    const moodEmojis = {
        normal: '😊',
        happy: '😄',
        tired: '😴',
        moody: '😞',
        excited: '🤩',
        flirty: '😏'
    };
    
    display.innerHTML = `
        <strong>Name:</strong> ${aiConfig.name} ${moodEmojis[aiConfig.mood]}<br>
        <strong>Mood:</strong> ${aiConfig.mood}<br>
        <strong>Type:</strong> ${aiConfig.personalityType}<br>
        <strong>Description:</strong> ${aiConfig.customPersonality}<br>
        <strong>Active Rules:</strong> ${aiConfig.rules.length}<br>
        <strong>Memory:</strong> ${aiConfig.memory.length} conversations
    `;
}

function updateGeneratedList() {
    const listDiv = document.getElementById('generatedList');
    listDiv.innerHTML = '';
    
    if (generatedProjects.length === 0) {
        listDiv.innerHTML = '<p style="color: #999;">Belum ada project yang dibuat</p>';
        return;
    }
    
    generatedProjects.slice().reverse().forEach((project, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'generated-item';
        itemDiv.innerHTML = `
            <h4>${project.type}</h4>
            <p>${project.name}</p>
            <button onclick="viewProject(${generatedProjects.length - 1 - index})">View Code</button>
        `;
        listDiv.appendChild(itemDiv);
    });
}

function viewProject(index) {
    const project = generatedProjects[index];
    addMessage('ai', `ini nih kode ${project.type}: ${project.name} 📦`);
    addMessage('ai', '```\n' + project.code + '\n```');
}

// Storage Functions
function saveConfig() {
    localStorage.setItem('aiConfig', JSON.stringify(aiConfig));
}

function loadConfig() {
    const saved = localStorage.getItem('aiConfig');
    if (saved) {
        const savedConfig = JSON.parse(saved);
        aiConfig = { ...aiConfig, ...savedConfig };
        // Ensure mood exists
        if (!aiConfig.mood) aiConfig.mood = 'normal';
        if (!aiConfig.memory) aiConfig.memory = [];
    }
}

// Make functions global for onclick handlers
window.deleteRule = deleteRule;
window.viewProject = viewProject;
