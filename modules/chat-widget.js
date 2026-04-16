/**
 * ============================================
 * CHAT WIDGET - UI untuk AI Chatbot
 * Platform Administrasi Kelas Digital
 * ✅ UPDATED: Tambah suggested question buttons
 * ============================================
 */

import { getChatResponse, getFAQAnswer } from './chat-ai.js';

let chatHistory = [];
let isChatOpen = false;

// ✅ SUGGESTED QUESTIONS (tombol pilihan FAQ)
const SUGGESTED_QUESTIONS = [
    { label: 'Cara daftar?', question: 'Bagaimana cara mendaftar?' },
    { label: 'Syarat approval?', question: 'Apa syarat approval admin?' },
    { label: 'Info donasi?', question: 'Berapa biaya donasi?' },
    { label: 'Tutorial pakai?', question: 'Bagaimana tutorial penggunaan?' }
];

// ✅ FUNGSI: Initialize Chat Widget
export function initChatWidget() {
    console.log('💬 [Chat Widget] Initializing...');
    
    // Create floating button
    const floatBtn = document.createElement('button');
    floatBtn.id = 'chat-float-btn';
    floatBtn.innerHTML = '<i class="fas fa-comments"></i>';
    floatBtn.onclick = toggleChat;
    document.body.appendChild(floatBtn);
    
    // Create chat window (hidden by default)
    const chatWindow = document.createElement('div');
    chatWindow.id = 'chat-window';
    chatWindow.className = 'hidden';
    chatWindow.innerHTML = `
        <div class="chat-header">
            <div class="chat-header-title">
                <i class="fas fa-robot"></i>
                <span>Asisten Platform</span>
            </div>
            <button class="chat-close" onclick="toggleChat()">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="chat-body" id="chat-messages">
            <div class="chat-message bot">
                <div class="message-content">
                    👋 Halo! Saya asisten virtual Platform Administrasi Kelas.<br><br>
                    Saya bisa bantu tentang:<br>
                    • Cara daftar<br>
                    • Syarat approval<br>
                    • Tutorial penggunaan<br><br>
                    <strong>💡 Klik pertanyaan di bawah atau ketik sendiri:</strong>
                </div>
            </div>
            <!-- ✅ SUGGESTED QUESTIONS BUTTONS -->
            <div class="suggested-questions" id="suggested-questions"></div>
        </div>
        <div class="chat-input-area">
            <input 
                type="text" 
                id="chat-input" 
                placeholder="Ketik pertanyaan..." 
                onkeypress="handleKeyPress(event)"
            >
            <button onclick="sendMessage()" id="chat-send-btn">
                <i class="fas fa-paper-plane"></i>
            </button>
        </div>
        <div class="chat-typing" id="chat-typing" style="display:none;">
            <i class="fas fa-spinner fa-spin"></i> Asisten sedang mengetik...
        </div>
    `;
    document.body.appendChild(chatWindow);
    
    // Render suggested questions
    renderSuggestedQuestions();
    
    // Add styles
    addChatStyles();
    
    console.log('✅ [Chat Widget] Initialized');
}

// ✅ FUNGSI: Render Suggested Question Buttons
function renderSuggestedQuestions() {
    const container = document.getElementById('suggested-questions');
    if (!container) return;
    
    container.innerHTML = SUGGESTED_QUESTIONS.map(item => `
        <button class="suggested-question-btn" onclick="askSuggested('${item.question.replace(/'/g, "\\'")}')">
            ${item.label}
        </button>
    `).join('');
}

// ✅ FUNGSI: Handle Suggested Question Click
window.askSuggested = function(question) {
    const input = document.getElementById('chat-input');
    if (input) {
        input.value = question;
        sendMessage();
    }
};

// ✅ FUNGSI: Toggle Chat Window
window.toggleChat = function() {
    const chatWindow = document.getElementById('chat-window');
    const floatBtn = document.getElementById('chat-float-btn');
    
    if (!chatWindow) return;
    
    isChatOpen = !isChatOpen;
    
    if (isChatOpen) {
        chatWindow.classList.remove('hidden');
        floatBtn.classList.add('hidden');
        document.getElementById('chat-input')?.focus();
    } else {
        chatWindow.classList.add('hidden');
        floatBtn.classList.remove('hidden');
    }
};

// ✅ FUNGSI: Send Message
window.sendMessage = async function() {
    const input = document.getElementById('chat-input');
    const message = input?.value?.trim();
    
    if (!message) return;
    
    // Add user message to UI
    addMessageToChat('user', message);
    input.value = '';
    
    // Hide suggested questions after first message
    const suggestedContainer = document.getElementById('suggested-questions');
    if (suggestedContainer) {
        suggestedContainer.style.display = 'none';
    }
    
    // Show typing indicator
    showTyping(true);
    
    // Get AI response
    let response;
    try {
        response = await getChatResponse(message);
        
        // If API fails, use FAQ fallback
        if (!response.success) {
            response = { success: true, message: getFAQAnswer(message) };
        }
    } catch (error) {
        console.error('❌ [Chat Widget] Error:', error);
        response = { success: true, message: getFAQAnswer(message) };
    }
    
    // Hide typing indicator
    showTyping(false);
    
    // Add bot response to UI
    addMessageToChat('bot', response.message);
};

