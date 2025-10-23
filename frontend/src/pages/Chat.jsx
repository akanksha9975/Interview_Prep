import React, { useState, useEffect, useRef } from 'react';
import { startChat, sendQuery, listDocuments } from '../api/api';
import toast from 'react-hot-toast';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [documents, setDocuments] = useState({ resume: false, jd: false });
  const [showCitationModal, setShowCitationModal] = useState(false);
  const [selectedCitation, setSelectedCitation] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    checkDocuments();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const checkDocuments = async () => {
    try {
      const response = await listDocuments();
      const docs = response.data.documents;
      const hasResume = docs.some(doc => doc.type === 'resume');
      const hasJD = docs.some(doc => doc.type === 'jd');
      setDocuments({ resume: hasResume, jd: hasJD });

      if (hasResume && hasJD) {
        initializeChat();
      }
    } catch (error) {
      toast.error('Failed to check documents');
    }
  };

  const initializeChat = async () => {
    if (initialized) return;

    setLoading(true);
    try {
      const response = await startChat();
      setMessages([
        {
          role: 'assistant',
          content: response.data.questions,
          timestamp: new Date()
        }
      ]);
      setInitialized(true);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to start chat');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!inputMessage.trim() || loading) return;

    if (!currentQuestion.trim()) {
      toast.error('Please select a question first by clicking on it');
      return;
    }

    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await sendQuery(inputMessage, currentQuestion);
      
      const assistantMessage = {
        role: 'assistant',
        content: response.data.response,
        score: response.data.score,
        citations: response.data.citations,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const selectQuestion = (question) => {
    setCurrentQuestion(question);
    toast.success('Question selected! Now provide your answer.');
  };

  const openCitationModal = (citation) => {
    setSelectedCitation(citation);
    setShowCitationModal(true);
  };

  if (!documents.resume || !documents.jd) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-4">Documents Required</h2>
          <p className="text-gray-600 mb-6">
            Please upload both your resume and job description before starting the interview practice.
          </p>
          <a
            href="/upload"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Upload Documents
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white shadow-sm border-b px-4 py-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-2xl font-bold">AI Interview Practice</h1>
          {currentQuestion && (
            <p className="text-sm text-gray-600 mt-1">
              Current Question: <span className="font-semibold">{currentQuestion.substring(0, 50)}...</span>
            </p>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-32">
        <div className="container mx-auto max-w-4xl px-4 py-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`mb-6 ${message.role === 'user' ? 'flex justify-end' : ''}`}
            >
              {message.role === 'assistant' && (
                <div className="bg-white rounded-xl shadow-md p-6 max-w-3xl">
                  <div className="flex items-start mb-2">
                    <div className="text-2xl mr-3">🤖</div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 mb-1">AI Interviewer</p>
                      <div className="text-gray-700 whitespace-pre-wrap">
                        {message.content.split('\n').map((line, i) => {
                          // Make questions clickable
                          if (line.match(/^\d+\./)) {
                            return (
                              <button
                                key={i}
                                onClick={() => selectQuestion(line)}
                                className="block w-full text-left hover:bg-blue-50 p-2 rounded transition mb-1"
                              >
                                {line}
                              </button>
                            );
                          }
                          return <p key={i} className="mb-1">{line}</p>;
                        })}
                      </div>
                      
                      {message.score && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-blue-900">Score:</span>
                            <span className="text-2xl font-bold text-blue-600">{message.score}/10</span>
                          </div>
                          {message.citations && message.citations.length > 0 && (
                            <div className="mt-3">
                              <p className="text-sm font-semibold text-gray-700 mb-2">References:</p>
                              {message.citations.map((citation, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => openCitationModal(citation)}
                                  className="text-xs text-blue-600 hover:underline mr-2 mb-1 inline-block"
                                >
                                  [{citation.type} chunk {citation.chunkIndex + 1}]
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              )}

              {message.role === 'user' && (
                <div className="bg-blue-600 text-white rounded-xl shadow-md p-4 max-w-xl">
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs text-blue-100 mt-2">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex justify-start mb-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
                  <p className="text-gray-600">AI is thinking...</p>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="container mx-auto max-w-4xl px-4 py-4">
          <div className="flex gap-3">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={currentQuestion ? "Type your answer..." : "Click on a question above to select it first..."}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              rows="2"
              disabled={loading}
              aria-label="Message input"
            />
            <button
              onClick={handleSend}
              disabled={loading || !inputMessage.trim()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              {loading ? '...' : 'Send'}
            </button>
          </div>
        </div>
      </div>

      {/* Citation Modal */}
      {showCitationModal && selectedCitation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">
                Reference from {selectedCitation.type === 'resume' ? 'Resume' : 'Job Description'}
              </h3>
              <button
                onClick={() => setShowCitationModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700">{selectedCitation.snippet}</p>
            </div>
            <button
              onClick={() => setShowCitationModal(false)}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
