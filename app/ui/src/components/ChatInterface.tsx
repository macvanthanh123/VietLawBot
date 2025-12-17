import { useState, useRef, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { MessageCircle, Send, Bot, User } from "lucide-react";
import { Badge } from "./ui/badge";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
  sources?: string[];
}

interface ChatInterfaceProps {
  uploadedDocuments: Array<{
    id: string;
    name: string;
    status: "processing" | "completed" | "error";
  }>;
  temperature: number;
  maxTokens: number;
  useDocs: boolean;
  responseStyle: string;
  semanticWeight: number;
  systemPrompt: string;
  model: string;
  topK: number;
}

export function ChatInterface({
  uploadedDocuments,
  temperature,
  maxTokens,
  useDocs,
  responseStyle,
  semanticWeight,
  model,
  topK,
  systemPrompt,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "bot",
      content: `Xin chào! Tôi là trợ lý AI chuyên về **pháp luật Việt Nam**.

Tôi có thể giúp bạn:

- Tra cứu văn bản pháp luật  
- Giải thích điều khoản  
- Tư vấn quy trình pháp lý  
- Phân tích tài liệu bạn tải lên  

Bạn cần hỗ trợ gì?`,
      timestamp: new Date(),
    },
  ]);

  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: userMessage.content,
          mode: "hybrid",
          top_k: topK,
          alpha: semanticWeight,
          model: model,
          prompt: systemPrompt,
        }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: data.answer || "Không có phản hồi từ server.",
        timestamp: new Date(),
        sources: data.sources?.map((s: any) => s.title || JSON.stringify(s)) || [],
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          type: "bot",
          content: "Lỗi khi gọi API backend.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickQuestions = [
    "Quy định về thời gian làm việc",
    "Các loại hình doanh nghiệp",
    "Điều kiện hợp đồng lao động",
    "Quy trình thành lập công ty",
  ];

  return (
    <Card className="h-full flex flex-col bg-white shadow-lg border-gray-200">
      {/* HEADER */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <MessageCircle className="w-5 h-5 text-blue-600" />
          <h2 className="text-gray-900">Tư Vấn Pháp Luật</h2>
        </div>
        <p className="text-sm text-gray-500">Đặt câu hỏi về pháp luật Việt Nam</p>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.type === "user" ? "flex-row-reverse" : ""
            }`}
          >
            {/* Avatar */}
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.type === "user"
                  ? "bg-gradient-to-br from-blue-600 to-indigo-600"
                  : "bg-gradient-to-br from-emerald-500 to-teal-600"
              }`}
            >
              {message.type === "user" ? (
                <User className="w-5 h-5 text-white" />
              ) : (
                <Bot className="w-5 h-5 text-white" />
              )}
            </div>

            {/* Bubble */}
            <div
              className={`flex-1 max-w-[80%] ${
                message.type === "user" ? "flex flex-col items-end" : ""
              }`}
            >
              <div
                className={`rounded-lg p-4 ${
                  message.type === "user"
                    ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                <div className="prose prose-sm max-w-none
                    prose-p:my-1 prose-ul:my-1 prose-ol:my-1
                    prose-li:my-0.5 prose-code:px-1 prose-code:py-0.5 
                    prose-code:bg-gray-200 prose-code:rounded"
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.content}
                  </ReactMarkdown>
                </div>
              </div>

              {/* SOURCES */}
              {message.sources && message.sources.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {message.sources.map((source, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                    >
                      {source}
                    </Badge>
                  ))}
                </div>
              )}

              <p className="text-xs text-gray-400 mt-1">
                {message.timestamp.toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}

        {/* TYPING INDICATOR */}
        {isTyping && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* QUICK QUESTIONS */}
      {messages.length <= 1 && (
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-600 mb-2">Câu hỏi gợi ý:</p>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((question, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                onClick={() => setInputValue(question)}
                className="text-xs"
              >
                {question}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* INPUT BOX */}
      <div className="p-6 border-t border-gray-200">
        <div className="flex gap-3">
          <Textarea
            placeholder="Nhập câu hỏi của bạn về pháp luật..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            rows={2}
            className="resize-none min-h-[60px] max-h-[120px]"
          />

          <Button
            onClick={handleSend}
            disabled={!inputValue.trim() || isTyping}
            className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white px-6"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        <p className="text-xs text-gray-500 mt-2">
          Nhấn Enter để gửi, Shift + Enter để xuống dòng
        </p>
      </div>
    </Card>
  );
}
