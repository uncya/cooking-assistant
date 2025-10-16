import React, { useState, useRef, useEffect } from 'react';
import { Send, ChefHat, Loader2 } from 'lucide-react';

export default function CookingAssistant() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'こんにちは!料理アシスタントです🍳 レシピの提案、調理方法、食材の選び方など、料理に関することなら何でもお答えします。今日は何を作りたいですか?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2000,
          messages: updatedMessages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          system: `あなたは親しみやすく知識豊富な料理アシスタントです。以下のガイドラインに従って回答してください:

1. 料理に関する質問には、具体的で実用的なアドバイスを提供する
2. レシピを提案する際は、材料、手順、調理時間、難易度を明確に示す
3. 初心者にもわかりやすく、プロのコツも交えて説明する
4. 食材の代替案や、料理をより美味しくするヒントも提供する
5. 親しみやすく、励ましの言葉も添える
6. 質問が料理に関係ない場合は、丁寧に料理の話題に戻す

常に日本語で回答し、絵文字を適度に使って楽しい雰囲気を作ってください。`
        })
      });

      const data = await response.json();
      const assistantContent = data.content[0].text;

      const assistantMessage = {
        role: 'assistant',
        content: assistantContent
      };

      setMessages([...updatedMessages, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      setMessages([...updatedMessages, {
        role: 'assistant',
        content: '申し訳ありません。エラーが発生しました。もう一度お試しください。'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestedQuestions = [
    '今日の夕食に何を作ればいい?',
    '簡単な和食のレシピを教えて',
    '鶏肉を使った料理のアイデア',
    '初心者でも作れるパスタ'
  ];

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
      {/* Header */}
      <div className="bg-white shadow-md p-4 flex items-center gap-3 border-b-4 border-orange-400">
        <div className="bg-orange-500 p-2 rounded-full">
          <ChefHat className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">料理アシスタント</h1>
          <p className="text-sm text-gray-600">あなたの料理をサポートします</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-3xl rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-800 shadow-md'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl px-4 py-3 shadow-md">
              <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
            </div>
          </div>
        )}

        {/* Suggested Questions */}
        {messages.length === 1 && !isLoading && (
          <div className="flex flex-col items-center gap-3 mt-8">
            <p className="text-gray-600 font-medium">よくある質問:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-2xl">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => setInput(question)}
                  className="bg-white hover:bg-orange-50 text-gray-700 px-4 py-2 rounded-lg shadow-sm border border-orange-200 transition-colors text-sm"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="料理について質問してください..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white p-3 rounded-full transition-colors disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}