// ✅ FUNGSI: Handle Enter Key
window.handleKeyPress = function(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
};

// ✅ FUNGSI: Add Message to Chat
function addMessageToChat(sender, text) {
    const messagesContainer = document.getElementById('chat-messages');
    if (!messagesContainer) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;
    messageDiv.innerHTML = `
        <div class="message-content">${formatMessage(text)}</div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Save to history
    chatHistory.push({ sender, text, timestamp: new Date() });
}

// ✅ FUNGSI: Format Message (convert newlines to <br>)
function formatMessage(text) {
    if (!text) return '';
    return text
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/•/g, '&bull;');
}

// ✅ FUNGSI: Show/Hide Typing Indicator
function showTyping(show) {
    const typingIndicator = document.getElementById('chat-typing');
    const sendBtn = document.getElementById('chat-send-btn');
    
    if (typingIndicator) {
        typingIndicator.style.display = show ? 'block' : 'none';
    }
    
    if (sendBtn) {
        sendBtn.disabled = show;
        sendBtn.style.opacity = show ? '0.5' : '1';
    }
}

// ✅ FUNGSI: Add Chat Styles
function addChatStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* Floating Button */
        #chat-float-btn {
            position: fixed;
            bottom: 24px;
            right: 24px;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(135deg, #7c3aed 0%, #0891b2 100%);
            color: white;
            border: none;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(124,58,237,0.3);
            z-index: 9999;
            font-size: 24px;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        
        #chat-float-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(124,58,237,0.4);
        }
        
        /* Chat Window */
        #chat-window {
            position: fixed;
            bottom: 100px;
            right: 24px;
            width: 350px;
            max-width: calc(100vw - 48px);
            height: 500px;
            max-height: calc(100vh - 120px);
            background: white;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.15);
            z-index: 9999;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
        
        #chat-window.hidden {
            display: none;
        }
        
        /* Chat Header */
        .chat-header {
            background: linear-gradient(135deg, #7c3aed 0%, #0891b2 100%);
            color: white;
            padding: 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .chat-header-title {
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 600;
        }
        
        .chat-close {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            font-size: 18px;
            padding: 4px;
        }
        
        /* Chat Body */
        .chat-body {
            flex: 1;
            padding: 16px;
            overflow-y: auto;
            background: #f9fafb;
        }
        
        /* Chat Messages */
        .chat-message {
            margin-bottom: 12px;
            display: flex;
        }
        
        .chat-message.user {
            justify-content: flex-end;
        }
        
        .chat-message.bot {
            justify-content: flex-start;
        }
        
        .message-content {
            max-width: 80%;
            padding: 12px 16px;
            border-radius: 12px;
            font-size: 14px;
            line-height: 1.5;
        }
        
        .chat-message.user .message-content {
            background: #7c3aed;
            color: white;
            border-bottom-right-radius: 4px;
        }
        
        .chat-message.bot .message-content {
            background: white;
            color: #374151;
            border-bottom-left-radius: 4px;
            box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
        
        /* ✅ SUGGESTED QUESTIONS */
        .suggested-questions {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            padding: 8px 0 16px 0;
            margin-top: 8px;
        }
        
        .suggested-question-btn {
            background: white;
            border: 1px solid #7c3aed;
            color: #7c3aed;
            padding: 6px 12px;
            border-radius: 16px;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s;
            font-weight: 500;
        }
        
        .suggested-question-btn:hover {
            background: #7c3aed;
            color: white;
        }
        
        /* Chat Input */
        .chat-input-area {
            display: flex;
            padding: 12px;
            background: white;
            border-top: 1px solid #e5e7eb;
            gap: 8px;
        }
        
        #chat-input {
            flex: 1;
            padding: 10px 14px;
            border: 1px solid #e5e7eb;
            border-radius: 20px;
            font-size: 14px;
            outline: none;
        }
        
        #chat-input:focus {
            border-color: #7c3aed;
        }
        
        #chat-send-btn {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #7c3aed;
            color: white;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s;
        }
        
        #chat-send-btn:hover {
            background: #6d28d9;
        }
        
        #chat-send-btn:disabled {
            background: #9ca3af;
            cursor: not-allowed;
        }
        
        /* Typing Indicator */
        .chat-typing {
            padding: 8px 16px;
            background: #f9fafb;
            color: #6b7280;
            font-size: 13px;
            border-top: 1px solid #e5e7eb;
        }
        
        /* Mobile Responsive */
        @media (max-width: 480px) {
            #chat-window {
                width: calc(100vw - 32px);
                right: 16px;
                bottom: 90px;
                height: calc(100vh - 150px);
            }
            
            #chat-float-btn {
                width: 50px;
                height: 50px;
                font-size: 20px;
            }
            
            .suggested-questions {
                gap: 6px;
            }
            
            .suggested-question-btn {
                font-size: 11px;
                padding: 5px 10px;
            }
        }
    `;
    document.head.appendChild(style);
}

console.log('🟢 [Chat Widget] Module READY');
