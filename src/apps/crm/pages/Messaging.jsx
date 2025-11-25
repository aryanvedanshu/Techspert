import { useState } from 'react'
import {
    Search, Send, Paperclip, Phone, Video,
    MoreVertical, Check, CheckCheck, Clock
} from 'lucide-react'

const MOCK_CONVERSATIONS = [
    { id: 1, name: 'Alice Johnson', lastMessage: 'Thanks for the info!', time: '10:30 AM', unread: 2, avatar: 'A', status: 'online' },
    { id: 2, name: 'Bob Smith', lastMessage: 'When is the next batch?', time: 'Yesterday', unread: 0, avatar: 'B', status: 'offline' },
    { id: 3, name: 'Charlie Brown', lastMessage: 'I have a question about...', time: 'Tue', unread: 0, avatar: 'C', status: 'away' },
]

const MOCK_MESSAGES = [
    { id: 1, sender: 'me', content: 'Hi Alice, thanks for reaching out!', time: '10:00 AM', status: 'read' },
    { id: 2, sender: 'Alice Johnson', content: 'Hi! I was wondering about the full stack course.', time: '10:05 AM' },
    { id: 3, sender: 'me', content: 'Great choice! It covers React, Node, and more.', time: '10:15 AM', status: 'read' },
    { id: 4, sender: 'Alice Johnson', content: 'Thanks for the info!', time: '10:30 AM' },
]

const Messaging = () => {
    const [selectedChat, setSelectedChat] = useState(MOCK_CONVERSATIONS[0])
    const [messageInput, setMessageInput] = useState('')

    return (
        <div className="h-[calc(100vh-120px)] bg-neutral-900 rounded-2xl border border-neutral-800 flex overflow-hidden">
            {/* Sidebar - Conversations List */}
            <div className="w-80 border-r border-neutral-800 flex flex-col bg-neutral-900">
                <div className="p-4 border-b border-neutral-800">
                    <h2 className="text-xl font-bold text-white mb-4">Messages</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            className="w-full bg-neutral-950 border border-neutral-800 text-white pl-10 pr-4 py-2 rounded-xl focus:outline-none focus:border-primary-500 text-sm"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {MOCK_CONVERSATIONS.map((chat) => (
                        <div
                            key={chat.id}
                            onClick={() => setSelectedChat(chat)}
                            className={`p-4 flex gap-3 cursor-pointer hover:bg-neutral-800 transition-colors ${selectedChat?.id === chat.id ? 'bg-neutral-800 border-l-2 border-primary-500' : 'border-l-2 border-transparent'}`}
                        >
                            <div className="relative">
                                <div className="w-12 h-12 rounded-full bg-neutral-700 flex items-center justify-center text-lg font-bold text-white">
                                    {chat.avatar}
                                </div>
                                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-neutral-900 ${chat.status === 'online' ? 'bg-green-500' :
                                        chat.status === 'away' ? 'bg-yellow-500' : 'bg-neutral-500'
                                    }`}></div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-medium text-white truncate">{chat.name}</h3>
                                    <span className="text-xs text-neutral-500 whitespace-nowrap">{chat.time}</span>
                                </div>
                                <p className="text-sm text-neutral-400 truncate">{chat.lastMessage}</p>
                            </div>
                            {chat.unread > 0 && (
                                <div className="flex flex-col justify-center">
                                    <span className="w-5 h-5 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center font-bold">
                                        {chat.unread}
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-neutral-950">
                {/* Chat Header */}
                <div className="h-16 border-b border-neutral-800 flex items-center justify-between px-6 bg-neutral-900">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center font-bold text-white">
                            {selectedChat.avatar}
                        </div>
                        <div>
                            <h3 className="font-bold text-white">{selectedChat.name}</h3>
                            <span className="text-xs text-green-500 flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                Online
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors">
                            <Phone size={20} />
                        </button>
                        <button className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors">
                            <Video size={20} />
                        </button>
                        <button className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors">
                            <MoreVertical size={20} />
                        </button>
                    </div>
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    {MOCK_MESSAGES.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${msg.sender === 'me'
                                    ? 'bg-primary-600 text-white rounded-tr-none'
                                    : 'bg-neutral-800 text-neutral-200 rounded-tl-none'
                                }`}>
                                <p className="text-sm leading-relaxed">{msg.content}</p>
                                <div className={`flex items-center gap-1 mt-1 text-[10px] ${msg.sender === 'me' ? 'text-primary-200 justify-end' : 'text-neutral-500'}`}>
                                    <span>{msg.time}</span>
                                    {msg.sender === 'me' && (
                                        msg.status === 'read' ? <CheckCheck size={12} /> : <Check size={12} />
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-neutral-900 border-t border-neutral-800">
                    <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 rounded-xl p-2">
                        <button className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors">
                            <Paperclip size={20} />
                        </button>
                        <input
                            type="text"
                            placeholder="Type a message..."
                            className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-neutral-500"
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && setMessageInput('')}
                        />
                        <button className="p-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors shadow-lg shadow-primary-600/20">
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Messaging
